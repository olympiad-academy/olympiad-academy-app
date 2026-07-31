type MobileApiEnv = Readonly<Record<string, string | undefined>>;

declare const process:
  | Readonly<{
      readonly env?: MobileApiEnv;
    }>
  | undefined;

const mobileApiBaseUrlEnvKey = "EXPO_PUBLIC_API_BASE_URL";

function defaultMobileApiEnv(): MobileApiEnv {
  if (typeof process === "undefined") return Object.freeze({});
  return process.env ?? Object.freeze({});
}

function isAbsoluteHttpUrl(value: string): boolean {
  const normalized = value.toLowerCase();
  return normalized.startsWith("http://") || normalized.startsWith("https://");
}

export function normalizeMobileApiBaseUrl(value: string | undefined): string {
  if (typeof value !== "string") {
    throw new Error(`${mobileApiBaseUrlEnvKey} must be set for mobile API requests.`);
  }
  const normalized = value.trim().replace(/\/+$/u, "");
  if (normalized.length === 0) {
    throw new Error(`${mobileApiBaseUrlEnvKey} must be set for mobile API requests.`);
  }
  if (/\s/u.test(normalized) || !isAbsoluteHttpUrl(normalized)) {
    throw new Error(
      `${mobileApiBaseUrlEnvKey} must be an absolute HTTP(S) URL for native mobile fetch.`,
    );
  }
  if (!normalized.endsWith("/api")) {
    throw new Error(`${mobileApiBaseUrlEnvKey} must include the generated /api route prefix.`);
  }
  return normalized;
}

export function readMobileApiBaseUrl(env: MobileApiEnv = defaultMobileApiEnv()): string {
  return normalizeMobileApiBaseUrl(env[mobileApiBaseUrlEnvKey]);
}
