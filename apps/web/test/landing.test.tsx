import "./helpers/dom.js";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { createI18n, LOCALE_STORAGE_KEY, type LocaleStorage } from "../src/i18n/index.js";
import { LandingRoute } from "../src/routes/landing/landing.js";

function fakeStorage(initial: Record<string, string> = {}): LocaleStorage {
  const data = { ...initial };
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

async function renderLanding(locale?: string): Promise<void> {
  const i18n = await createI18n({
    storage: fakeStorage(locale === undefined ? {} : { [LOCALE_STORAGE_KEY]: locale }),
  });
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <LandingRoute />
      </MemoryRouter>
    </I18nextProvider>,
  );
}

afterEach(() => cleanup());

describe("Landing `/` (D11 + D11-A1, copy from the design snapshot)", () => {
  it("renders the hero copy in the default locale (uz) with signup/login CTAs", async () => {
    await renderLanding();

    // The hero copy carries an explicit line break (pre-line per design).
    screen.getByRole("heading", {
      level: 1,
      name: "Olimpiada matematikasini\nmustaqil o'rgan",
    });

    // CTAs navigate to the routing skeleton paths (S6 stubs fill them in).
    const signupLinks = screen.getAllByRole("link", { name: /Bepul boshlash/ });
    assert.ok(signupLinks.length >= 2, "nav + hero + final CTA all point to signup");
    for (const link of signupLinks) {
      assert.equal(link.getAttribute("href"), "/signup");
    }
    const loginLinks = screen.getAllByRole("link", { name: "Kirish" });
    for (const link of loginLinks) {
      assert.equal(link.getAttribute("href"), "/login");
    }
  });

  it("renders all landing sections from snapshot copy", async () => {
    await renderLanding();

    // How-it-works, features, AI tutor, target audience, footer note.
    screen.getByText("Qanday ishlaydi");
    screen.getByText("Nima uchun Olympiad Academy?");
    screen.getByRole("heading", { level: 2, name: "Javobni bermaydigan AI tutor" });
    screen.getByText("Kim uchun?");
    screen.getByText(/Hozircha faqat matematika/);
  });

  it("localises into ru — including topic chips", async () => {
    await renderLanding("ru");

    screen.getByRole("heading", {
      level: 1,
      name: "Олимпиадная математика\nсамостоятельно",
    });
    screen.getByText("Как это работает");
    // Topic chips carry the localized topic names.
    screen.getByText("Дроби");
    screen.getByText("Проценты");
  });

  it("renders the seven topic chips from the design of record", async () => {
    await renderLanding();

    screen.getByText("Sonlar va amallar");
    screen.getByText("Kasrlar");
    screen.getByText("O'nli kasrlar");
    screen.getByText("O'lchash va ma'lumotlar");
    screen.getByText("O'lchash va geometriya");
    screen.getByText("Amallar va algebraik fikrlash");
    screen.getByText("Foizlar");
  });

  it("renders the AI tutor chat mock in the active locale", async () => {
    await renderLanding("ru");

    screen.getByText(/Складываю от 1 до 50/);
    screen.getByText(/сколько всего таких пар/);
  });
});
