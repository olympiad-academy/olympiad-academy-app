import assert from "node:assert/strict";
import test from "node:test";
import { starterApiEndpoints } from "../src/index.js";

test("api-client package exposes only public health endpoint names before features are generated", () => {
  assert.deepEqual(starterApiEndpoints, {
    health: "/health",
    readiness: "/health/ready",
  });
});
