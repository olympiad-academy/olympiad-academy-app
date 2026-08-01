import assert from "node:assert/strict";
import test from "node:test";
import { starterApiEndpoints, createApiClient, contract } from "../src/index.js";

test("api-client package still exposes the starter health endpoint names", () => {
  assert.deepEqual(starterApiEndpoints, {
    health: "/health",
    readiness: "/health/ready",
  });
});

test("api-client successfully imports the shared contract from @olympiad-academy-app/contracts", () => {
  assert.ok(contract.getNextProblem);
  assert.equal(contract.getNextProblem.path, "/topics/:topicId/next-problem");
});

test("createApiClient builds a typed client bound to the shared contract", () => {
  const client = createApiClient("http://localhost:3000");
  assert.equal(typeof client.getNextProblem, "function");
  assert.equal(typeof client.signup, "function");
});
