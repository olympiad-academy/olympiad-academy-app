import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AUTH_TOKEN_STORAGE_KEY,
  createAuthSession,
  type AuthSessionStorage,
} from "@/auth/auth-session.js";

const fakeStorage = (
  initial: Record<string, string> = {},
): AuthSessionStorage & { data: Map<string, string> } => {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
};

describe("authSession module (D7)", () => {
  it("reports no session and a null token on a clean storage", () => {
    const session = createAuthSession(fakeStorage());
    assert.equal(session.getToken(), null);
    assert.equal(session.hasSession(), false);
  });

  it("stores the token and reports an active session", () => {
    const storage = fakeStorage();
    const session = createAuthSession(storage);
    session.setToken("token-123");
    assert.equal(session.getToken(), "token-123");
    assert.equal(session.hasSession(), true);
    assert.equal(storage.data.get(AUTH_TOKEN_STORAGE_KEY), "token-123");
  });

  it("reads a token persisted by a previous page load", () => {
    const session = createAuthSession(fakeStorage({ [AUTH_TOKEN_STORAGE_KEY]: "persisted" }));
    assert.equal(session.getToken(), "persisted");
    assert.equal(session.hasSession(), true);
  });

  it("clear removes the token entirely (logout, D7/D8)", () => {
    const storage = fakeStorage({ [AUTH_TOKEN_STORAGE_KEY]: "stale" });
    const session = createAuthSession(storage);
    session.clear();
    assert.equal(session.getToken(), null);
    assert.equal(session.hasSession(), false);
    assert.equal(storage.data.has(AUTH_TOKEN_STORAGE_KEY), false);
  });

  it("treats an empty-string token as no session (never a truthy Bearer header)", () => {
    const session = createAuthSession(fakeStorage({ [AUTH_TOKEN_STORAGE_KEY]: "" }));
    assert.equal(session.getToken(), null);
    assert.equal(session.hasSession(), false);
  });
});
