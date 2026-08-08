import "./helpers/dom.js";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { createI18n, type LocaleStorage } from "@/i18n/index.js";
import { AuthApiProvider } from "@/auth/auth-api-context.js";
import { SignupRoute } from "@/routes/auth/signup/signup.js";
import type { AuthApi, AuthResult } from "@/auth/auth-api.js";

/**
 * The submit button must stay disabled while the request is in flight.
 *
 * react-hook-form keeps `formState.isSubmitting` true only for as long as the
 * promise returned by the `handleSubmit` callback is pending. A callback that
 * starts the request and returns void tells it the submission finished
 * immediately, so the button re-enables while the API call is still running
 * and a second click sends a duplicate request. On signup that races a
 * success against a duplicate-account error.
 */

const fakeLocaleStorage = (): LocaleStorage => {
  const data: Record<string, string> = {};
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
};

/** An AuthApi whose response the test releases by hand. */
const createDeferredAuthApi = (): {
  api: AuthApi;
  calls: () => number;
  resolve: (result: AuthResult) => void;
} => {
  let callCount = 0;
  let release: (result: AuthResult) => void = () => undefined;
  const respond = (): Promise<AuthResult> => {
    callCount += 1;
    return new Promise<AuthResult>((resolvePromise) => {
      release = resolvePromise;
    });
  };
  return {
    api: { signup: respond, login: respond },
    calls: () => callCount,
    resolve: (result) => {
      release(result);
    },
  };
};

const renderSignup = async (authApi: AuthApi): Promise<void> => {
  const i18n = await createI18n({ storage: fakeLocaleStorage() });
  render(
    <I18nextProvider i18n={i18n}>
      <AuthApiProvider value={authApi}>
        <MemoryRouter initialEntries={["/signup"]}>
          <SignupRoute />
        </MemoryRouter>
      </AuthApiProvider>
    </I18nextProvider>,
  );
};

const fillValidSignup = (): void => {
  fireEvent.change(screen.getByLabelText("Ism"), { target: { value: "Aziza" } });
  fireEvent.change(screen.getByLabelText("Telefon yoki Email"), {
    target: { value: "aziza@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Parol"), { target: { value: "Olympia8" } });
};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("submit stays pending until the request resolves", () => {
  it("disables the button while the request is in flight", async () => {
    const deferred = createDeferredAuthApi();
    await renderSignup(deferred.api);
    fillValidSignup();

    const button = screen.getByRole("button", { name: /Mashqni boshlash/ });
    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
      await Promise.resolve();
    });

    assert.equal(
      (button as HTMLButtonElement).disabled,
      true,
      "button re-enabled before the request resolved",
    );
  });

  it("a second click while in flight does not send a second request", async () => {
    const deferred = createDeferredAuthApi();
    await renderSignup(deferred.api);
    fillValidSignup();

    const button = screen.getByRole("button", { name: /Mashqni boshlash/ });
    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
      await Promise.resolve();
    });

    assert.equal(deferred.calls(), 1, "the API was called more than once");
  });
});
