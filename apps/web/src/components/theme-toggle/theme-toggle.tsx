import { useState, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { ThemeMode } from "@olympiad-academy-app/ui";
import { nextThemeMode, readStoredThemeMode, setThemeMode } from "@/theme/index.js";
import styles from "./theme-toggle.module.css";

/**
 * Colour-mode toggle (OLY-39 S4, decision D12).
 *
 * The design of record places this next to the LanguageSwitcher in every
 * screen's navigation. It shows the icon of the mode you will get (sun in
 * dark mode = "switch to light", moon in light mode = "switch to dark"),
 * matching the reference implementation. The initial state is read from
 * storage — the inline snippet in index.html has already applied it to
 * <html data-theme> before first paint, so the toggle never shows a mode
 * different from what is on screen.
 */
export function ThemeToggle(): ReactElement {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ThemeMode>(() => readStoredThemeMode(window.localStorage));

  const handleToggle = (): void => {
    const next = nextThemeMode(mode);
    setThemeMode(window.localStorage, next);
    setMode(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={t(mode === "dark" ? "themeToggle.toLight" : "themeToggle.toDark")}
      className={styles["button"]}
    >
      {mode === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

/** Sun — shown in dark mode (the action offered is "go light"). From the design of record. */
function SunIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1v1M7 12v1M1 7H2M12 7h1M2.93 2.93l.7.7M10.37 10.37l.7.7M2.93 11.07l.7-.7M10.37 3.63l.7-.7M9.5 7a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Moon — shown in light mode (the action offered is "go dark"). From the design of record. */
function MoonIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M11.5 7.5A4.5 4.5 0 017 12a4.5 4.5 0 010-9c.3 0 .6.03.88.08A3.5 3.5 0 009.5 7c0 1.16.56 2.18 1.42 2.83.37-.74.58-1.59.58-2.33z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
