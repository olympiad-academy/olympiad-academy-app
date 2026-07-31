#!/usr/bin/env node
import { spawn } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync, readSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { clearTimeout, setTimeout } from "node:timers";
import { dirname, resolve } from "node:path";

const RUNNER_ID = "architecture-agent-review";
const SCHEMA_VERSION = "vibe-engineer.architecture-agent-review.v1";
const OUTPUT_PATH = ".vibe/evidence/architecture-agent-review/review.json";
const PROMPT_TEMPLATE_PATH = ".vibe/verification/architecture-agent-review/prompt.md";
const SCHEMA_PATH = ".vibe/schemas/architecture-agent-review.schema.json";
const SELECTED_HARNESS_PATH = ".vibe/harness/selected-harness.json";
const EFFECTIVE_PROMPT_PATH = ".vibe/evidence/architecture-agent-review/effective-prompt.md";
const LAST_MESSAGE_PATH = ".vibe/evidence/architecture-agent-review/harness-last-message.txt";
const MAX_DIFF_BYTES = 120000;
const MAX_UNTRACKED_FILES = 25;
const MAX_UNTRACKED_FILE_BYTES = 4096;
const SELF_EVIDENCE_PATH_PREFIX = ".vibe/evidence/architecture-agent-review/";
const MAX_CAPTURE_BYTES = 800000;
const HARNESS_TIMEOUT_MS = 30000;
const SHORT_TIMEOUT_MS = 10000;
const SUPPORTED = new Set(["pi", "claude-code", "codex"]);

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function projectPath(relativePath) {
  return resolve(process.cwd(), ...relativePath.split("/"));
}

async function readJson(relativePath) {
  const text = await readFile(projectPath(relativePath), "utf8");
  return JSON.parse(text);
}

function byteLength(text) {
  return Buffer.byteLength(text, "utf8");
}

function truncateText(text, maxBytes) {
  if (byteLength(text) <= maxBytes) return { text, truncated: false };
  let out = text;
  while (byteLength(out) > maxBytes) out = out.slice(0, Math.max(0, out.length - 1024));
  return {
    text: out + "\n[architecture-agent-review: truncated]\n",
    truncated: true,
  };
}

function boundedAppend(current, chunk) {
  const next = current + chunk;
  if (byteLength(next) <= MAX_CAPTURE_BYTES) return next;
  return truncateText(next, MAX_CAPTURE_BYTES).text;
}

function runProcess(command, args, options = {}) {
  return new Promise((resolveRun) => {
    const startedAt = new Date().toISOString();
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timeoutMs = options.timeoutMs ?? HARNESS_TIMEOUT_MS;
    const timer = setTimeout(() => {
      if (settled) return;
      child.kill("SIGTERM");
      setTimeout(() => {
        if (child.exitCode === null) child.kill("SIGKILL");
      }, 100);
    }, timeoutMs);
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolveRun({
        command,
        args,
        startedAt,
        endedAt: new Date().toISOString(),
        stdout,
        stderr,
        ...result,
      });
    };
    child.stdout.on("data", (chunk) => {
      stdout = boundedAppend(stdout, String(chunk));
    });
    child.stderr.on("data", (chunk) => {
      stderr = boundedAppend(stderr, String(chunk));
    });
    child.on("error", (error) => {
      finish({
        exitCode: null,
        signal: null,
        errorCode: typeof error.code === "string" ? error.code : null,
        errorMessage: error.message,
        timedOut: false,
      });
    });
    child.on("close", (code, signal) => {
      finish({
        exitCode: typeof code === "number" ? code : null,
        signal: typeof signal === "string" ? signal : null,
        errorCode: null,
        errorMessage: null,
        timedOut: signal === "SIGTERM" || signal === "SIGKILL",
      });
    });
  });
}

function safeJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function finding(path, reason, boundary = "cross-cutting", severity = "critical") {
  return { path, reason, boundary, severity };
}

function diagnostic(code, reason, path = SELECTED_HARNESS_PATH) {
  return { code, reason, path };
}

function collectHarnessDiagnosticText(text) {
  const messages = [];
  if (typeof text !== "string" || text.trim().length === 0) return messages;
  for (const value of parseJsonLenient(text)) {
    if (!isRecord(value)) continue;
    for (const nested of nestedValues(value)) {
      if (typeof nested === "string" && nested.trim().length > 0) messages.push(nested.trim());
    }
  }
  messages.push(text.trim());
  return messages;
}

function usefulHarnessDiagnosticText(run) {
  const ignored = /^Reading (?:additional input|prompt) from stdin...$/iu;
  const candidates = [
    run.errorMessage,
    ...collectHarnessDiagnosticText(run.stdout),
    ...collectHarnessDiagnosticText(run.stderr),
    run.stderr,
    run.stdout,
  ];
  const seen = new Set();
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const text = candidate.replaceAll(/\s+/gu, " ").trim();
    if (text.length === 0 || ignored.test(text) || seen.has(text)) continue;
    seen.add(text);
    return text;
  }
  return "selected harness exited non-zero without a machine-readable diagnostic";
}

function classifyHarnessFailure(run) {
  if (run.errorCode === "ENOENT") {
    return {
      code: "HARNESS_CLI_MISSING",
      reason: run.errorMessage || "selected harness CLI binary was not found",
    };
  }
  if (run.timedOut)
    return {
      code: "HARNESS_RUNTIME_UNAVAILABLE",
      reason: "selected harness invocation timed out",
    };
  const reason = usefulHarnessDiagnosticText(run);
  const haystack = reason.toLowerCase();
  if (
    /auth|oauth|login|log in|api key|apikey|credential|not authenticated|unauthorized/u.test(
      haystack,
    )
  ) {
    return { code: "HARNESS_AUTH_MISSING", reason };
  }
  if (
    /trust|trusted workspace|permission denied|not permitted|permissions? required|hook trust/u.test(
      haystack,
    )
  ) {
    return { code: "HARNESS_PROJECT_TRUST_REQUIRED", reason };
  }
  return { code: "HARNESS_RUNTIME_UNAVAILABLE", reason };
}

