import i18next, { type i18n } from "i18next";
import { initReactI18next } from "react-i18next";
import { LanguageSchema, type Language } from "@olympiad-academy-app/api-client";
import { uz } from "./locales/uz.js";
import { ru } from "./locales/ru.js";
import { en } from "./locales/en.js";

/**
 * i18n infrastructure (OLY-39, decision D1).
 *
 * The locale list is derived from the contract `LanguageSchema` — it is the
 * single source of truth for which languages the product ships; no duplicated
 * enum on the frontend. `uz` is the default/fallback locale (MVP ships
 * Uzbek-first). The chosen locale persists to storage (localStorage in the
 * browser) and is later sent as `signup.language` (OLY-40).
 *
 * Resources are TypeScript modules rather than JSON so the same import works
 * unchanged in Vite, tsx --test, and tsc NodeNext without import attributes.
 */

export const SUPPORTED_LOCALES = LanguageSchema.options;
export const DEFAULT_LOCALE: Language = "uz";
export const LOCALE_STORAGE_KEY = "oa.locale";

import type { PreferenceStorage } from "../preferences/preference-storage.js";

/** Storage seam for the locale preference (shared shape, see preferences/). */
export type LocaleStorage = PreferenceStorage;

const resources = {
  uz: { translation: uz },
  ru: { translation: ru },
  en: { translation: en },
} as const;

function readStoredLocale(storage: LocaleStorage): Language {
  const parsed = LanguageSchema.safeParse(storage.getItem(LOCALE_STORAGE_KEY));
  return parsed.success ? parsed.data : DEFAULT_LOCALE;
}

export interface CreateI18nOptions {
  storage: LocaleStorage;
}

export async function createI18n({ storage }: CreateI18nOptions): Promise<i18n> {
  const instance = i18next.createInstance();
  await instance.use(initReactI18next).init({
    lng: readStoredLocale(storage),
    fallbackLng: DEFAULT_LOCALE,
    resources,
    interpolation: { escapeValue: false },
  });
  instance.on("languageChanged", (lng) => {
    const parsed = LanguageSchema.safeParse(lng);
    if (parsed.success) {
      storage.setItem(LOCALE_STORAGE_KEY, parsed.data);
    }
  });
  return instance;
}

/** Keeps <html lang> in sync; no-op outside the browser. */
export function syncDocumentLanguage(i18n: i18n): void {
  if (typeof document === "undefined") {
    return;
  }
  const apply = (lng: string): void => {
    document.documentElement.lang = lng;
  };
  apply(i18n.language);
  i18n.on("languageChanged", apply);
}

/** Browser entrypoint: the app singleton backed by localStorage. */
export async function createBrowserI18n(): Promise<i18n> {
  const instance = await createI18n({ storage: window.localStorage });
  syncDocumentLanguage(instance);
  return instance;
}
