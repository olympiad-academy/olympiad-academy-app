import assert from "node:assert/strict";
import test from "node:test";
import { describeStarterWorkspace } from "../src/index.js";

test("domain package exposes a neutral starter workspace descriptor", () => {
  assert.deepEqual(describeStarterWorkspace(" Example "), {
    name: "Example",
    generatedBy: "vibe-engineer",
  });
});
