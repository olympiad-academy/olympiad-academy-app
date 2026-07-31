#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createConnection } from "node:net";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, "../..");
const mobileRoot = resolve(workspaceRoot, "apps/mobile");
const apiPackageName = "@olympiad-academy-app/api";
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const managedChildren = new Set();
const managedChildStates = new WeakMap();
const tcpProbeHosts = ["127.0.0.1", "::1"];
const iosExpoGoAppId = "host.exp.Exponent";

function readEnv(name, fallback) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function parsePort(name, fallback) {
  const rawValue = readEnv(name, fallback);
  const port = Number(rawValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `${name} must be an integer TCP port between 1 and 65535 for mobile E2E, received ${rawValue}.`,
    );
  }
  return port;
}

function normalizePlatform(value) {
  const normalized = value.toLowerCase();
  if (normalized !== "ios" && normalized !== "android") {
    throw new Error(`MOBILE_E2E_PLATFORM must be "ios" or "android", received ${value}.`);
  }
  return normalized;
}

function defaultPlatform() {
  return process.platform === "darwin" ? "ios" : "android";
}

function delay(ms) {
  return new Promise((resolveTimer) => setTimeout(resolveTimer, ms));
}

function isChildExited(child) {
  return child.exitCode !== null || child.signalCode !== null;
}

function managedProcessExitError(child, label) {
  const state = managedChildStates.get(child);
  if (state?.spawnError instanceof Error) {
    return new Error(`${label} failed to start: ${state.spawnError.message}`);
  }
  if (child.exitCode !== null) {
    if (isManagedProcessTreeAlive(child)) return null;
    return new Error(`${label} exited before readiness with exit ${child.exitCode}.`);
  }
  if (child.signalCode !== null) {
    if (isManagedProcessTreeAlive(child)) return null;
    return new Error(`${label} stopped before readiness with signal ${child.signalCode}.`);
  }
  return null;
}

function assertManagedProcessRunning(child, label) {
  const error = managedProcessExitError(child, label);
  if (error !== null) throw error;
}

function probeTcpPort(host, port) {
  return new Promise((resolveProbe, rejectProbe) => {
    const socket = createConnection({ host, port });
    let settled = false;
    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      socket.removeAllListeners();
      socket.destroy();
      callback(value);
    };

    socket.setTimeout(1_000);
    socket.once("connect", () => settle(resolveProbe, true));
    socket.once("timeout", () =>
      settle(rejectProbe, new Error(`Timed out while checking ${host}:${port}.`)),
    );
    socket.once("error", (error) => {
      if (["ECONNREFUSED", "EHOSTUNREACH", "ENETUNREACH", "EADDRNOTAVAIL"].includes(error.code)) {
        settle(resolveProbe, false);
        return;
      }
      settle(rejectProbe, error);
    });
  });
}

