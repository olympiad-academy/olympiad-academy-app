import "./helpers/dom.js";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { createI18n, LOCALE_STORAGE_KEY, type LocaleStorage } from "../src/i18n/index.js";
import { AuthStubRoute } from "../src/routes/stubs/auth-stub.js";
import { TopicsStubRoute } from "../src/routes/stubs/topics-stub.js";

function fakeStorage(initial: Record<string, string> = {}): LocaleStorage {
  const data = { ...initial };
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

async function renderStub(element: ReactElement, locale?: string): Promise<void> {
  const i18n = await createI18n({
    storage: fakeStorage(locale === undefined ? {} : { [LOCALE_STORAGE_KEY]: locale }),
  });
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>{element}</MemoryRouter>
    </I18nextProvider>,
  );
}

import type { ReactElement } from "react";

afterEach(() => cleanup());

describe("Routing skeleton stubs (D2/D8, AC2)", () => {
  it("signup stub renders an i18n'ed placeholder and links back home", async () => {
    await renderStub(<AuthStubRoute kind="signup" />);

    screen.getByRole("heading", { level: 1, name: "Ro'yxatdan o'tish" });
    screen.getByText(/OLY-40/);
    const home = screen.getByRole("link", { name: "Bosh sahifa" });
    assert.equal(home.getAttribute("href"), "/");
  });

  it("login stub renders an i18n'ed placeholder", async () => {
    await renderStub(<AuthStubRoute kind="login" />);

    screen.getByRole("heading", { level: 1, name: "Kirish" });
    screen.getByText(/OLY-40/);
  });

  it("stubs localise — ru stored locale renders Russian copy", async () => {
    await renderStub(<AuthStubRoute kind="signup" />, "ru");

    screen.getByRole("heading", { level: 1, name: "Регистрация" });
  });

  it("topics stub carries the topic list in the spirit of the Topic List design (D8)", async () => {
    await renderStub(<TopicsStubRoute />);

    screen.getByRole("heading", { level: 1, name: "Mavzular" });
    // The seven design-of-record topics, localised — a styled preview, not
    // the real screen (that is a separate future task).
    screen.getByText("Kasrlar");
    screen.getByText("Foizlar");
  });

  it("topics stub localises topic names (ru)", async () => {
    await renderStub(<TopicsStubRoute />, "ru");

    screen.getByRole("heading", { level: 1, name: "Темы" });
    screen.getByText("Дроби");
  });
});
