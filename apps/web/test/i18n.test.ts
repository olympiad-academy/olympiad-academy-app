import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LanguageSchema } from "@olympiad-academy-app/api-client";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  createI18n,
  type LocaleStorage,
} from "@/i18n/index.js";
import { en } from "@/i18n/locales/en.js";
import { ru } from "@/i18n/locales/ru.js";
import { uz } from "@/i18n/locales/uz.js";

const fakeStorage = (
  initial: Record<string, string> = {},
): LocaleStorage & { data: Record<string, string> } => {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
};

describe("i18n module (D1)", () => {
  it("exposes exactly the locales from the contract LanguageSchema (no duplicated enum)", () => {
    assert.deepEqual([...SUPPORTED_LOCALES].sort(), [...LanguageSchema.options].sort());
  });

  it("defaults to uz when no stored preference exists", async () => {
    const i18n = await createI18n({ storage: fakeStorage() });
    assert.equal(i18n.language, DEFAULT_LOCALE);
    assert.equal(DEFAULT_LOCALE, "uz");
  });

  it("uses the stored locale on init", async () => {
    const i18n = await createI18n({
      storage: fakeStorage({ [LOCALE_STORAGE_KEY]: "ru" }),
    });
    assert.equal(i18n.language, "ru");
  });

  it("persists language changes to storage", async () => {
    const storage = fakeStorage();
    const i18n = await createI18n({ storage });
    await i18n.changeLanguage("en");
    assert.equal(storage.data[LOCALE_STORAGE_KEY], "en");
  });

  it("falls back to uz for an invalid stored locale", async () => {
    const i18n = await createI18n({
      storage: fakeStorage({ [LOCALE_STORAGE_KEY]: "klingon" }),
    });
    assert.equal(i18n.language, DEFAULT_LOCALE);
  });

  it("has resource bundles for every supported locale", async () => {
    const i18n = await createI18n({ storage: fakeStorage() });
    for (const locale of SUPPORTED_LOCALES) {
      assert.ok(i18n.hasResourceBundle(locale, "translation"), `missing bundle: ${locale}`);
    }
  });

  // The canary is a key the landing actually renders, so this fails if the copy
  // for a locale goes missing. A key nothing renders would keep passing while
  // the screen showed raw key strings — which is exactly how the flowStep*
  // rename slipped through once already.
  it("translates a core key in every locale (chrome strings exist)", async () => {
    const i18n = await createI18n({ storage: fakeStorage() });
    for (const locale of SUPPORTED_LOCALES) {
      const t = i18n.getFixedT(locale);
      const value = t("landing.hero");
      assert.ok(value.length > 0 && value !== "landing.hero", `missing landing.hero for ${locale}`);
    }
  });

  // Regression guard: a rename applied to two locales but not the third once
  // shipped silently because i18next returns the raw key on a miss instead
  // of throwing, so every unit test that only checks "truthy" stayed green
  // (see docs/decisions handoff, "i18n key drift"). Flattening every locale's
  // key paths and diffing the sets catches that class of bug mechanically.
  const flattenKeys = (value: unknown, prefix = ""): string[] => {
    if (typeof value !== "object" || value === null) {
      return [prefix];
    }
    return Object.entries(value).flatMap(([key, nested]) =>
      flattenKeys(nested, prefix === "" ? key : `${prefix}.${key}`),
    );
  };

  it("has an identical key set across uz, ru and en (no drift)", () => {
    const uzKeys = new Set(flattenKeys(uz));
    const ruKeys = new Set(flattenKeys(ru));
    const enKeys = new Set(flattenKeys(en));
    assert.deepEqual([...ruKeys].sort(), [...uzKeys].sort(), "ru has drifted from uz");
    assert.deepEqual([...enKeys].sort(), [...uzKeys].sort(), "en has drifted from uz");
  });
});
