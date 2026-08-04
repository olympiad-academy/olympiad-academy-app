import assert from "node:assert/strict";
import test from "node:test";
import { normalizeDecimalAnswer } from "../src/index.js";

test("normalizeDecimalAnswer canonicalizes the comma to a point", () => {
  assert.equal(normalizeDecimalAnswer("0,7"), "0.7");
  assert.equal(normalizeDecimalAnswer("0.7"), "0.7");
  assert.equal(normalizeDecimalAnswer(" 3,5 "), "3.5");
  assert.equal(normalizeDecimalAnswer("12,50"), "12.50");
  assert.equal(normalizeDecimalAnswer(""), "");
});
