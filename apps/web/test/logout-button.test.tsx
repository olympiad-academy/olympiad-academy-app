import "./helpers/dom.js";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createI18n } from "@/i18n/index.js";
import { AUTH_TOKEN_STORAGE_KEY } from "@/auth/auth-session.js";
import { LogoutButton } from "@/components/logout-button/logout-button.js";

/**
 * Logout (plan S6, D7/D8): clears the stored token and returns to the
 * landing route. The button lives in the profile screen per the design of
 * record (ProfileScreen header) — proven here at the component level; the
 * full authenticated -> logout -> re-guarded flow is proven end-to-end.
 */

const renderAt = async (path: string): Promise<void> => {
  const i18n = await createI18n({ storage: window.localStorage });
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/profile" element={<LogoutButton />} />
          <Route path="/" element={<div>landing</div>} />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>,
  );
};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("LogoutButton (D7/D8)", () => {
  it("clears the auth token and navigates to the landing route", async () => {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "token-abc");
    await renderAt("/profile");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Chiqish" }));
    });

    assert.equal(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY), null);
    screen.getByText("landing");
  });
});
