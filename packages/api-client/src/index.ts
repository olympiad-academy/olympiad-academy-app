import { initClient } from "@ts-rest/core";
import { contract } from "@olympiad-academy-app/contracts";

export * from "@olympiad-academy-app/contracts";

export const starterApiEndpoints = Object.freeze({
  health: "/health",
  readiness: "/health/ready",
} as const);
export type StarterApiEndpoints = typeof starterApiEndpoints;

/**
 * Typed HTTP client for the Olympiad Academy API contract (see
 * @olympiad-academy-app/contracts). Proves that the contract package is
 * consumable end-to-end (OLY-8 DoD): `web` uses this factory rather than
 * importing `@olympiad-academy-app/contracts` directly.
 */
export function createApiClient(baseUrl: string) {
  return initClient(contract, { baseUrl });
}
export type ApiClient = ReturnType<typeof createApiClient>;
