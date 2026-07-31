import assert from "node:assert/strict";
import test from "node:test";
import { colorTokens, spacingTokens } from "../src/index.js";

test("ui package exposes deterministic design tokens", () => {
  assert.equal(spacingTokens.medium, 16);
  assert.equal(colorTokens.background, "#ffffff");
});
