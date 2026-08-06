import { themeModes, type ThemeMode } from "@olympiad-academy-app/ui";

/**
 * Colour-mode switching (OLY-39, decision D12).
 *
 * The design of record ships two complete colour sets and a toggle in the
 * navigation. `packages/ui` owns the values; this module owns only *which* set
 * is active — it reads the stored choice, validates it, writes it back, and
 * reflects it onto <html> as `data-theme`, which is the selector the generated
 * `tokens.css` overrides on.
 *
 * The storage seam mirrors the i18n module so both preferences behave the same
 * way and stay testable outside a browser.
 */

export const THEME_STORAGE_KEY = "oa.theme";
export const THEME_ATTRIBUTE = "data-theme";

/** Dark is the design of record's default; light is the override. */
export const DEFAULT_THEME_MODE: ThemeMode = "dark";

import type { PreferenceStorage } from "../preferences/preference-storage.js";

/** Storage seam for the theme preference (shared shape, see preferences/). */
export type ThemeStorage = PreferenceStorage;

const isThemeMode = (value: string | null): value is ThemeMode =>
  value !== null && themeModes.some((mode) => mode === value);

/**
 * Anything unrecognised falls back to the default. localStorage is user-writable
 * and outlives deploys, so a stale or hand-edited value must not reach the DOM
 * as a `data-theme` no stylesheet answers to — that renders a half-themed page.
 */
export const readStoredThemeMode = (storage: ThemeStorage): ThemeMode => {
  const stored = storage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(stored) ? stored : DEFAULT_THEME_MODE;
};

export const persistThemeMode = (storage: ThemeStorage, mode: ThemeMode): void => {
  storage.setItem(THEME_STORAGE_KEY, mode);
};

export const nextThemeMode = (mode: ThemeMode): ThemeMode => {
  return mode === "dark" ? "light" : "dark";
};

/** Reflects the mode onto <html>; no-op outside the browser. */
export const applyThemeMode = (mode: ThemeMode): void => {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.setAttribute(THEME_ATTRIBUTE, mode);
};

/**
 * Browser entrypoint. The inline snippet in index.html has already applied the
 * stored mode before first paint; this re-applies it so the attribute is correct
 * even if that snippet was stripped, and returns the mode for React to own.
 */
export const initBrowserTheme = (): ThemeMode => {
  const mode = readStoredThemeMode(window.localStorage);
  applyThemeMode(mode);
  return mode;
};

/** Persists and applies in one step — what the toggle control calls. */
export const setThemeMode = (storage: ThemeStorage, mode: ThemeMode): void => {
  persistThemeMode(storage, mode);
  applyThemeMode(mode);
};
