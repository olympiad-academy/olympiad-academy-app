import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateMockId } from "@/auth/mock-id.js";

/**
 * Review defect 1 (main): `crypto.randomUUID()` throws outside a secure
 * context. `localhost` counts as secure; a LAN address does not — and
 * `apps/web/package.json` runs `vite --host 0.0.0.0`, so a phone on the same
 * network hitting the dev server by IP is an intended path, not an edge
 * case. `createMockAuthApi()` is called at module scope
 * (browser-auth-api.ts), which app.tsx pulls in for every screen — so the
 * throw happens at app bootstrap, before any route renders: a white screen
 * with no error, not a broken signup.
 *
 * This is a mock; uniqueness within a session is all that is required, not
 * cryptographic strength. `generateMockId` isolates the two branches so
 * both are exercised without needing an actual insecure-context browser.
 */
describe("generateMockId (review defect 1: crypto.randomUUID needs a secure context)", () => {
  it("uses crypto.randomUUID() when it is available", () => {
    let calls = 0;
    const cryptoWithRandomUUID: Pick<Crypto, "randomUUID"> = {
      randomUUID: () => {
        calls += 1;
        return "11111111-1111-4111-8111-111111111111";
      },
    };
    const id = generateMockId(cryptoWithRandomUUID);
    assert.equal(id, "11111111-1111-4111-8111-111111111111");
    assert.equal(calls, 1);
  });

  it("falls back to a non-crypto unique id when randomUUID is unavailable (insecure context)", () => {
    const id = generateMockId(undefined);
    assert.equal(typeof id, "string");
    assert.ok(id.length > 0);
  });

  it("falls back when crypto.randomUUID exists but throws (the actual insecure-context failure mode)", () => {
    const cryptoThatThrows: Pick<Crypto, "randomUUID"> = {
      randomUUID: () => {
        throw new TypeError("crypto.randomUUID is only supported in secure contexts");
      },
    };
    const id = generateMockId(cryptoThatThrows);
    assert.equal(typeof id, "string");
    assert.ok(id.length > 0);
  });

  it("the fallback still produces distinct ids across calls (session uniqueness, not cryptographic strength)", () => {
    const first = generateMockId(undefined);
    const second = generateMockId(undefined);
    assert.notEqual(first, second);
  });
});
