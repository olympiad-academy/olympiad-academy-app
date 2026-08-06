import "./helpers/dom.js";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { createI18n, LOCALE_STORAGE_KEY, type LocaleStorage } from "@/i18n/index.js";
import { LandingRoute } from "@/routes/landing/landing.js";

const fakeStorage = (initial: Record<string, string> = {}): LocaleStorage => {
  const data = { ...initial };
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
};

const renderLanding = async (locale?: string): Promise<void> => {
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
};

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

  it("resolves every flow-step key — no raw i18n key may leak into the document", async () => {
    await renderLanding();

    // Regression guard for the class of bug where a key rename in the
    // locales is not mirrored at the call site: i18next silently returns
    // the key itself, and only this assertion sees it.
    screen.getByText("Mavzu tanla");
    screen.getByText("Masala yech");
    screen.getByText("AI tutordan so'ra");
    const body = document.body.textContent ?? "";
    assert.equal(
      /landing\.\w+/.test(body),
      false,
      `raw i18n key leaked: ${body.match(/landing\.\w+/)}`,
    );
  });

  it("resolves the flow steps in ru as well", async () => {
    await renderLanding("ru");

    screen.getByText("Выбери тему");
    screen.getByText("Реши задачу");
    screen.getByText("Спроси у ИИ-помощника");
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
    screen.getByText("Измерения и геометрия");
  });

  it('renders five topic chips — matching the step-1 copy ("5 тем") and fitting one row', async () => {
    await renderLanding();

    // Designer decision 2026-08-06: the hero shows the first five topics, not
    // all seven — seven wrapped to two rows, and the approved step-1 copy
    // itself says "5 олимпиадных тем". The full set lives on /topics.
    screen.getByText("Sonlar va amallar");
    screen.getByText("Kasrlar");
    screen.getByText("O'nli kasrlar");
    screen.getByText("O'lchash va ma'lumotlar");
    screen.getByText("O'lchash va geometriya");
    assert.equal(screen.queryByText("Foizlar"), null);
    assert.equal(screen.queryByText("Amallar va algebraik fikrlash"), null);
  });

  it("renders the AI tutor chat mock in the active locale", async () => {
    await renderLanding("ru");

    screen.getByText(/Складываю от 1 до 50/);
    screen.getByText(/сколько всего таких пар/);
  });
});
