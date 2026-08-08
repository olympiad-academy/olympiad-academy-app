import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import { createAuthFormResolver } from "@/auth/auth-form-resolver.js";
import { contract } from "@olympiad-academy-app/api-client";

/**
 * D9 + its technical note: react-hook-form validates against the contract
 * Zod schemas — the form's single "identity" field is mapped to phone/email
 * before validation (D9 design sub-point) and any resulting error is mapped
 * back to "identity" so it renders under the one visible field (AC4). Error
 * messages are i18n KEYS derived from the Zod issue code, never Zod's raw
 * English string (D9).
 */

const options = {
  shouldUseNativeValidation: false,
  fields: {},
} as const;

describe("createAuthFormResolver over contract.signup.body (D9)", () => {
  const resolver = createAuthFormResolver(contract.signup.body, { language: "uz" });

  it("passes valid signup values through and maps identity to email", async () => {
    const result = await resolver(
      { name: "Aziza", identity: "aziza@example.com", password: "longenough8" },
      undefined,
      options,
    );
    assert.deepEqual(result.errors, {});
    assert.deepEqual(result.values, {
      name: "Aziza",
      email: "aziza@example.com",
      password: "longenough8",
      language: "uz",
    });
  });

  it("maps identity to phone when the value has no @", async () => {
    const result = await resolver(
      { name: "Bek", identity: "+998901234567", password: "longenough8" },
      undefined,
      options,
    );
    assert.deepEqual(result.errors, {});
    assert.deepEqual(result.values, {
      name: "Bek",
      phone: "+998901234567",
      password: "longenough8",
      language: "uz",
    });
  });

  it("an empty name yields an i18n key error on the name field, not Zod's English string", async () => {
    const result = await resolver(
      { name: "", identity: "aziza@example.com", password: "longenough8" },
      undefined,
      options,
    );
    assert.equal(typeof result.errors["name"]?.message, "string");
    assert.doesNotMatch(result.errors["name"]?.message ?? "", /character/i);
  });

  it("a too-short password yields an error keyed to i18n, not '8 character(s)'", async () => {
    const result = await resolver(
      { name: "Aziza", identity: "aziza@example.com", password: "short" },
      undefined,
      options,
    );
    assert.equal(typeof result.errors["password"]?.message, "string");
    assert.doesNotMatch(result.errors["password"]?.message ?? "", /character/i);
  });

  it("a missing identity is reported on the identity field, not phone or email", async () => {
    const result = await resolver(
      { name: "Aziza", identity: "", password: "longenough8" },
      undefined,
      options,
    );
    assert.ok("identity" in result.errors);
    assert.equal("phone" in result.errors, false);
    assert.equal("email" in result.errors, false);
  });

  it("an invalid email format is reported on identity", async () => {
    const result = await resolver(
      { name: "Aziza", identity: "not-an-email@", password: "longenough8" },
      undefined,
      options,
    );
    assert.ok("identity" in result.errors);
  });
});

/**
 * Review defect 3: mapFieldName let ANY schema field name through as-is
 * (returning "language", the raw path, etc.), but the form only renders errors
 * for name/identity/password — an error on any other path was silently
 * dropped: the user presses submit, nothing happens, no message anywhere.
 * Unreachable through the real contract schemas today (language is
 * constrained to LanguageSchema and always valid), but nothing enforced
 * that, and the next field added to `extra` would reproduce it silently.
 * A schema built for this test (not the real contract) exercises the path
 * directly, independent of what the real contract currently allows.
 */
describe("createAuthFormResolver: fields the form does not render (review defect 3)", () => {
  // The resolver maps form values to { name, phone|email, password, ...extra }
  // BEFORE calling safeParseAsync (toIdentityFields), so a schema under test
  // here validates that mapped shape, not the form's own field names.
  const schemaWithAnUncoveredField = z
    .object({ name: z.string().min(1), email: z.string(), password: z.string() })
    .superRefine((_value, ctx) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "unreachable today",
        path: ["language"],
      });
    });

  it("an error on a field the form does not render is reported under formError, not silently dropped", async () => {
    const resolver = createAuthFormResolver(schemaWithAnUncoveredField, {});
    const result = await resolver(
      { name: "Aziza", identity: "aziza@example.com", password: "longenough8" },
      undefined,
      options,
    );
    assert.equal("language" in result.errors, false);
    assert.ok(result.errors.formError !== undefined);
    assert.equal(typeof result.errors.formError?.message, "string");
  });

  const schemaWithARootIssue = z
    .object({ name: z.string(), email: z.string(), password: z.string() })
    .refine(() => false, { message: "unreachable today", path: [] });

  it("an issue with an empty path (schema-level refine) is also reported under formError", async () => {
    const resolver = createAuthFormResolver(schemaWithARootIssue, {});
    const result = await resolver(
      { name: "Aziza", identity: "aziza@example.com", password: "longenough8" },
      undefined,
      options,
    );
    assert.ok(result.errors.formError !== undefined);
  });
});

describe("createAuthFormResolver over contract.login.body (D9)", () => {
  const resolver = createAuthFormResolver(contract.login.body, {});

  it("accepts a 1-character password (login's own minimum) — mapped, not signup's rule", async () => {
    const result = await resolver(
      { identity: "aziza@example.com", password: "x" },
      undefined,
      options,
    );
    assert.deepEqual(result.errors, {});
    assert.deepEqual(result.values, { email: "aziza@example.com", password: "x" });
  });

  it("an empty password is reported on the password field", async () => {
    const result = await resolver(
      { identity: "aziza@example.com", password: "" },
      undefined,
      options,
    );
    assert.ok("password" in result.errors);
  });
});
