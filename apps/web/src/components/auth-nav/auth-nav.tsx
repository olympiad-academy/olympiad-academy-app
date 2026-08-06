import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { LanguageSwitcher } from "@/components/language-switcher/language-switcher.js";
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle.js";
import styles from "./auth-nav.module.css";

/**
 * Minimal nav for the auth screens (design of record, AuthScreen header):
 * a back-chevron + brand text leading to the landing on the left, the two
 * preference controls on the right. No bar background or bottom border —
 * unlike the landing's sticky nav. Shared by the OLY-39 stubs now and the
 * real signup/login screens in OLY-40.
 */
export function AuthNav(): ReactElement {
  return (
    <div className={styles["nav"]}>
      <Link to="/" className={styles["back"]}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Olympiad Academy
      </Link>
      <div className={styles["actions"]}>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </div>
  );
}
