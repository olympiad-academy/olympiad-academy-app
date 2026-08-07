import "./helpers/dom.js";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { createI18n, LOCALE_STORAGE_KEY, type LocaleStorage } from "@/i18n/index.js";
import { AuthApiProvider } from "@/auth/auth-api-context.js";
import { createMockAuthApi } from "@/auth/mock-auth-api.js";
import { AUTH_TOKEN_STORAGE_KEY } from "@/auth/auth-session.js";
import { SignupRoute } from "@/routes/auth/signup/signup.js";

/**
 * The strength meter is advisory: it reports on the password as typed and
 * never gates submission. The last test here is the load-bearing one — a
 * password the meter calls weak must still sign up successfully, because
 * what is accepted is `contract.signup.body`'s rule alone (AC7/D9). If the
 * meter ever grew into a validation rule, that test fails.
 */

const fakeLocaleStorage = (initial: Record<string, string> = {}): LocaleStorage => {
  const data = { ...initial };
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
};

const renderSignup = async (locale?: string): Promise<void> => {
  const i18n = await createI18n({
    storage: fakeLocaleStorage(locale === undefined ? {} : { [LOCALE_STORAGE_KEY]: locale }),
  });
  render(
    <I18nextProvider i18n={i18n}>
      <AuthApiProvider value={createMockAuthApi()}>
        <MemoryRouter initialEntries={["/signup"]}>
          <SignupRoute />
        </MemoryRouter>
      </AuthApiProvider>
    </I18nextProvider>,
  );
};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("password strength meter (advisory)", () => {
  it("shows nothing before the student types a password", async () => {
    await renderSignup("ru");
    assert.equal(screen.queryByText(/Надёжность пароля/), null);
  });

  it("reports a short password as weak, in the active locale", async () => {
    await renderSignup("ru");
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "abcdefgh" } });
    });
    screen.getByText(/Надёжность пароля/);
    screen.getByText("слабый");
  });

  it("upgrades the verdict as the password gets longer, without any symbol being required", async () => {
    await renderSignup("ru");
    const password = screen.getByLabelText("Пароль");
    await act(async () => {
      fireEvent.change(password, { target: { value: "correcthorse" } });
    });
    screen.getByText("средний");

    await act(async () => {
      fireEvent.change(password, { target: { value: "correcthorsebatterystaple" } });
    });
    screen.getByText("надёжный");
  });

  it("does NOT block submission of a password the meter calls weak (AC7: the contract decides)", async () => {
    await renderSignup("ru");
    fireEvent.change(screen.getByLabelText("Имя"), { target: { value: "Aziza" } });
    fireEvent.change(screen.getByLabelText("Телефон или Email"), {
      target: { value: "aziza@example.com" },
    });
    // 8 characters: the meter says weak, contract.signup.body says fine.
    fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "abcdefgh" } });
    screen.getByText("слабый");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Начать практику/ }));
      await Promise.resolve();
      await Promise.resolve();
    });

    assert.equal(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) !== null, true);
  });
});
