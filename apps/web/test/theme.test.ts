import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_THEME_MODE,
  nextThemeMode,
  persistThemeMode,
  readStoredThemeMode,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  type ThemeStorage,
} from "../src/theme/index.js";

const storageOf = (
  initial: Record<string, string> = {},
): ThemeStorage & { readonly data: Record<string, string> } => {
  const data: Record<string, string> = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
};

test("with nothing stored, the design of record's default mode is used", () => {
  assert.equal(readStoredThemeMode(storageOf()), DEFAULT_THEME_MODE);
  assert.equal(DEFAULT_THEME_MODE, "dark");
});

test("a stored mode is honoured", () => {
  assert.equal(readStoredThemeMode(storageOf({ [THEME_STORAGE_KEY]: "light" })), "light");
});

// localStorage is user-writable and survives deploys, so an unknown value is a
// question of when, not if. It must fall back, never propagate as a data-theme
// nobody styled.
test("an unrecognised stored value falls back instead of propagating", () => {
  for (const junk of ["", "Light", "solarized", "null", "{}"]) {
    assert.equal(readStoredThemeMode(storageOf({ [THEME_STORAGE_KEY]: junk })), DEFAULT_THEME_MODE);
  }
});

test("persisting writes under the shared key", () => {
  const storage = storageOf();
  persistThemeMode(storage, "light");
  assert.equal(storage.data[THEME_STORAGE_KEY], "light");
  assert.equal(readStoredThemeMode(storage), "light");
});

test("toggling is symmetric", () => {
  assert.equal(nextThemeMode("dark"), "light");
  assert.equal(nextThemeMode("light"), "dark");
});

// The pre-paint snippet in index.html cannot import this module — it has to run
// before any bundle loads, or the page flashes the wrong theme. That makes it a
// second copy of the key, the attribute and the default. This test is what stops
// the copy from drifting.
test("the pre-paint snippet in index.html agrees with this module", () => {
  const html = readFileSync(fileURLToPath(new URL("../index.html", import.meta.url)), "utf8");
  assert.ok(html.includes(THEME_STORAGE_KEY), `index.html does not mention ${THEME_STORAGE_KEY}`);
  assert.ok(html.includes(THEME_ATTRIBUTE), `index.html does not mention ${THEME_ATTRIBUTE}`);
  assert.ok(html.includes(DEFAULT_THEME_MODE), `index.html does not mention ${DEFAULT_THEME_MODE}`);
});