async function finish(status, fields) {
  const evidence = {
    schemaVersion: SCHEMA_VERSION,
    runnerId: RUNNER_ID,
    status,
    generatedAt: new Date().toISOString(),
    projectRoot: process.cwd(),
    summary:
      fields.summary ??
      (status === "passed"
        ? "Architecture agent review passed."
        : "Architecture agent review did not pass."),
    selectedHarness: fields.selectedHarness ?? null,
    starterScope: fields.starterScope ?? null,
    reviewedBoundaries: fields.reviewedBoundaries ?? [],
    omittedBoundaries: fields.omittedBoundaries ?? [],
    diff: fields.diff ?? null,
    findings: fields.findings ?? [],
    diagnostics: fields.diagnostics ?? [],
    harnessInvocation: fields.harnessInvocation ?? null,
    artifacts: {
      promptTemplatePath: PROMPT_TEMPLATE_PATH,
      effectivePromptPath: EFFECTIVE_PROMPT_PATH,
      outputSchemaPath: SCHEMA_PATH,
      outputPath: OUTPUT_PATH,
    },
    noFallbackToPi: fields.noFallbackToPi === true,
  };
  const output = projectPath(OUTPUT_PATH);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(evidence, null, 2) + "\n", "utf8");
  process.stdout.write(JSON.stringify(evidence, null, 2) + "\n");
  process.exitCode = status === "passed" ? 0 : status === "failed" ? 1 : 2;
}

function selectedHarnessSummary(metadata) {
  const adapterId =
    isRecord(metadata.adapter) && typeof metadata.adapter.id === "string"
      ? metadata.adapter.id
      : null;
  const configHarness =
    isRecord(metadata.config) && typeof metadata.config.agenticHarness === "string"
      ? metadata.config.agenticHarness
      : null;
  const binary =
    isRecord(metadata.invocationModel) && typeof metadata.invocationModel.binary === "string"
      ? metadata.invocationModel.binary
      : null;
  const noFallbackToPi = Boolean(
    isRecord(metadata.adapter) &&
    metadata.adapter.noFallbackToPi === true &&
    isRecord(metadata.config) &&
    metadata.config.noSilentFallback === true,
  );
  return {
    adapterId,
    configHarness,
    displayName:
      isRecord(metadata.adapter) && typeof metadata.adapter.displayName === "string"
        ? metadata.adapter.displayName
        : adapterId,
    binary,
    noFallbackToPi,
    structuredOutput: isRecord(metadata.structuredOutput) ? metadata.structuredOutput : null,
    unavailableRuntimeBehavior: isRecord(metadata.verificationRunnerInvocation)
      ? metadata.verificationRunnerInvocation.unavailableRuntimeBehavior
      : null,
  };
}

function validateSelectedHarness(metadata) {
  const summary = selectedHarnessSummary(metadata);
  if (!summary.adapterId || !SUPPORTED.has(summary.adapterId)) {
    return {
      ok: false,
      summary,
      reason: "selected harness metadata is missing a supported adapter id",
    };
  }
  if (summary.configHarness !== summary.adapterId) {
    return {
      ok: false,
      summary,
      reason: "selected harness config does not match adapter id",
    };
  }
  if (!summary.binary) {
    return {
      ok: false,
      summary,
      reason: "selected harness metadata is missing invocationModel.binary",
    };
  }
  if (!summary.noFallbackToPi) {
    return {
      ok: false,
      summary,
      reason: "selected harness metadata does not assert noFallbackToPi/noSilentFallback",
    };
  }
  return { ok: true, summary };
}

async function loadScope() {
  const rootPackage = await readJson("package.json");
  const scope =
    isRecord(rootPackage.vibeEngineer) && isRecord(rootPackage.vibeEngineer.starterScope)
      ? rootPackage.vibeEngineer.starterScope
      : null;
  if (!isRecord(scope)) throw new Error("package.json#vibeEngineer.starterScope is missing");
  const includesApi = scope.includesApi === true;
  const includesWeb = scope.includesWeb === true;
  const includesMobile = scope.includesMobile === true;
  const includesPrisma = scope.includesPrisma === true;
  return {
    id: typeof scope.id === "string" ? scope.id : "unknown",
    label: typeof scope.label === "string" ? scope.label : "unknown",
    includesApi,
    includesWeb,
    includesMobile,
    includesPrisma,
    apps: Array.isArray(scope.apps) ? scope.apps.filter((item) => typeof item === "string") : [],
    packages: Array.isArray(scope.packages)
      ? scope.packages.filter((item) => typeof item === "string")
      : [],
  };
}

function boundariesForScope(scope) {
  const reviewed = [];
  if (scope.includesApi) reviewed.push("backend");
  if (scope.includesWeb) reviewed.push("web");
  if (scope.includesMobile) reviewed.push("mobile");
  const omitted = ["backend", "web", "mobile"].filter((item) => !reviewed.includes(item));
  return { reviewed, omitted };
}

function normalizeGitPath(pathValue) {
  return String(pathValue).trim().replaceAll("\\", "/");
}

function isImplementationPath(pathValue) {
  return (
    pathValue.length > 0 &&
    !pathValue.startsWith(SELF_EVIDENCE_PATH_PREFIX) &&
    pathValue !== OUTPUT_PATH &&
    pathValue !== EFFECTIVE_PROMPT_PATH &&
    pathValue !== LAST_MESSAGE_PATH
  );
}

function uniqueImplementationPaths(paths) {
  return [...new Set(paths.map(normalizeGitPath).filter(isImplementationPath))].sort();
}

function pathsFromGitNameOutput(text) {
  return uniqueImplementationPaths(
    text
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter(Boolean),
  );
}

function safeRelativeProjectPath(pathValue) {
  const normalized = normalizeGitPath(pathValue);
  if (
    normalized.length === 0 ||
    normalized.startsWith("/") ||
    normalized.split("/").includes("..") ||
    normalized.includes("\0")
  ) {
    return null;
  }
  return normalized;
}