async function assertTcpPortFree(port, label, envName) {
  for (const host of tcpProbeHosts) {
    let occupied;
    try {
      occupied = await probeTcpPort(host, port);
    } catch (error) {
      throw new Error(
        `Could not verify ${label} port ${port} on ${host} before mobile E2E startup: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
    if (occupied) {
      throw new Error(
        `${label} port ${port} (${envName}) is already accepting connections on ${host}. ` +
          `Stop the stale service or choose a free ${envName}; refusing to run Maestro against an unknown pre-existing service.`,
      );
    }
  }
}

function spawnProcess(command, args, options = {}) {
  const managed = options.managed === true;
  const child = spawn(command, args, {
    cwd: options.cwd ?? workspaceRoot,
    env: options.env ?? process.env,
    stdio: options.stdio ?? "inherit",
    detached: managed && process.platform !== "win32",
  });
  if (managed) {
    managedChildren.add(child);
    const state = { spawnError: null };
    managedChildStates.set(child, state);
    child.once("error", (error) => {
      state.spawnError = error;
    });
  }
  return child;
}

function run(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawnProcess(command, args, options);
    child.once("error", rejectRun);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolveRun();
        return;
      }
      const suffix = signal === null ? `exit ${code}` : `signal ${signal}`;
      rejectRun(new Error(`${command} ${args.join(" ")} failed with ${suffix}.`));
    });
  });
}

function runWithOutput(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawnProcess(command, args, {
      ...options,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.setEncoding("utf8");
    child.stderr?.setEncoding("utf8");
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", rejectRun);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolveRun({ stdout, stderr });
        return;
      }
      const suffix = signal === null ? `exit ${code}` : `signal ${signal}`;
      const output = `${stderr}${stdout}`.trim();
      rejectRun(
        new Error(
          `${command} ${args.join(" ")} failed with ${suffix}.${
            output.length > 0 ? `\n${output}` : ""
          }`,
        ),
      );
    });
  });
}

async function waitForHttpOk(
  url,
  label,
  timeoutMs = 120_000,
  managedProcess = null,
  processLabel = label,
) {
  const startedAt = Date.now();
  let lastError = null;
  while (Date.now() - startedAt < timeoutMs) {
    if (managedProcess !== null) assertManagedProcessRunning(managedProcess, processLabel);
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        if (managedProcess !== null) assertManagedProcessRunning(managedProcess, processLabel);
        return;
      }
      lastError = new Error(`${label} returned HTTP ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await delay(1_000);
  }
  throw new Error(
    `${label} did not become ready at ${url}: ${lastError instanceof Error ? lastError.message : "unknown error"}`,
  );
}

async function waitForMetro(port, managedProcess) {
  const url = `http://127.0.0.1:${port}/status`;
  const startedAt = Date.now();
  let lastBody = "";
  while (Date.now() - startedAt < 120_000) {
    assertManagedProcessRunning(managedProcess, "Expo Metro dev server");
    try {
      const response = await fetch(url, { cache: "no-store" });
      lastBody = await response.text();
      if (response.ok && lastBody.includes("packager-status:running")) {
        assertManagedProcessRunning(managedProcess, "Expo Metro dev server");
        return;
      }
    } catch (error) {
      lastBody = error instanceof Error ? error.message : "unknown error";
    }
    await delay(1_000);
  }
  throw new Error(`Expo Metro did not become ready at ${url}: ${lastBody}`);
}

async function readExpoConfig() {
  const configPath = resolve(mobileRoot, "app.json");
  const parsed = JSON.parse(await readFile(configPath, "utf8"));
  return parsed.expo && typeof parsed.expo === "object" ? parsed.expo : {};
}

async function listMaestroFlowFiles() {
  const maestroRoot = resolve(mobileRoot, "e2e/maestro");
  const entries = await readdir(maestroRoot, { withFileTypes: true });
  const flowFiles = entries
    .filter((entry) => entry.isFile() && /\.ya?ml$/iu.test(entry.name))
    .map((entry) => `e2e/maestro/${entry.name}`)
    .sort((left, right) => left.localeCompare(right));
  if (flowFiles.length === 0) {
    throw new Error("No Maestro YAML flow files were found in apps/mobile/e2e/maestro.");
  }
  return flowFiles;
}

function appIdFor({ runtime, platform, expoConfig }) {
  const explicit = readEnv("MAESTRO_APP_ID", "");
  if (explicit !== "") return explicit;
  if (runtime === "expo-go") return platform === "ios" ? iosExpoGoAppId : "host.exp.exponent";
  if (platform === "ios") {
    const ios = expoConfig.ios && typeof expoConfig.ios === "object" ? expoConfig.ios : {};
    if (typeof ios.bundleIdentifier === "string" && ios.bundleIdentifier.length > 0) {
      return ios.bundleIdentifier;
    }
  }
  const android =
    expoConfig.android && typeof expoConfig.android === "object" ? expoConfig.android : {};
  if (typeof android.package === "string" && android.package.length > 0) return android.package;
  return "com.vibeengineer.generated";
}

function openLinkFor({ runtime, expoPort, expoConfig }) {
  const explicit = readEnv("EXPO_E2E_URL", "");
  if (explicit !== "") return explicit;
  if (runtime === "expo-go") return `exp://127.0.0.1:${expoPort}`;
  return typeof expoConfig.scheme === "string" && expoConfig.scheme.length > 0
    ? `${expoConfig.scheme}://`
    : `exp://127.0.0.1:${expoPort}`;
}

function readExplicitIosSimulatorUdid() {
  const e2eUdid = readEnv("MOBILE_E2E_IOS_SIMULATOR_UDID", "");
  const maestroUdid = readEnv("MAESTRO_DEVICE_ID", "");
  if (e2eUdid !== "" && maestroUdid !== "" && e2eUdid !== maestroUdid) {
    throw new Error(
      "MOBILE_E2E_IOS_SIMULATOR_UDID and MAESTRO_DEVICE_ID must match so Expo Go priming and Maestro run on the same iOS simulator.",
    );
  }
  return e2eUdid !== "" ? e2eUdid : maestroUdid;
}

function bootedIosSimulatorsFromSimctl(simctlList) {
  const devicesByRuntime = simctlList?.devices;
  if (!devicesByRuntime || typeof devicesByRuntime !== "object") {
    throw new Error(
      "xcrun simctl did not return a devices object while selecting an iOS simulator.",
    );
  }
  const booted = [];
  for (const [runtimeName, devices] of Object.entries(devicesByRuntime)) {
    if (!/iOS/iu.test(runtimeName) || !Array.isArray(devices)) continue;
    for (const device of devices) {
      if (!device || typeof device !== "object") continue;
      if (device.state !== "Booted" || typeof device.udid !== "string") continue;
      booted.push({
        name: typeof device.name === "string" ? device.name : "unknown iOS simulator",
        udid: device.udid,
      });
    }
  }
  return booted;
}

async function resolveIosSimulatorUdid() {
  if (process.platform !== "darwin") {
    throw new Error(
      "Expo-Go iOS mobile E2E requires macOS xcrun to bind Maestro to an iOS simulator.",
    );
  }
  const explicit = readExplicitIosSimulatorUdid();
  if (explicit !== "") return explicit;

  const { stdout } = await runWithOutput("xcrun", ["simctl", "list", "devices", "booted", "-j"]);
  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch (error) {
    throw new Error(
      `Could not parse xcrun simctl booted devices JSON: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
  }
  const booted = bootedIosSimulatorsFromSimctl(parsed);
  if (booted.length !== 1) {
    const found = booted.map((device) => `${device.name} (${device.udid})`).join(", ");
    throw new Error(
      `Expected exactly one booted iOS simulator for Expo-Go mobile E2E; found ${booted.length}${
        found.length > 0 ? `: ${found}` : ""
      }. Set MOBILE_E2E_IOS_SIMULATOR_UDID or MAESTRO_DEVICE_ID to bind Expo Go priming and Maestro to one simulator.`,
    );
  }
  return booted[0].udid;
}

async function primeIosExpoGoDeepLink({ appId, openLink }) {
  const simulatorUdid = await resolveIosSimulatorUdid();
  console.log(
    `Priming iOS Expo Go deep-link routing on simulator ${simulatorUdid} with ${openLink}.`,
  );
  await run("xcrun", ["simctl", "openurl", simulatorUdid, openLink]);
  await delay(3_000);
  await run("xcrun", ["simctl", "terminate", simulatorUdid, appId]);
  return simulatorUdid;
}

function signalManagedProcess(child, signal) {
  if (typeof child.pid !== "number") return false;
  try {
    if (process.platform !== "win32") {
      process.kill(-child.pid, signal);
      return true;
    }
    return child.kill(signal);
  } catch (error) {
    if (error && error.code === "ESRCH") return false;
    throw error;
  }
}

function isManagedProcessTreeAlive(child) {
  if (typeof child.pid !== "number") return false;
  if (process.platform === "win32") return !isChildExited(child);
  try {
    process.kill(-child.pid, 0);
    return true;
  } catch (error) {
    if (error && error.code === "ESRCH") return false;
    if (error && error.code === "EPERM") return true;
    throw error;
  }
}

async function waitForManagedProcessTreeExit(child, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const treeAlive = isManagedProcessTreeAlive(child);
    if (process.platform === "win32") {
      if (!treeAlive) return true;
    } else if (!treeAlive && isChildExited(child)) {
      return true;
    }
    await delay(100);
  }
  const treeAlive = isManagedProcessTreeAlive(child);
  return process.platform === "win32" ? !treeAlive : !treeAlive && isChildExited(child);
}

async function terminateManagedChild(child) {
  const state = managedChildStates.get(child);
  if (state?.spawnError instanceof Error || typeof child.pid !== "number") {
    managedChildren.delete(child);
    return;
  }

  signalManagedProcess(child, "SIGTERM");
  if (!(await waitForManagedProcessTreeExit(child, 5_000))) {
    signalManagedProcess(child, "SIGKILL");
    if (!(await waitForManagedProcessTreeExit(child, 5_000))) {
      throw new Error(`managed process tree ${child.pid} did not exit after SIGKILL`);
    }
  }
  managedChildren.delete(child);
}

async function terminateManagedChildren() {
  const results = await Promise.allSettled(
    [...managedChildren].map((child) => terminateManagedChild(child)),
  );
  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length > 0) {
    throw new Error(
      `Failed to terminate managed mobile E2E process tree(s): ${failures
        .map((failure) =>
          failure.reason instanceof Error ? failure.reason.message : "unknown error",
        )
        .join("; ")}`,
    );
  }
}

async function main() {
  const apiPort = parsePort("API_PORT", "3000");
  const expoPort = parsePort("EXPO_PORT", "8081");
  if (apiPort === expoPort) {
    throw new Error("API_PORT and EXPO_PORT must be different ports for mobile E2E.");
  }
  const platform = normalizePlatform(readEnv("MOBILE_E2E_PLATFORM", defaultPlatform()));
  const runtime = readEnv("MOBILE_E2E_RUNTIME", "expo-go");
  if (runtime !== "expo-go" && runtime !== "native") {
    throw new Error('MOBILE_E2E_RUNTIME must be "expo-go" or "native".');
  }

  await assertTcpPortFree(apiPort, "API", "API_PORT");
  await assertTcpPortFree(expoPort, "Expo Metro", "EXPO_PORT");

  await run(pnpmCommand, ["--dir", workspaceRoot, "run", "db:start"]);
  await run(pnpmCommand, ["--dir", workspaceRoot, "run", "db:migrate"]);

  // Start the API with a one-shot tsx process for E2E-managed lifecycle.
  // Watch-mode package scripts report the intentional cleanup SIGTERM as a
  // lifecycle failure after successful flows.
  const apiProcess = spawnProcess(
    pnpmCommand,
    ["--dir", workspaceRoot, "--filter", apiPackageName, "exec", "tsx", "src/main.ts"],
    { managed: true },
  );
  await waitForHttpOk(
    `http://127.0.0.1:${apiPort}/health/ready`,
    "API readiness",
    120_000,
    apiProcess,
    "API E2E server",
  );

  const expoCommandLabel =
    runtime === "native" ? `expo run:${platform}` : "expo start (Metro only)";
  // Expo Go launch is owned by the Maestro flow. Passing --ios/--android to
  // expo start also opens Expo Go and can race the clear-state/openLink sequence,
  // leaving the first flow on the Expo Go home screen instead of the generated app.
  const expoArgs =
    runtime === "native"
      ? ["--dir", mobileRoot, "exec", "expo", `run:${platform}`, "--port", String(expoPort)]
      : [
          "--dir",
          mobileRoot,
          "exec",
          "expo",
          "start",
          "--host",
          "localhost",
          "--port",
          String(expoPort),
        ];
  console.log(`Starting mobile E2E app runtime with ${expoCommandLabel}.`);
  const expoProcess = spawnProcess(pnpmCommand, expoArgs, { managed: true });
  await waitForMetro(expoPort, expoProcess);

  const expoConfig = await readExpoConfig();
  const maestroVariables = {
    MAESTRO_APP_ID: appIdFor({ runtime, platform, expoConfig }),
    EXPO_E2E_URL: openLinkFor({ runtime, expoPort, expoConfig }),
  };
  const maestroDeviceUdid =
    runtime === "expo-go" && platform === "ios"
      ? await primeIosExpoGoDeepLink({
          appId: maestroVariables.MAESTRO_APP_ID,
          openLink: maestroVariables.EXPO_E2E_URL,
        })
      : "";
  const maestroEnv = {
    ...process.env,
    ...maestroVariables,
    ...(maestroDeviceUdid !== "" ? { MAESTRO_DEVICE_ID: maestroDeviceUdid } : {}),
  };
  const maestroDeviceArgs = maestroDeviceUdid !== "" ? ["--udid", maestroDeviceUdid] : [];
  const maestroFlowFiles = await listMaestroFlowFiles();
  for (const [index, flowFile] of maestroFlowFiles.entries()) {
    const maestroArgs = [
      "test",
      ...maestroDeviceArgs,
      "-e",
      `MAESTRO_APP_ID=${maestroVariables.MAESTRO_APP_ID}`,
      "-e",
      `EXPO_E2E_URL=${maestroVariables.EXPO_E2E_URL}`,
      flowFile,
    ];
    assertManagedProcessRunning(apiProcess, "API E2E server");
    assertManagedProcessRunning(expoProcess, "Expo Metro dev server");
    console.log(`Running maestro test ${flowFile} (${index + 1}/${maestroFlowFiles.length}).`);
    await run("maestro", maestroArgs, { cwd: mobileRoot, env: maestroEnv });
  }
}

try {
  await main();
} finally {
  await terminateManagedChildren();
}
