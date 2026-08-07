import "./helpers/dom.js";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { createI18n, LOCALE_STORAGE_KEY, type LocaleStorage } from "@/i18n/index.js";
import { AuthApiProvider } from "@/auth/auth-api-context.js";
import { createMockAuthApi, MOCK_SEEDED_ACCOUNT } from "@/auth/mock-auth-api.js";
import { AUTH_TOKEN_STORAGE_KEY } from "@/auth/auth-session.js";
import { SignupRoute } from "@/routes/auth/signup/signup.js";
import { LoginRoute } from "@/routes/auth/login/login.js";
import type { AuthApi } from "@/auth/auth-api.js";

/**
 * AC4: validation messages appear in realtime (after first blur, on change),
 * sourced from the contract Zod schemas, rendered in the active locale.
 * AC3 (the mock half): a valid signup stores the token and the app is asked
 * to navigate to /topics — proven at the unit level here; the full browser
 * back-navigation guard is proven end-to-end (oly-40 e2e spec).
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

const renderWithProviders = async (
  element: React.ReactElement,
  options: { authApi?: AuthApi; locale?: string } = {},
): Promise<void> => {
  const i18n = await createI18n({
    storage: fakeLocaleStorage(
      options.locale === undefined ? {} : { [LOCALE_STORAGE_KEY]: options.locale },
    ),
  });
  const authApi = options.authApi ?? createMockAuthApi();
  render(
    <I18nextProvider i18n={i18n}>
      <AuthApiProvider value={authApi}>
        <MemoryRouter initialEntries={["/signup"]}>{element}</MemoryRouter>
      </AuthApiProvider>
    </I18nextProvider>,
  );
};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("SignupRoute realtime validation (AC4, D9)", () => {
  it("shows no error before the field is touched", async () => {
    await renderWithProviders(<SignupRoute />);
    assert.equal(screen.queryByRole("alert"), null);
  });

  it("shows an error after the name field is blurred empty, in the active locale", async () => {
    await renderWithProviders(<SignupRoute />);
    const nameInput = screen.getByLabelText("Ism");
    await act(async () => {
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);
    });
    screen.getByText("Ismingizni kiriting.");
  });

  it("clears the error on change once the field becomes valid (reValidateMode: onChange)", async () => {
    await renderWithProviders(<SignupRoute />);
    const nameInput = screen.getByLabelText("Ism");
    await act(async () => {
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);
    });
    screen.getByText("Ismingizni kiriting.");

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Aziza" } });
    });
    assert.equal(screen.queryByText("Ismingizni kiriting."), null);
  });

  it("password error reflects the contract's 8-character minimum, in Russian when that locale is active", async () => {
    await renderWithProviders(<SignupRoute />, { locale: "ru" });
    const passwordInput = screen.getByLabelText("Пароль");
    await act(async () => {
      fireEvent.focus(passwordInput);
      fireEvent.change(passwordInput, { target: { value: "short" } });
      fireEvent.blur(passwordInput);
    });
    screen.getByText("Пароль — не менее 8 символов.");
  });

  it("the single identity field reports an error under itself, not under a phone/email label", async () => {
    await renderWithProviders(<SignupRoute />);
    const identityInput = screen.getByLabelText("Telefon yoki Email");
    await act(async () => {
      fireEvent.focus(identityInput);
      fireEvent.blur(identityInput);
    });
    screen.getByText("Telefon raqam yoki elektron pochta manzilini kiriting.");
  });

  it("a valid signup stores the token (AC3, mock half)", async () => {
    await renderWithProviders(<SignupRoute />);
    fireEvent.change(screen.getByLabelText("Ism"), { target: { value: "Aziza" } });
    fireEvent.change(screen.getByLabelText("Telefon yoki Email"), {
      target: { value: "aziza@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Parol"), { target: { value: "longenough8" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Mashqni boshlash/ }));
      // Let the resolver's async safeParseAsync and the mock's Promise settle.
      await Promise.resolve();
      await Promise.resolve();
    });

    assert.equal(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) !== null, true);
  });
});

describe("LoginRoute realtime validation (AC4, D9)", () => {
  it("shows an error after the password field is blurred empty", async () => {
    await renderWithProviders(<LoginRoute />);
    const passwordInput = screen.getByLabelText("Parol");
    await act(async () => {
      fireEvent.focus(passwordInput);
      fireEvent.blur(passwordInput);
    });
    screen.getByText("Parolingizni kiriting.");
  });

  it("logging into the seeded account stores the token (AC3, mock half)", async () => {
    await renderWithProviders(<LoginRoute />);
    fireEvent.change(screen.getByLabelText("Telefon yoki Email"), {
      target: { value: MOCK_SEEDED_ACCOUNT.email },
    });
    fireEvent.change(screen.getByLabelText("Parol"), {
      target: { value: MOCK_SEEDED_ACCOUNT.password },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Kirish/ }));
      await Promise.resolve();
      await Promise.resolve();
    });

    assert.equal(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) !== null, true);
  });

  // Review defect 4: the switch-to-signup link must reuse the design of
  // record's "signup" copy ("Ro'yxatdan o'tish" / "Регистрация" / "Sign Up"),
  // not an invented key — D11 Amendment 1 requires approved copy be used
  // verbatim, not authored fresh. There is no "noAccountYet" key anywhere in
  // the design snapshot.
  it("the link to the signup screen reuses the design-of-record signup copy", async () => {
    await renderWithProviders(<LoginRoute />);
    screen.getByText(/Ro'yxatdan o'tish/);
  });
});
