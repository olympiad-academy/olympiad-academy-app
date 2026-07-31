import assert from "node:assert/strict";
import test from "node:test";
import { starterTestLabel } from "../src/index.js";

test("testing package exposes neutral starter test labels", () => {
  assert.equal(starterTestLabel("quality"), "starter:quality");
});
