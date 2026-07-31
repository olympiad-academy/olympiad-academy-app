export const starterApiEndpoints = Object.freeze({
  health: "/health",
  readiness: "/health/ready",
} as const);

export type StarterApiEndpoints = typeof starterApiEndpoints;
