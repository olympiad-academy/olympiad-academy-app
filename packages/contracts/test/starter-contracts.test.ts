import assert from "node:assert/strict";
import test from "node:test";
import { starterContractReadiness } from "../src/index.js";

test("contracts package declares that feature contracts are schematic-owned", () => {
  assert.equal(starterContractReadiness.generatedFeatureContracts, "schematic-owned");
  assert.equal(starterContractReadiness.starterContracts, "none");
});
