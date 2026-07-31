// Environment wrapper for the @olympiad-academy-app config package (DL-16).
// No real secrets in defaults; local-only non-secret placeholders (DL-22).

export interface StarterEnv {
  readonly databaseUrl: string;
  readonly apiPort: number;
}

export function readStarterEnv(source: NodeJS.ProcessEnv = process.env): StarterEnv {
  const databaseUrl =
    source["DATABASE_URL"] ?? "postgresql://starter_local:starter_local@localhost:5432/starter_dev";
  const apiPortRaw = source["API_PORT"] ?? "3000";
  const apiPort = Number(apiPortRaw);
  if (!Number.isFinite(apiPort)) {
    throw new Error("API_PORT must be a finite number");
  }
  return Object.freeze({ databaseUrl, apiPort });
}