function readFilePrefix(pathValue, maxBytes) {
  const fd = openSync(pathValue, "r");
  try {
    const buffer = Buffer.alloc(maxBytes);
    const bytesRead = readSync(fd, buffer, 0, maxBytes, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    closeSync(fd);
  }
}

function summarizeUntrackedPath(relativePath) {
  const safePath = safeRelativeProjectPath(relativePath);
  if (safePath === null) {
    return { path: relativePath, kind: "unsafe-path", readable: false };
  }
  const absolutePath = projectPath(safePath);
  try {
    const stat = statSync(absolutePath);
    if (!stat.isFile()) {
      return {
        path: safePath,
        kind: stat.isDirectory() ? "directory" : "non-file",
        readable: false,
      };
    }
    const prefix = readFilePrefix(absolutePath, Math.min(MAX_UNTRACKED_FILE_BYTES, stat.size));
    const binary = prefix.includes(0);
    return {
      path: safePath,
      kind: "file",
      readable: true,
      sizeBytes: stat.size,
      truncated: stat.size > MAX_UNTRACKED_FILE_BYTES,
      binary,
      contentSample: binary ? null : prefix.toString("utf8"),
    };
  } catch (error) {
    return {
      path: safePath,
      kind: "unreadable",
      readable: false,
      reason: error instanceof Error ? error.message : "untracked path could not be read",
    };
  }
}

function buildDiffDelta(id, label, command, namesRun, diffRun) {
  const changedPaths = namesRun.exitCode === 0 ? pathsFromGitNameOutput(namesRun.stdout) : [];
  const truncated = truncateText(diffRun.exitCode === 0 ? diffRun.stdout : "", MAX_DIFF_BYTES);
  return {
    id,
    label,
    kind: "git-diff",
    command,
    available: namesRun.exitCode === 0 && diffRun.exitCode === 0,
    reason:
      namesRun.exitCode !== 0
        ? namesRun.stderr.trim() || namesRun.errorMessage || "git name-only command failed"
        : diffRun.exitCode !== 0
          ? diffRun.stderr.trim() || diffRun.errorMessage || "git diff command failed"
          : null,
    changedPaths,
    text: truncated.text,
    truncated: truncated.truncated,
  };
}

function buildUntrackedDelta(lsRun) {
  const changedPaths = lsRun.exitCode === 0 ? pathsFromGitNameOutput(lsRun.stdout) : [];
  const summarizedPaths = changedPaths.slice(0, MAX_UNTRACKED_FILES);
  const summaries = summarizedPaths.map((pathValue) => summarizeUntrackedPath(pathValue));
  return {
    id: "untracked",
    label: "untracked paths with bounded content/summaries",
    kind: "untracked-summary",
    command: ["git", "ls-files", "--others", "--exclude-standard"],
    available: lsRun.exitCode === 0,
    reason:
      lsRun.exitCode === 0
        ? null
        : lsRun.stderr.trim() || lsRun.errorMessage || "git ls-files for untracked paths failed",
    changedPaths,
    summaries,
    truncated: changedPaths.length > summarizedPaths.length,
    omittedPathCount: Math.max(0, changedPaths.length - summarizedPaths.length),
  };
}

function deltaHasNonPathEvidence(delta) {
  if (typeof delta.text === "string" && delta.text.trim().length > 0) return true;
  return Array.isArray(delta.summaries) && delta.summaries.length > 0;
}

function deltaSection(delta) {
  const header =
    "### Delta class: " +
    delta.id +
    " — " +
    delta.label +
    "\n" +
    "Available: " +
    String(delta.available) +
    "\n" +
    "Command: " +
    JSON.stringify(delta.command) +
    "\n" +
    "Changed paths: " +
    (delta.changedPaths.length === 0 ? "none" : delta.changedPaths.join(", ")) +
    "\n" +
    (delta.reason ? "Reason: " + delta.reason + "\n" : "") +
    (delta.truncated ? "Delta evidence was truncated.\n" : "");
  if (delta.kind === "git-diff") {
    return header + "```diff\n" + (delta.text || "") + "\n```\n";
  }
  return (
    header +
    "```json\n" +
    JSON.stringify(
      { summaries: delta.summaries, omittedPathCount: delta.omittedPathCount },
      null,
      2,
    ) +
    "\n```\n"
  );
}

function summarizeDiffForEvidence(diff) {
  return {
    mode: diff.mode,
    baseCommit: diff.baseCommit,
    changedPaths: diff.changedPaths,
    truncated: diff.truncated,
    unavailableReason: diff.reason,
    evidenceEmpty: diff.evidenceEmpty,
    dirtyImplementationWork: diff.dirtyImplementationWork,
    hiddenDirtyPaths: diff.hiddenDirtyPaths ?? [],
    productCompletenessFindings: diff.productCompletenessFindings ?? [],
    deltaClasses: diff.deltaClasses,
  };
}

function parseStatusPaths(text) {
  const paths = [];
  for (const line of String(text || "").split(/\r?\n/u)) {
    if (line.trim().length === 0) continue;
    const raw = line.slice(3).trim();
    if (raw.includes(" -> ")) {
      const [fromPath, toPath] = raw.split(" -> ");
      paths.push(fromPath, toPath);
    } else {
      paths.push(raw);
    }
  }
  return uniqueImplementationPaths(paths);
}

function addedTextByPathFromDiff(diffText) {
  const byPath = new Map();
  let currentPath = null;
  for (const line of String(diffText || "").split(/\r?\n/u)) {
    if (line.startsWith("+++ ")) {
      const nextPath = line.slice(4).trim();
      currentPath = nextPath.startsWith("b/") ? nextPath.slice(2) : null;
      if (currentPath && currentPath !== "/dev/null" && !byPath.has(currentPath)) {
        byPath.set(currentPath, []);
      }
      continue;
    }
    if (!currentPath || line.startsWith("+++")) continue;
    if (line.startsWith("+") && !line.startsWith("+++"))
      byPath.get(currentPath).push(line.slice(1));
  }
  return byPath;
}

function mergeAddedText(existing, delta) {
  for (const [pathValue, lines] of delta.entries()) {
    if (!existing.has(pathValue)) existing.set(pathValue, []);
    existing.get(pathValue).push(...lines);
  }
}

function addedTextByPathFromDeltas(deltaClasses) {
  const byPath = new Map();
  for (const delta of deltaClasses) {
    if (delta.kind === "git-diff") mergeAddedText(byPath, addedTextByPathFromDiff(delta.text));
    if (delta.kind === "untracked-summary" && Array.isArray(delta.summaries)) {
      for (const summary of delta.summaries) {
        if (
          !summary ||
          typeof summary.path !== "string" ||
          typeof summary.contentSample !== "string"
        )
          continue;
        if (!byPath.has(summary.path)) byPath.set(summary.path, []);
        byPath.get(summary.path).push(summary.contentSample);
      }
    }
  }
  return byPath;
}

function isCodePath(pathValue) {
  return /\.(?:ts|tsx|js|jsx|mjs|cjs|json|prisma|sql)$/u.test(pathValue);
}

function isUiPath(pathValue) {
  return (
    (pathValue.startsWith("apps/web/src/") || pathValue.startsWith("apps/mobile/src/")) &&
    /\.(?:tsx|jsx|ts|js)$/u.test(pathValue)
  );
}

function isBackendMutationPath(pathValue) {
  return (
    pathValue.startsWith("apps/api/src/") ||
    pathValue.startsWith("packages/api-client/src/") ||
    pathValue.startsWith("packages/contracts/src/")
  );
}

function productCompletenessFinding(pathValue, reason, boundary) {
  return finding(pathValue, reason, boundary ?? inferBoundary(pathValue), "critical");
}

function scanProductCompleteness(diff, scope) {
  const findings = [];
  const addedByPath = addedTextByPathFromDeltas(diff.deltaClasses || []);
  let mutationBackendChanged = false;
  for (const [pathValue, lines] of addedByPath.entries()) {
    const text = lines.join("\n");
    if (!isCodePath(pathValue) || text.trim().length === 0) continue;
    const lowerPath = pathValue.toLowerCase();
    const lowerText = text.toLowerCase();
    if (
      /(?:^|\/)(?:seed|seeds|sample|samples|demo|mock|mocks|fixture|fixtures)(?:\.|\/|-|_)/u.test(
        lowerPath,
      ) ||
      (/\b(?:seed|sample|demo|mock)(?:records|data|items|users|projects|tasks|orders|products)?\b/u.test(
        lowerText,
      ) &&
        /(?:export\s+const|const\s+\w+\s*=\s*\[|return\s+\[|@Injectable\s*\()/u.test(text))
    ) {
      findings.push(
        productCompletenessFinding(
          pathValue,
          "Changed implementation delta introduces static seed/sample/demo/mock data or service behavior instead of a real product data flow.",
        ),
      );
    }
    if (/import\s+[^;]*from\s+["'][^"']*(?:seed|sample|demo|mock|fixture)[^"']*["']/iu.test(text)) {
      findings.push(
        productCompletenessFinding(
          pathValue,
          "Changed implementation delta imports seed/sample/demo/mock/fixture data directly from product code.",
        ),
      );
    }
    if (
      /\b(?:localStorage|sessionStorage|AsyncStorage|MMKV|indexedDB)\b/u.test(text) ||
      /\bnew\s+(?:Map|Set)\s*(?:<|\()/u.test(text) ||
      /\b(?:readFileSync|writeFileSync|readFile|writeFile)\s*\([^\n]*(?:\.json|json)/u.test(text) ||
      /\b(?:store|repository|repo|database|db)\w*\s*=\s*(?:\[\]|\{\}|new\s+(?:Map|Set))/iu.test(
        text,
      )
    ) {
      findings.push(
        productCompletenessFinding(
          pathValue,
          "Changed implementation delta uses local JSON, browser/native local storage, or in-memory stores for product state.",
        ),
      );
    }
    if (
      isUiPath(pathValue) &&
      /\b(?:title|label|description|items|cards|sections|columns)\s*[:=]\s*\[/iu.test(text) &&
      !/\b(?:fetch|axios|trpc|useQuery|useMutation|apiClient|client\.|POST|PUT|PATCH|DELETE)\b/u.test(
        text,
      )
    ) {
      findings.push(
        productCompletenessFinding(
          pathValue,
          "Changed UI delta is descriptor-only and does not connect rendered product behavior to an API or mutation path.",
          inferBoundary(pathValue),
        ),
      );
    }
    if (
      /\b(?:status\s*:\s*["']passed["']|findings\s*:\s*\[\s*\]|fake architecture|fake boundary|hard-coded finding|self-certifying)\b/iu.test(
        text,
      )
    ) {
      findings.push(
        productCompletenessFinding(
          pathValue,
          "Changed implementation delta hard-codes or self-certifies review/evidence findings instead of deriving them from runtime evidence.",
          "cross-cutting",
        ),
      );
    }
    if (
      isBackendMutationPath(pathValue) &&
      /\b(?:Post|Put|Patch|Delete|POST|PUT|PATCH|DELETE|create|update|delete|upsert|mutate|mutation)\b/u.test(
        text,
      )
    ) {
      mutationBackendChanged = true;
    }
  }
  for (const [pathValue, lines] of addedByPath.entries()) {
    const text = lines.join("\n");
    if (!isUiPath(pathValue)) continue;
    if (
      !/(?:<form\b|onSubmit\b|useMutation\b|\b(?:create|update|delete|save|submit)\w*\s*[:=])/iu.test(
        text,
      )
    )
      continue;
    if (scope.includesApi && !mutationBackendChanged) {
      findings.push(
        productCompletenessFinding(
          pathValue,
          "Changed UI mutation flow has no corresponding backend/API-client mutating implementation delta.",
          inferBoundary(pathValue),
        ),
      );
    }
  }
  const seen = new Set();
  return findings.filter((item) => {
    const key = item.path + "\0" + item.reason;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function loadGitDiff() {
  const gitProbe = await runProcess("git", ["rev-parse", "--is-inside-work-tree"], {
    timeoutMs: SHORT_TIMEOUT_MS,
  });
  if (gitProbe.errorMessage || gitProbe.exitCode !== 0 || gitProbe.stdout.trim() !== "true") {
    return {
      mode: "git-unavailable",
      available: false,
      reason: gitProbe.errorMessage || gitProbe.stderr.trim() || "not inside a git work tree",
      baseCommit: null,
      changedPaths: [],
      text: "",
      promptText: "",
      truncated: false,
      deltaClasses: [],
      evidenceEmpty: true,
      dirtyImplementationWork: false,
    };
  }
  const roots = await runProcess("git", ["rev-list", "--max-parents=0", "HEAD"], {
    timeoutMs: SHORT_TIMEOUT_MS,
  });
  if (roots.errorMessage || roots.exitCode !== 0) {
    return {
      mode: "git-unavailable",
      available: false,
      reason: roots.errorMessage || roots.stderr.trim() || "could not resolve initial commit",
      baseCommit: null,
      changedPaths: [],
      text: "",
      promptText: "",
      truncated: false,
      deltaClasses: [],
      evidenceEmpty: true,
      dirtyImplementationWork: false,
    };
  }
  const baseCommit = roots.stdout.trim().split(/\s+/u).filter(Boolean)[0] ?? null;
  if (baseCommit === null) {
    return {
      mode: "git-unavailable",
      available: false,
      reason: "initial create commit was not found",
      baseCommit: null,
      changedPaths: [],
      text: "",
      promptText: "",
      truncated: false,
      deltaClasses: [],
      evidenceEmpty: true,
      dirtyImplementationWork: false,
    };
  }

  const committedNames = await runProcess("git", ["diff", "--name-only", baseCommit + "..HEAD"], {
    timeoutMs: SHORT_TIMEOUT_MS,
  });
  const committedDiff = await runProcess(
    "git",
    ["diff", "--find-renames", "--unified=80", baseCommit + "..HEAD"],
    { timeoutMs: SHORT_TIMEOUT_MS },
  );
  const stagedNames = await runProcess("git", ["diff", "--cached", "--name-only"], {
    timeoutMs: SHORT_TIMEOUT_MS,
  });
  const stagedDiff = await runProcess(
    "git",
    ["diff", "--cached", "--find-renames", "--unified=80"],
    { timeoutMs: SHORT_TIMEOUT_MS },
  );
  const unstagedNames = await runProcess("git", ["diff", "--name-only"], {
    timeoutMs: SHORT_TIMEOUT_MS,
  });
  const unstagedDiff = await runProcess("git", ["diff", "--find-renames", "--unified=80"], {
    timeoutMs: SHORT_TIMEOUT_MS,
  });
  const untrackedRun = await runProcess("git", ["ls-files", "--others", "--exclude-standard"], {
    timeoutMs: SHORT_TIMEOUT_MS,
  });
  const statusRun = await runProcess("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
    timeoutMs: SHORT_TIMEOUT_MS,
  });

  const deltaClasses = [
    buildDiffDelta(
      "committed",
      "committed diff from initial create commit/baseline to HEAD",
      ["git", "diff", "--find-renames", "--unified=80", baseCommit + "..HEAD"],
      committedNames,
      committedDiff,
    ),
    buildDiffDelta(
      "staged",
      "staged diff",
      ["git", "diff", "--cached", "--find-renames", "--unified=80"],
      stagedNames,
      stagedDiff,
    ),
    buildDiffDelta(
      "unstaged",
      "unstaged tracked diff",
      ["git", "diff", "--find-renames", "--unified=80"],
      unstagedNames,
      unstagedDiff,
    ),
    buildUntrackedDelta(untrackedRun),
  ];
  const changedPaths = uniqueImplementationPaths(
    deltaClasses.flatMap((delta) => delta.changedPaths),
  );
  const statusPaths = statusRun.exitCode === 0 ? parseStatusPaths(statusRun.stdout) : [];
  const hiddenDirtyPaths = statusPaths.filter((pathValue) => !changedPaths.includes(pathValue));
  const promptText = deltaClasses.map(deltaSection).join("\n");
  const dirtyImplementationWork = changedPaths.length > 0 || hiddenDirtyPaths.length > 0;
  const evidenceEmpty = dirtyImplementationWork && !deltaClasses.some(deltaHasNonPathEvidence);
  return {
    mode: "git-initial-create-commit",
    available: true,
    reason: deltaClasses.find((delta) => !delta.available)?.reason ?? null,
    baseCommit,
    command: ["git", "diff", "--find-renames", "--unified=80", baseCommit + "..HEAD"],
    changedPaths,
    text: promptText,
    promptText,
    truncated: deltaClasses.some((delta) => delta.truncated === true),
    deltaClasses,
    evidenceEmpty,
    dirtyImplementationWork,
    hiddenDirtyPaths,
    statusCommand: ["git", "status", "--porcelain=v1", "--untracked-files=all"],
    statusAvailable: statusRun.exitCode === 0,
    statusReason:
      statusRun.exitCode === 0
        ? null
        : statusRun.stderr.trim() || statusRun.errorMessage || "git status porcelain failed",
  };
}

function buildPrompt(template, selectedHarness, scope, boundaries, diff) {
  return (
    template +
    "\n## Runtime selected harness metadata\n```json\n" +
    JSON.stringify(selectedHarness, null, 2) +
    "\n```\n" +
    "\n## Starter scope metadata\n```json\n" +
    JSON.stringify(scope, null, 2) +
    "\n```\n" +
    "\n## Boundaries to review\n```json\n" +
    JSON.stringify(boundaries, null, 2) +
    "\n```\n" +
    "\n## Implementation delta evidence\n" +
    "Mode: " +
    diff.mode +
    "\n" +
    "Base commit: " +
    (diff.baseCommit ?? "unavailable") +
    "\n" +
    "Changed paths (union of committed, staged, unstaged, untracked): " +
    (diff.changedPaths.length === 0 ? "none" : diff.changedPaths.join(", ")) +
    "\n" +
    (diff.truncated ? "One or more delta classes were truncated.\n" : "") +
    (diff.evidenceEmpty
      ? "Dirty implementation work exists but non-path evidence is empty; block instead of guessing.\n"
      : "") +
    "\n" +
    (diff.promptText || "") +
    "\n"
  );
}

function materializeCommand(metadata, promptText) {
  const invocation = isRecord(metadata.verificationRunnerInvocation)
    ? metadata.verificationRunnerInvocation
    : null;
  const selected = selectedHarnessSummary(metadata);
  const recommended =
    invocation && Array.isArray(invocation.recommendedCommand)
      ? invocation.recommendedCommand.filter((item) => typeof item === "string")
      : [];
  if (recommended.length === 0)
    return {
      ok: false,
      reason: "verificationRunnerInvocation.recommendedCommand is missing",
    };
  if (recommended[0] !== selected.binary)
    return {
      ok: false,
      reason: "recommended command binary does not match selected invocationModel.binary",
    };
  let promptReplaced = false;
  const schemaPath = projectPath(SCHEMA_PATH);
  const lastMessagePath = projectPath(LAST_MESSAGE_PATH);
  const command = recommended.map((token) => {
    if (token === "<prompt>") {
      promptReplaced = true;
      return promptText;
    }
    if (token === "<schema>" || token === "<schema-json>")
      return readFileSync(schemaPath, "utf8").trim();
    if (token === "<schema-file>") return schemaPath;
    if (token === "<last-message-file>") return lastMessagePath;
    return token;
  });
  if (!promptReplaced)
    return {
      ok: false,
      reason: "recommended command does not include a <prompt> placeholder",
    };
  return {
    ok: true,
    command: command[0],
    args: command.slice(1),
    schemaPath,
    lastMessagePath,
  };
}

function parseJsonLenient(text) {
  const trimmed = text.trim();
  if (trimmed.length === 0) return [];
  const out = [];
  try {
    out.push(JSON.parse(trimmed));
  } catch {
    /* ignore invalid JSON candidates */
  }
  const fence = /```(?:json)?\s*([\s\S]*?)```/giu;
  for (const match of trimmed.matchAll(fence)) {
    try {
      out.push(JSON.parse(match[1].trim()));
    } catch {
      /* ignore invalid JSON candidates */
    }
  }
  for (const line of trimmed.split(/\r?\n/u)) {
    const candidate = line.trim();
    if (!candidate.startsWith("{") && !candidate.startsWith("[")) continue;
    try {
      out.push(JSON.parse(candidate));
    } catch {
      /* ignore invalid JSON candidates */
    }
  }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try {
      out.push(JSON.parse(trimmed.slice(first, last + 1)));
    } catch {
      /* ignore invalid JSON candidates */
    }
  }
  return out;
}

function collectContentStrings(content) {
  const out = [];
  if (typeof content === "string") return [content];
  if (!Array.isArray(content)) return out;
  for (const item of content) {
    if (typeof item === "string") out.push(item);
    else if (isRecord(item)) {
      if (typeof item.text === "string") out.push(item.text);
      if (typeof item.content === "string") out.push(item.content);
    }
  }
  return out;
}

function nestedValues(value) {
  const out = [];
  if (!isRecord(value)) return out;
  for (const key of [
    "result",
    "message",
    "text",
    "output",
    "response",
    "final_response",
    "finalMessage",
    "delta",
  ]) {
    if (typeof value[key] === "string") out.push(value[key]);
  }
  out.push(...collectContentStrings(value.content));
  if (isRecord(value.message)) out.push(...nestedValues(value.message));
  if (isRecord(value.error)) out.push(...nestedValues(value.error));
  if (isRecord(value.assistantMessageEvent)) out.push(...nestedValues(value.assistantMessageEvent));
  if (Array.isArray(value.messages)) {
    for (const item of value.messages) if (isRecord(item)) out.push(...nestedValues(item));
  }
  return out;
}

function findReviewObject(texts) {
  const queue = [];
  for (const text of texts) queue.push(...parseJsonLenient(text));
  const seen = new Set();
  while (queue.length > 0) {
    const value = queue.shift();
    if (!isRecord(value)) continue;
    const marker = JSON.stringify(value).slice(0, 1000);
    if (seen.has(marker)) continue;
    seen.add(marker);
    if (["passed", "failed", "blocked"].includes(value.status)) return value;
    for (const nested of nestedValues(value)) queue.push(...parseJsonLenient(nested));
  }
  return null;
}

function inferBoundary(pathValue) {
  if (
    pathValue.startsWith("apps/api/") ||
    pathValue.startsWith("packages/contracts/") ||
    pathValue.startsWith("packages/domain/") ||
    pathValue.startsWith("packages/api-client/")
  )
    return "backend";
  if (pathValue.startsWith("apps/web/")) return "web";
  if (pathValue.startsWith("apps/mobile/") || pathValue.includes("/native/")) return "mobile";
  return "cross-cutting";
}

function validateReview(value, boundaries) {
  if (!isRecord(value)) return { ok: false, reason: "review output is not a JSON object" };
  const status = value.status;
  if (!["passed", "failed", "blocked"].includes(status))
    return {
      ok: false,
      reason: "review status must be passed, failed, or blocked",
    };
  if (typeof value.summary !== "string" || value.summary.trim().length === 0)
    return { ok: false, reason: "review summary is missing" };
  if (!Array.isArray(value.findings))
    return { ok: false, reason: "review findings must be an array" };
  const allowed = new Set([...boundaries.reviewed, "cross-cutting"]);
  const findings = [];
  for (const raw of value.findings) {
    if (
      !isRecord(raw) ||
      typeof raw.path !== "string" ||
      raw.path.trim().length === 0 ||
      typeof raw.reason !== "string" ||
      raw.reason.trim().length === 0
    ) {
      return {
        ok: false,
        reason: "each finding must include non-empty path and reason",
      };
    }
    const boundary = typeof raw.boundary === "string" ? raw.boundary : inferBoundary(raw.path);
    if (!allowed.has(boundary))
      return {
        ok: false,
        reason: "review output included omitted boundary " + boundary + " for path " + raw.path,
      };
    findings.push({
      path: raw.path,
      reason: raw.reason,
      boundary,
      severity: ["minor", "major", "critical"].includes(raw.severity) ? raw.severity : "major",
    });
  }
  if (status === "passed" && findings.length !== 0)
    return { ok: false, reason: "passed review must not include findings" };
  if (status === "failed" && findings.length === 0)
    return {
      ok: false,
      reason: "failed review must include at least one finding",
    };
  const diagnostics = Array.isArray(value.diagnostics)
    ? value.diagnostics.filter(isRecord).map((item) => ({
        code: typeof item.code === "string" ? item.code : "HARNESS_DIAGNOSTIC",
        reason:
          typeof item.reason === "string"
            ? item.reason
            : typeof item.message === "string"
              ? item.message
              : "Harness returned a diagnostic.",
        ...(typeof item.path === "string" ? { path: item.path } : {}),
      }))
    : [];
  return { ok: true, status, summary: value.summary, findings, diagnostics };
}

async function main() {
  let selectedMetadata;
  let scope;
  let selectedValidation;
  try {
    selectedMetadata = await readJson(SELECTED_HARNESS_PATH);
    selectedValidation = validateSelectedHarness(selectedMetadata);
    scope = await loadScope();
  } catch (error) {
    await finish("blocked", {
      summary: "Architecture review runner metadata could not be loaded.",
      findings: [
        finding(
          SELECTED_HARNESS_PATH,
          error instanceof Error ? error.message : "metadata load failed",
        ),
      ],
      diagnostics: [
        diagnostic(
          "ARCHITECTURE_REVIEW_METADATA_UNAVAILABLE",
          error instanceof Error ? error.message : "metadata load failed",
        ),
      ],
      noFallbackToPi: false,
    });
    return;
  }
  const selectedSummary = selectedValidation.summary;
  const boundaries = boundariesForScope(scope);
  if (!selectedValidation.ok) {
    await finish("blocked", {
      summary: "Selected harness metadata failed validation; no fallback was attempted.",
      selectedHarness: selectedSummary,
      starterScope: scope,
      reviewedBoundaries: boundaries.reviewed,
      omittedBoundaries: boundaries.omitted,
      findings: [finding(SELECTED_HARNESS_PATH, selectedValidation.reason)],
      diagnostics: [diagnostic("SELECTED_HARNESS_METADATA_INVALID", selectedValidation.reason)],
      noFallbackToPi: selectedSummary.noFallbackToPi,
    });
    return;
  }

  const diff = await loadGitDiff();
  const promptTemplate = await readFile(projectPath(PROMPT_TEMPLATE_PATH), "utf8");
  const prompt = buildPrompt(promptTemplate, selectedSummary, scope, boundaries, diff);
  await mkdir(dirname(projectPath(EFFECTIVE_PROMPT_PATH)), { recursive: true });
  await writeFile(projectPath(EFFECTIVE_PROMPT_PATH), prompt, "utf8");
  if (diff.dirtyImplementationWork && diff.evidenceEmpty) {
    const reason =
      "Dirty or untracked implementation work was detected, but the architecture review prompt would contain empty delta evidence.";
    await finish("blocked", {
      summary: "Architecture review blocked because implementation delta evidence would be empty.",
      selectedHarness: selectedSummary,
      starterScope: scope,
      reviewedBoundaries: boundaries.reviewed,
      omittedBoundaries: boundaries.omitted,
      diff: summarizeDiffForEvidence(diff),
      findings: [finding(OUTPUT_PATH, reason)],
      diagnostics: [diagnostic("IMPLEMENTATION_DELTA_EVIDENCE_EMPTY", reason, OUTPUT_PATH)],
      noFallbackToPi: true,
    });
    return;
  }
  if (Array.isArray(diff.hiddenDirtyPaths) && diff.hiddenDirtyPaths.length > 0) {
    const reason =
      "Git status reported implementation paths that were not represented in committed/staged/unstaged/untracked architecture delta evidence: " +
      diff.hiddenDirtyPaths.join(", ");
    await finish("blocked", {
      summary:
        "Architecture review blocked because dirty implementation work was hidden from delta evidence.",
      selectedHarness: selectedSummary,
      starterScope: scope,
      reviewedBoundaries: boundaries.reviewed,
      omittedBoundaries: boundaries.omitted,
      diff: summarizeDiffForEvidence(diff),
      findings: diff.hiddenDirtyPaths.map((pathValue) => finding(pathValue, reason)),
      diagnostics: [diagnostic("HIDDEN_DIRTY_IMPLEMENTATION_WORK", reason, OUTPUT_PATH)],
      noFallbackToPi: true,
    });
    return;
  }
  const productCompletenessFindings = scanProductCompleteness(diff, scope);
  diff.productCompletenessFindings = productCompletenessFindings;
  if (productCompletenessFindings.length > 0) {
    await finish("failed", {
      summary:
        "Architecture review failed deterministic product completeness checks before accepting harness output.",
      selectedHarness: selectedSummary,
      starterScope: scope,
      reviewedBoundaries: boundaries.reviewed,
      omittedBoundaries: boundaries.omitted,
      diff: summarizeDiffForEvidence(diff),
      findings: productCompletenessFindings,
      diagnostics: [],
      noFallbackToPi: true,
    });
    return;
  }

  const versionCommand =
    isRecord(selectedMetadata.runtimePrerequisiteDiagnostic) &&
    Array.isArray(selectedMetadata.runtimePrerequisiteDiagnostic.versionCommand)
      ? selectedMetadata.runtimePrerequisiteDiagnostic.versionCommand.filter(
          (item) => typeof item === "string",
        )
      : [selectedSummary.binary, "--version"];
  const versionProbe = await runProcess(versionCommand[0], versionCommand.slice(1), {
    timeoutMs: SHORT_TIMEOUT_MS,
  });
  if (versionProbe.errorMessage || versionProbe.exitCode !== 0) {
    const code =
      versionProbe.errorCode === "ENOENT" ? "HARNESS_CLI_MISSING" : "HARNESS_RUNTIME_UNAVAILABLE";
    const reason =
      versionProbe.errorMessage ||
      versionProbe.stderr.trim() ||
      "selected harness version probe failed";
    await finish("blocked", {
      summary: "Selected harness CLI/runtime is unavailable; no fallback was attempted.",
      selectedHarness: selectedSummary,
      starterScope: scope,
      reviewedBoundaries: boundaries.reviewed,
      omittedBoundaries: boundaries.omitted,
      diff: summarizeDiffForEvidence(diff),
      findings: [finding(SELECTED_HARNESS_PATH, reason)],
      diagnostics: [diagnostic(code, reason)],
      harnessInvocation: {
        versionProbe: safeJson(versionProbe),
        command: versionCommand,
      },
      noFallbackToPi: true,
    });
    return;
  }

  const commandPlan = materializeCommand(selectedMetadata, prompt);
  if (!commandPlan.ok) {
    await finish("blocked", {
      summary: "Selected harness invocation metadata is incomplete; no fallback was attempted.",
      selectedHarness: selectedSummary,
      starterScope: scope,
      reviewedBoundaries: boundaries.reviewed,
      omittedBoundaries: boundaries.omitted,
      diff: summarizeDiffForEvidence(diff),
      findings: [finding(SELECTED_HARNESS_PATH, commandPlan.reason)],
      diagnostics: [diagnostic("HARNESS_INVOCATION_METADATA_INVALID", commandPlan.reason)],
      noFallbackToPi: true,
    });
    return;
  }

  const harnessRun = await runProcess(commandPlan.command, commandPlan.args, {
    timeoutMs: HARNESS_TIMEOUT_MS,
  });
  const harnessCommandForEvidence = [
    commandPlan.command,
    ...commandPlan.args.map((arg) => (arg === prompt ? "<prompt>" : arg)),
  ];
  if (harnessRun.errorMessage || harnessRun.exitCode !== 0 || harnessRun.timedOut) {
    const failure = classifyHarnessFailure(harnessRun);
    await finish("blocked", {
      summary:
        "Selected harness failed closed with a precise runtime/auth/trust diagnostic; no fallback was attempted.",
      selectedHarness: selectedSummary,
      starterScope: scope,
      reviewedBoundaries: boundaries.reviewed,
      omittedBoundaries: boundaries.omitted,
      diff: summarizeDiffForEvidence(diff),
      findings: [finding(SELECTED_HARNESS_PATH, failure.reason)],
      diagnostics: [diagnostic(failure.code, failure.reason)],
      harnessInvocation: {
        command: harnessCommandForEvidence,
        exitCode: harnessRun.exitCode,
        signal: harnessRun.signal,
        stdoutBytes: byteLength(harnessRun.stdout),
        stderrBytes: byteLength(harnessRun.stderr),
        stderr: harnessRun.stderr,
        versionProbe: safeJson(versionProbe),
      },
      noFallbackToPi: true,
    });
    return;
  }

  const lastMessage = existsSync(projectPath(LAST_MESSAGE_PATH))
    ? await readFile(projectPath(LAST_MESSAGE_PATH), "utf8")
    : "";
  const reviewObject = findReviewObject([lastMessage, harnessRun.stdout, harnessRun.stderr]);
  const review = validateReview(reviewObject, boundaries);
  if (!review.ok) {
    await finish("blocked", {
      summary:
        "Selected harness output was unparseable or failed schema validation; no fallback was attempted.",
      selectedHarness: selectedSummary,
      starterScope: scope,
      reviewedBoundaries: boundaries.reviewed,
      omittedBoundaries: boundaries.omitted,
      diff: summarizeDiffForEvidence(diff),
      findings: [finding(OUTPUT_PATH, review.reason)],
      diagnostics: [diagnostic("HARNESS_OUTPUT_UNPARSEABLE", review.reason, OUTPUT_PATH)],
      harnessInvocation: {
        command: harnessCommandForEvidence,
        exitCode: harnessRun.exitCode,
        stdoutBytes: byteLength(harnessRun.stdout),
        stderrBytes: byteLength(harnessRun.stderr),
        versionProbe: safeJson(versionProbe),
      },
      noFallbackToPi: true,
    });
    return;
  }

  await finish(review.status, {
    summary: review.summary,
    selectedHarness: selectedSummary,
    starterScope: scope,
    reviewedBoundaries: boundaries.reviewed,
    omittedBoundaries: boundaries.omitted,
    diff: summarizeDiffForEvidence(diff),
    findings: review.findings,
    diagnostics: review.diagnostics,
    harnessInvocation: {
      command: harnessCommandForEvidence,
      exitCode: harnessRun.exitCode,
      stdoutBytes: byteLength(harnessRun.stdout),
      stderrBytes: byteLength(harnessRun.stderr),
      versionProbe: safeJson(versionProbe),
    },
    noFallbackToPi: true,
  });
}

main().catch(async (error) => {
  await finish("blocked", {
    summary: "Architecture review runner crashed before producing validated harness evidence.",
    findings: [
      finding(OUTPUT_PATH, error instanceof Error ? error.message : "unknown runner error"),
    ],
    diagnostics: [
      diagnostic(
        "ARCHITECTURE_REVIEW_RUNNER_INTERNAL_ERROR",
        error instanceof Error ? error.message : "unknown runner error",
        OUTPUT_PATH,
      ),
    ],
    noFallbackToPi: false,
  });
});
