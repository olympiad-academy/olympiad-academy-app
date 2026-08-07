/**
 * The minimal storage seam every persisted user preference (locale, colour
 * mode, …) is written against. One shared shape — defined once here — keeps
 * the i18n and theme modules testable outside the browser without each
 * declaring its own identical interface (independent review, 2026-08-06).
 */
export interface PreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
