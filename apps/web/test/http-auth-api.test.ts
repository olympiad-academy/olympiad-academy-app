import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contract } from "@olympiad-academy-app/api-client";
import { mapAuthHttpResponse, mapAuthTransportError } from "@/auth/http-auth-api.js";
import { resolveAuthApiMode } from "@/auth/auth-api-mode.js";

/**
 * HttpAuthApi's status→AuthResult mapping (D6): the contract declares only
 * the 200 response, so the error mapping mirrors the implemented backend
 * behaviour (409 duplicate / 401 invalid / 400 validation, documented in
 * Swagger) — recorded as compliant-by-D6 until contract error schemas land.
 * The mapper is a pure function so this proof needs no network; the thin
 * ts-rest wrapper is exercised by the real-API verification pass (D5-A1).
 */
describe("HttpAuthApi response mapping (D6)", () => {
  it("maps a contract-valid 200 body to success, using the schema passed in", () => {
    const result = mapAuthHttpResponse(
      200,
      { user_id: "6e08c8f4-6f10-47a4-93a4-25a938e239c3", token: "jwt-token" },
      contract.signup.responses[200],
    );
    assert.ok(result.ok);
    assert.equal(result.user_id, "6e08c8f4-6f10-47a4-93a4-25a938e239c3");
    assert.equal(result.token, "jwt-token");
  });

  it("rejects a 200 body that does not satisfy the schema passed in", () => {
    const result = mapAuthHttpResponse(
      200,
      { user_id: "not-a-uuid", token: "" },
      contract.signup.responses[200],
    );
    assert.ok(!result.ok);
    assert.equal(result.error, "network");
  });

  /**
   * Review defect 2: mapAuthHttpResponse used to hardcode
   * contract.signup.responses[200] for every 200, including login's. Both
   * endpoints share AuthSuccessResponseSchema today, so behaviour was
   * correct — but the link was silent: if the two response schemas ever
   * diverged, every successful LOGIN would fail contract.signup's schema
   * and collapse to { ok: false, error: "network" }, indistinguishable from
   * an actual outage. Passing the schema in as a parameter (signup passes
   * contract.signup.responses[200], login passes
   * contract.login.responses[200]) makes each call site name its own
   * contract obligation instead of borrowing the other endpoint's.
   */
  it("validates a login response against the LOGIN schema, not signup's", () => {
    const result = mapAuthHttpResponse(
      200,
      { user_id: "6e08c8f4-6f10-47a4-93a4-25a938e239c3", token: "jwt-token" },
      contract.login.responses[200],
    );
    assert.ok(result.ok);
    assert.equal(result.token, "jwt-token");
  });

  it("a body invalid under the login schema fails even if some other schema would accept it", () => {
    const result = mapAuthHttpResponse(
      200,
      { user_id: "not-a-uuid", token: "jwt-token" },
      contract.login.responses[200],
    );
    assert.ok(!result.ok);
    assert.equal(result.error, "network");
  });

  it("maps 409 to duplicate_account", () => {
    const result = mapAuthHttpResponse(
      409,
      { statusCode: 409, message: "An account with this phone or email already exists" },
      contract.signup.responses[200],
    );
    assert.ok(!result.ok);
    assert.equal(result.error, "duplicate_account");
  });

  it("maps 401 to invalid_credentials", () => {
    const result = mapAuthHttpResponse(
      401,
      { statusCode: 401, message: "Invalid credentials" },
      contract.login.responses[200],
    );
    assert.ok(!result.ok);
    assert.equal(result.error, "invalid_credentials");
  });

  it("maps 400 with Zod issues to validation with field issues", () => {
    const result = mapAuthHttpResponse(
      400,
      {
        statusCode: 400,
        message: [
          {
            path: ["password"],
            code: "too_small",
            message: "String must contain at least 8 character(s)",
          },
        ],
        error: "Bad Request",
      },
      contract.signup.responses[200],
    );
    assert.ok(!result.ok);
    assert.equal(result.error, "validation");
    if (result.error === "validation") {
      assert.equal(result.fieldIssues.length, 1);
      assert.deepEqual(result.fieldIssues[0]?.path, ["password"]);
      assert.equal(result.fieldIssues[0]?.code, "too_small");
    }
  });

  it("maps a 400 without a parsable issue list to validation with no field issues", () => {
    const result = mapAuthHttpResponse(
      400,
      { statusCode: 400, message: "Bad Request" },
      contract.signup.responses[200],
    );
    assert.ok(!result.ok);
    assert.equal(result.error, "validation");
    if (result.error === "validation") {
      assert.deepEqual(result.fieldIssues, []);
    }
  });

  it("maps unexpected statuses (e.g. 500) to network — retryable, not a field problem", () => {
    const result = mapAuthHttpResponse(
      500,
      { statusCode: 500, message: "Internal server error" },
      contract.signup.responses[200],
    );
    assert.ok(!result.ok);
    assert.equal(result.error, "network");
  });

  it("maps a thrown transport error to network", () => {
    const result = mapAuthTransportError();
    assert.ok(!result.ok);
    assert.equal(result.error, "network");
  });
});

/**
 * VITE_API_MOCK semantics (work brief env requirement): the value is a
 * string ("false" is truthy — compare, never coerce); unset defaults to
 * mock in dev/E2E and http in a production build.
 */
describe("resolveAuthApiMode (VITE_API_MOCK, D5)", () => {
  it('"true" selects mock regardless of dev/prod', () => {
    assert.equal(resolveAuthApiMode({ VITE_API_MOCK: "true", DEV: false }), "mock");
  });

  it('"false" selects http even in dev', () => {
    assert.equal(resolveAuthApiMode({ VITE_API_MOCK: "false", DEV: true }), "http");
  });

  it("unset defaults to mock in dev", () => {
    assert.equal(resolveAuthApiMode({ DEV: true }), "mock");
  });

  it("unset defaults to http in a production build", () => {
    assert.equal(resolveAuthApiMode({ DEV: false }), "http");
  });

  it("a missing env object (tsx --test has no import.meta.env) defaults to mock", () => {
    assert.equal(resolveAuthApiMode(undefined), "mock");
  });

  it('any value other than exactly "true"/"false" falls back to the default rule', () => {
    assert.equal(resolveAuthApiMode({ VITE_API_MOCK: "1", DEV: false }), "http");
    assert.equal(resolveAuthApiMode({ VITE_API_MOCK: "TRUE", DEV: true }), "mock");
  });
});
