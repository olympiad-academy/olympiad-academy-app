import "./helpers/dom.js";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import {
  createI18n,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type LocaleStorage,
} from "@/i18n/index.js";
import { THEME_STORAGE_KEY } from "@/theme/index.js";
import { LanguageSwitcher } from "@/components/language-switcher/language-switcher.js";
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle.js";

function fakeStorage(initial: Record<string, string> = {}): LocaleStorage & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("LanguageSwitcher (D1, AC1)", () => {
  it("renders exactly one option per contract locale, labelled in full, current one active", async () => {
    const i18n = await createI18n({ storage: fakeStorage() });
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>,
    );

    // The group carries the translated label of the control (uz default).
    screen.getByRole("radiogroup", { name: "Til" });

    const options = screen.getAllByRole("radio");
    assert.equal(options.length, SUPPORTED_LOCALES.length);

    // Full translated names as accessible labels (design shows short codes visually).
    screen.getByRole("radio", { name: "O'zbekcha" });
    screen.getByRole("radio", { name: "Русский" });
    screen.getByRole("radio", { name: "English" });

    // Default locale uz is the active segment.
    assert.equal(screen.getByRole("radio", { name: "O'zbekcha" }).getAttribute("data-state"), "on");
    assert.equal(screen.getByRole("radio", { name: "Русский" }).getAttribute("data-state"), "off");
  });

  it("switches the language, moves the active segment and persists the choice", async () => {
    const storage = fakeStorage();
    const i18n = await createI18n({ storage });
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Русский" }));

    await waitFor(() => assert.equal(i18n.language, "ru"));
    assert.equal(storage.data[LOCALE_STORAGE_KEY], "ru");
    await waitFor(() =>
      assert.equal(screen.getByRole("radio", { name: "Русский" }).getAttribute("data-state"), "on"),
    );
    // Group label re-translates into the newly active locale.
    await waitFor(() => screen.getByRole("radiogroup", { name: "Язык" }));
  });
});

describe("ThemeToggle (D12)", () => {
  it("starts from the stored/default mode and offers the opposite mode", async () => {
    const i18n = await createI18n({ storage: fakeStorage() });
    render(
      <I18nextProvider i18n={i18n}>
        <ThemeToggle />
      </I18nextProvider>,
    );

    // No stored choice -> dark default (design of record), offered action: go light.
    screen.getByRole("button", { name: "Yorug' rejimga o'tish" });
  });

  it("toggles data-theme on <html>, persists the choice and flips the offered action", async () => {
    const i18n = await createI18n({ storage: fakeStorage() });
    render(
      <I18nextProvider i18n={i18n}>
        <ThemeToggle />
      </I18nextProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Yorug' rejimga o'tish" }));

    assert.equal(document.documentElement.getAttribute("data-theme"), "light");
    assert.equal(window.localStorage.getItem(THEME_STORAGE_KEY), "light");
    screen.getByRole("button", { name: "Qorong'i rejimga o'tish" });

    fireEvent.click(screen.getByRole("button", { name: "Qorong'i rejimga o'tish" }));

    assert.equal(document.documentElement.getAttribute("data-theme"), "dark");
    assert.equal(window.localStorage.getItem(THEME_STORAGE_KEY), "dark");
  });
});
