#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const TASKS = Object.freeze({
  typecheck: [{ command: "pnpm", args: ["run", "typecheck"] }],
  lint_format: [
    { command: "pnpm", args: ["run", "lint"] },
    { command: "pnpm", args: ["run", "format:check"] },
  ],
  unit: [{ command: "pnpm", args: ["run", "test:unit"] }],
  build_package: [{ command: "pnpm", args: ["run", "build"] }],
});

const OUTPUTS = Object.freeze({
  typecheck: ".vibe/evidence/vibe-runner/typecheck.json",
  lint_format: ".vibe/evidence/vibe-runner/lint_format.json",
  unit: ".vibe/evidence/vibe-runner/unit.json",
  build_package: ".vibe/evidence/vibe-runner/build_package.json",
});

const MAX_CAPTURE_BYTES = 80_000;

function boundedAppend(current, chunk) {
  const next = `${current}${chunk}`;
  if (Buffer.byteLength(next, "utf8") <= MAX_CAPTURE_BYTES) return next;
  return `${next.slice(0, MAX_CAPTURE_BYTES)}\n[starter-verify-runner: output truncated]\n`;
}

function runCommand(command, args) {
  return new Promise((resolveCommand) => {
    const startedAt = new Date().toISOString();
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout = boundedAppend(stdout, String(chunk));
    });
    child.stderr.on("data", (chunk) => {
      stderr = boundedAppend(stderr, String(chunk));
    });
    child.on("error", (error) => {
      resolveCommand({
        command,
        args,
        startedAt,
        endedAt: new Date().toISOString(),
        exitCode: null,
        error: error instanceof Error ? error.message : "Unknown spawn error.",
        stdout,
        stderr,
      });
    });
    child.on("close", (code, signal) => {
      resolveCommand({
        command,
        args,
        startedAt,
        endedAt: new Date().toISOString(),
        exitCode: code,
        signal,
        stdout,
        stderr,
      });
    });
  });
}

async function main() {
  const task = process.argv[2] ?? "";
  const commands = TASKS[task];
  const outputPath = OUTPUTS[task];
  if (!Array.isArray(commands) || typeof outputPath !== "string") {
    process.stderr.write(
      `Unsupported starter verification task '${task}'. Expected one of: ${Object.keys(TASKS).join(", ")}\n`,
    );
    process.exitCode = 2;
    return;
  }

  const startedAt = new Date().toISOString();
  const results = [];
  for (const spec of commands) {
    results.push(await runCommand(spec.command, spec.args));
    if (results[results.length - 1].exitCode !== 0) break;
  }
  const passed = results.every((result) => result.exitCode === 0);
  const summary = {
    schemaVersion: "vibe-engineer.starter.verify-runner-result.v1",
    task,
    status: passed ? "passed" : "failed",
    startedAt,
    endedAt: new Date().toISOString(),
    workingDirectory: process.cwd(),
    commands: results,
  };

  const resolvedOutput = resolve(process.cwd(), outputPath);
  await mkdir(dirname(resolvedOutput), { recursive: true });
  await writeFile(resolvedOutput, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  process.exitCode = passed ? 0 : 1;
}

await main();
