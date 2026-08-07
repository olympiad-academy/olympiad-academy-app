import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimatePasswordStrength } from "@/auth/password-strength.js";

/**
 * Advisory password-strength estimate. Deliberately NOT a validation rule:
 * it never blocks submission, and the contract schema stays the only source
 * of what is accepted (AC7/D9).
 *
 * The bands sit on the contract's own min(8) and grade by character variety
 * above it. They deliberately do NOT ask for a longer password than the
 * product requires: a meter calling a contract-valid password "too short"
 * would be arguing with the rule the same form enforces. Weighting variety
 * is provisional — the team lead has still to confirm the real password
 * rule, and if it lands as a length rule instead, these bands follow it.
 */
describe("estimatePasswordStrength (advisory)", () => {
  it("returns null for an empty password so nothing is shown before typing", () => {
    assert.equal(estimatePasswordStrength(""), null);
  });

  it("rates anything under the contract minimum as weak, however varied", () => {
    assert.equal(estimatePasswordStrength("Ab1!"), "weak");
    assert.equal(estimatePasswordStrength("Abc123!"), "weak");
  });

  it("rates a contract-length password of one character class as weak", () => {
    assert.equal(estimatePasswordStrength("abcdefgh"), "weak");
    assert.equal(estimatePasswordStrength("olympiadd"), "weak");
  });

  it("rates two character classes at contract length as fair", () => {
    assert.equal(estimatePasswordStrength("olympiad8"), "fair");
    assert.equal(estimatePasswordStrength("Olympiadd"), "fair");
  });

  it("rates three or more character classes at contract length as strong", () => {
    assert.equal(estimatePasswordStrength("Olympiad8"), "strong");
    assert.equal(estimatePasswordStrength("olympiad8!"), "strong");
  });

  it("does not ask for more length than the contract does — 8 varied characters can be strong", () => {
    assert.equal(estimatePasswordStrength("Ab1!efgh"), "strong");
  });

  it("never rates a single repeated character as anything but weak, however long", () => {
    assert.equal(estimatePasswordStrength("aaaaaaaaaaaaaaaaaaaa"), "weak");
    assert.equal(estimatePasswordStrength("AAAAAAAAAAAA"), "weak");
  });

  it("never rates a plain sequence as anything but weak, however long", () => {
    assert.equal(estimatePasswordStrength("abcdefghijklmnop"), "weak");
    assert.equal(estimatePasswordStrength("12345678901234"), "weak");
  });
});
