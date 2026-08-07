import "./helpers/dom.js";
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { createI18n } from "@/i18n/index.js";
import { AUTH_TOKEN_STORAGE_KEY } from "@/auth/auth-session.js";
import { App } from "@/app/app.js";

/**
 * Route protection wiring (D7, plan S3) and the forward-redirect for
 * authenticated users on auth screens (D7/S6, part of AC3's "Back never
 * returns to auth screens"). Rendered through the real App (BrowserRouter)
 * so the proof covers the actual route table, not a rebuilt copy —
 * happy-dom provides window.history/localStorage.
 */

const renderAppAt = async (path: string): Promise<void> => {
  // happy-dom starts at about:blank (origin "null"); pushState/replaceState
  // refuse to set a real-origin URL from there, so the origin is established
  // via a location assignment first, then the target path via pushState.
  window.location.href = "http://localhost/";
  window.history.pushState({}, "", path);
  const i18n = await createI18n({ storage: window.localStorage });
  render(
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>,
  );
};

describe("route protection (D7)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => cleanup());

  it("redirects an unauthenticated user from /topics to /login", async () => {
    await renderAppAt("/topics");
    assert.equal(window.location.pathname, "/login");
  });

  it("redirects an unauthenticated user from /profile to /login", async () => {
    await renderAppAt("/profile");
    assert.equal(window.location.pathname, "/login");
  });

  it("lets an authenticated user reach /topics", async () => {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "token-abc");
    await renderAppAt("/topics");
    assert.equal(window.location.pathname, "/topics");
    screen.getByRole("heading", { level: 1, name: "Mavzular" });
  });

  it("keeps the landing public for unauthenticated users", async () => {
    await renderAppAt("/");
    assert.equal(window.location.pathname, "/");
  });
});

describe("authenticated users never see auth screens (D7/AC3)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "token-abc");
  });
  afterEach(() => cleanup());

  it("redirects /signup forward to /topics", async () => {
    await renderAppAt("/signup");
    assert.equal(window.location.pathname, "/topics");
  });

  it("redirects /login forward to /topics", async () => {
    await renderAppAt("/login");
    assert.equal(window.location.pathname, "/topics");
  });
});
