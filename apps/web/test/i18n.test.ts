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

  it("translates a core key in every locale (chrome strings exist)", async () => {
    const i18n = await createI18n({ storage: fakeStorage() });
    for (const locale of SUPPORTED_LOCALES) {
      const t = i18n.getFixedT(locale);
      const value = t("app.name");
      assert.ok(value.length > 0 && value !== "app.name", `missing app.name for ${locale}`);
    }
  });
});
