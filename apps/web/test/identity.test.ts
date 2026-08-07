import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectIdentityKind, toIdentityFields } from "@/auth/identity.js";

/**
 * Single "phone or email" field → contract identity mapping (D9 + its
 * technical note). Kind detection: "@" present → email, else phone
 * (design-dependent sub-point of D9, from Figma). Mapping omits the unused
 * field rather than sending null — the D9 technical note's explicit rule,
 * chosen because Zod's `.optional()` already covers "not sent" and
 * `JSON.stringify` drops omitted keys anyway.
 */
describe("detectIdentityKind (D9)", () => {
  it("detects an email when the value contains @", () => {
    assert.equal(detectIdentityKind("aziza@example.com"), "email");
  });

  it("detects a phone number when there is no @", () => {
    assert.equal(detectIdentityKind("+998901234567"), "phone");
  });

  it("treats an empty string as phone (no @ present)", () => {
    assert.equal(detectIdentityKind(""), "phone");
  });
});

describe("toIdentityFields (D9 technical note: omit, never null)", () => {
  it("maps an email value to { email }, omitting phone entirely", () => {
    const fields = toIdentityFields("aziza@example.com");
    assert.deepEqual(fields, { email: "aziza@example.com" });
    assert.equal("phone" in fields, false);
  });

  it("maps a phone value to { phone }, omitting email entirely", () => {
    const fields = toIdentityFields("+998901234567");
    assert.deepEqual(fields, { phone: "+998901234567" });
    assert.equal("email" in fields, false);
  });

  it("trims surrounding whitespace before mapping", () => {
    assert.deepEqual(toIdentityFields("  aziza@example.com  "), { email: "aziza@example.com" });
    assert.deepEqual(toIdentityFields("  +998901234567  "), { phone: "+998901234567" });
  });
});
