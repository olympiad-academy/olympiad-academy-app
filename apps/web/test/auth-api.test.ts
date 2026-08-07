import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contract } from "@olympiad-academy-app/api-client";
import {
  createMockAuthApi,
  MOCK_NETWORK_FAILURE_CONTACT,
  MOCK_SEEDED_ACCOUNT,
} from "@/auth/mock-auth-api.js";
import type { LoginBody, SignupBody } from "@/auth/auth-api.js";

/**
 * AC5 (work brief / docs/decisions): mock fixtures validate against the
 * contract Zod schemas in tests, so the mock and the contract cannot drift
 * silently. Every request body used against MockAuthApi below is first
 * parsed with the contract schema; every success result is parsed with the
 * contract 200 response schema. If OLY-8's contract changes shape, these
 * tests fail loudly instead of the mock quietly diverging (D5).
 */

const emailSignupFixture: SignupBody = {
  name: "Aziza",
  email: "aziza@example.com",
  password: "longenough8",
  language: "uz",
};

const phoneSignupFixture: SignupBody = {
  name: "Bek",
  phone: "+998901234567",
  password: "longenough8",
  language: "ru",
};

const emailLoginFixture: LoginBody = {
  email: "aziza@example.com",
  password: "longenough8",
};

describe("mock fixtures validate against contract schemas (AC5)", () => {
  it("signup fixtures parse with contract.signup.body", () => {
    assert.ok(contract.signup.body.safeParse(emailSignupFixture).success);
    assert.ok(contract.signup.body.safeParse(phoneSignupFixture).success);
  });

  it("login fixture parses with contract.login.body", () => {
    assert.ok(contract.login.body.safeParse(emailLoginFixture).success);
  });

  it("the seeded demo account itself satisfies the contract signup schema", () => {
    const parsed = contract.signup.body.safeParse({
      name: MOCK_SEEDED_ACCOUNT.name,
      email: MOCK_SEEDED_ACCOUNT.email,
      password: MOCK_SEEDED_ACCOUNT.password,
      language: "uz",
    });
    assert.ok(parsed.success);
  });
});

describe("MockAuthApi signup (D5 scenarios, D6 taxonomy)", () => {
  it("returns a contract-valid success for a new account", async () => {
    const api = createMockAuthApi();
    const result = await api.signup(emailSignupFixture);
    assert.ok(result.ok);
    // The success payload must parse with the contract 200 response schema
    // (AC5): user_id is a uuid, token non-empty.
    const parsed = contract.signup.responses[200].safeParse({
      user_id: result.user_id,
      token: result.token,
    });
    assert.ok(parsed.success);
  });

  it("returns duplicate_account when the email is already registered", async () => {
    const api = createMockAuthApi();
    assert.ok((await api.signup(emailSignupFixture)).ok);
    const second = await api.signup(emailSignupFixture);
    assert.ok(!second.ok);
    assert.equal(second.error, "duplicate_account");
  });

  it("returns duplicate_account when the phone is already registered", async () => {
    const api = createMockAuthApi();
    assert.ok((await api.signup(phoneSignupFixture)).ok);
    const second = await api.signup(phoneSignupFixture);
    assert.ok(!second.ok);
    assert.equal(second.error, "duplicate_account");
  });

  it("treats the seeded demo account as an existing account", async () => {
    const api = createMockAuthApi();
    const result = await api.signup({
      name: "Somebody",
      email: MOCK_SEEDED_ACCOUNT.email,
      password: "longenough8",
      language: "uz",
    });
    assert.ok(!result.ok);
    assert.equal(result.error, "duplicate_account");
  });

  it("simulates a network failure for the reserved contact (OLY-42 seam)", async () => {
    const api = createMockAuthApi();
    const result = await api.signup({
      name: "Offline",
      email: MOCK_NETWORK_FAILURE_CONTACT,
      password: "longenough8",
      language: "uz",
    });
    assert.ok(!result.ok);
    assert.equal(result.error, "network");
  });

  it("returns validation with field issues for a contract-invalid body", async () => {
    const api = createMockAuthApi();
    // Bypasses the form layer on purpose: the mock mirrors the backend's
    // contract.parse at the boundary, exactly like auth.controller.ts does.
    const result = await api.signup({
      name: "",
      email: "aziza@example.com",
      password: "short",
      language: "uz",
    });
    assert.ok(!result.ok);
    assert.equal(result.error, "validation");
    if (result.error === "validation") {
      assert.ok(result.fieldIssues.length > 0);
      const paths = result.fieldIssues.map((issue) => issue.path.join("."));
      assert.ok(paths.includes("name"));
      assert.ok(paths.includes("password"));
    }
  });
});

describe("MockAuthApi login (D5 scenarios, D6 taxonomy)", () => {
  it("logs into the seeded demo account", async () => {
    const api = createMockAuthApi();
    const result = await api.login({
      email: MOCK_SEEDED_ACCOUNT.email,
      password: MOCK_SEEDED_ACCOUNT.password,
    });
    assert.ok(result.ok);
    assert.ok(
      contract.login.responses[200].safeParse({
        user_id: result.user_id,
        token: result.token,
      }).success,
    );
  });

  it("returns invalid_credentials for a wrong password", async () => {
    const api = createMockAuthApi();
    const result = await api.login({
      email: MOCK_SEEDED_ACCOUNT.email,
      password: "not-the-password",
    });
    assert.ok(!result.ok);
    assert.equal(result.error, "invalid_credentials");
  });

  it("returns invalid_credentials for an unknown identity", async () => {
    const api = createMockAuthApi();
    const result = await api.login({ email: "nobody@example.com", password: "longenough8" });
    assert.ok(!result.ok);
    assert.equal(result.error, "invalid_credentials");
  });

  it("simulates a network failure for the reserved contact", async () => {
    const api = createMockAuthApi();
    const result = await api.login({
      email: MOCK_NETWORK_FAILURE_CONTACT,
      password: "longenough8",
    });
    assert.ok(!result.ok);
    assert.equal(result.error, "network");
  });

  it("an account created via signup can log in and keeps its user_id", async () => {
    const api = createMockAuthApi();
    const signedUp = await api.signup(phoneSignupFixture);
    assert.ok(signedUp.ok);
    const loggedIn = await api.login({
      phone: phoneSignupFixture.phone,
      password: phoneSignupFixture.password,
    });
    assert.ok(loggedIn.ok);
    assert.equal(loggedIn.user_id, signedUp.user_id);
  });
});
