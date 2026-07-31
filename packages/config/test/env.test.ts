import assert from "node:assert/strict";
import test from "node:test";
import { readStarterEnv } from "../src/index.js";

test("config parses explicit local API port", () => {
  assert.deepEqual(readStarterEnv({ DATABASE_URL: "postgresql://local", API_PORT: "4100" }), {
    databaseUrl: "postgresql://local",
    apiPort: 4100,
  });
});
