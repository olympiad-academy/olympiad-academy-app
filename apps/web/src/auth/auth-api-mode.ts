/**
 * VITE_API_MOCK resolution (D5, work brief env requirement).
 *
 * Vite env values are strings inlined at build time — `"false"` is a truthy
 * string, so the flag is compared explicitly, never coerced. Unset falls
 * back to the brief's default: mock in dev/E2E, real HTTP in a production
 * build. The env shape is passed in (not read from import.meta here) so the
 * rule is a pure function testable under tsx --test, where import.meta.env
 * does not exist.
 */

export type AuthApiMode = "mock" | "http";

export interface AuthApiModeEnv {
  VITE_API_MOCK?: string;
  DEV?: boolean;
}

export const resolveAuthApiMode = (env: AuthApiModeEnv | undefined): AuthApiMode => {
  if (env?.VITE_API_MOCK === "true") {
    return "mock";
  }
  if (env?.VITE_API_MOCK === "false") {
    return "http";
  }
  // No env at all happens outside Vite (unit tests, SSR-less tooling) —
  // treat it like dev: the safe default is the mock, which needs no server.
  if (env === undefined) {
    return "mock";
  }
  return env.DEV === true ? "mock" : "http";
};
