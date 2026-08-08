import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readRedirectTarget } from "@/auth/redirect-target.js";

/**
 * The login screen sends the user back to wherever ProtectedRoutes bounced
 * them from. That value arrives in history state, which any script on the
 * page can write and which survives a reload — so it is parsed, never
 * asserted, and only an in-app absolute path is handed to `navigate()`.
 */
describe("readRedirectTarget (history state is untrusted input)", () => {
  it("accepts an in-app absolute path", () => {
    assert.equal(readRedirectTarget({ from: "/topics" }), "/topics");
    assert.equal(readRedirectTarget({ from: "/" }), "/");
    assert.equal(readRedirectTarget({ from: "/profile?tab=1" }), "/profile?tab=1");
  });

  it("rejects state that is not an object carrying `from`", () => {
    assert.equal(readRedirectTarget(null), null);
    assert.equal(readRedirectTarget(undefined), null);
    assert.equal(readRedirectTarget("/topics"), null);
    assert.equal(readRedirectTarget({}), null);
    assert.equal(readRedirectTarget({ from: 42 }), null);
  });

  it("rejects an absolute URL", () => {
    assert.equal(readRedirectTarget({ from: "https://evil.example" }), null);
    assert.equal(readRedirectTarget({ from: "javascript:alert(1)" }), null);
  });

  it("rejects a relative path, which would resolve against the current route", () => {
    assert.equal(readRedirectTarget({ from: "topics" }), null);
  });

  /**
   * Both spellings resolve protocol-relative — off-origin. The backslash one
   * is the reason the check is a regex and not `startsWith("//")`: a URL
   * parser normalises "\" to "/" for special schemes, so "/\evil.example"
   * behaves exactly as "//evil.example" while passing a naive test
   * (independent review, second pass).
   */
  it("rejects protocol-relative URLs spelled with either separator", () => {
    assert.equal(readRedirectTarget({ from: "//evil.example" }), null);
    assert.equal(readRedirectTarget({ from: "/\\evil.example" }), null);
    assert.equal(readRedirectTarget({ from: "//evil.example/topics" }), null);
    assert.equal(readRedirectTarget({ from: "/\\\\evil.example" }), null);
  });
});
