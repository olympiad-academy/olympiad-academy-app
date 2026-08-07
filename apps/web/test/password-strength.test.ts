import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimatePasswordStrength } from "@/auth/password-strength.js";

/**
 * Advisory password-strength estimate. Deliberately NOT a validation rule:
 * it never blocks submission, and the contract schema stays the only source
 * of what is accepted (AC7/D9). What it may do is tell the student that a
 * password clearing the contract's min(8) is still a poor one.
 *
 * The model follows NIST SP 800-63B rather than classic composition rules:
 * length is the dominant term, character variety is only a tiebreaker, and
 * no class of character is ever required. A meter that demanded
 * digit+symbol+uppercase would push people toward predictable "Password1!"
 * shapes — the exact outcome that guidance moved away from.
 */
describe("estimatePasswordStrength (advisory, NIST-shaped)", () => {
  it("returns null for an empty password so nothing is shown before typing", () => {
    assert.equal(estimatePasswordStrength(""), null);
  });

  it("rates anything under the contract minimum as weak", () => {
    assert.equal(estimatePasswordStrength("abc"), "weak");
    assert.equal(estimatePasswordStrength("short12"), "weak");
  });

  it("rates a bare 8-character password as weak — clearing the contract is not the same as being good", () => {
    assert.equal(estimatePasswordStrength("abcdefgh"), "weak");
  });

  it("lets variety lift an 8-11 character password to fair, but no further", () => {
    assert.equal(estimatePasswordStrength("Abcdef1!"), "fair");
  });

  it("rates 12+ characters as fair on length alone, with no special characters at all", () => {
    assert.equal(estimatePasswordStrength("correcthorse"), "fair");
  });

  it("rates a 12+ character password with some variety as strong", () => {
    assert.equal(estimatePasswordStrength("correcthorse7"), "strong");
  });

  it("rates a long passphrase as strong on length alone — no symbol required", () => {
    assert.equal(estimatePasswordStrength("correcthorsebatterystaple"), "strong");
  });

  it("never rates a single repeated character as anything but weak, however long", () => {
    assert.equal(estimatePasswordStrength("aaaaaaaaaaaaaaaaaaaa"), "weak");
  });

  it("never rates a plain sequence as anything but weak, however long", () => {
    assert.equal(estimatePasswordStrength("abcdefghijklmnop"), "weak");
    assert.equal(estimatePasswordStrength("12345678901234"), "weak");
  });
});
