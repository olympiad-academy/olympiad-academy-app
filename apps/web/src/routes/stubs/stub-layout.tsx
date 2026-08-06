import type { ReactElement, ReactNode } from "react";
import { Link } from "react-router-dom";
import { LanguageSwitcher } from "@/components/language-switcher/language-switcher.js";
import { Logo } from "@/components/logo/logo.js";
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle.js";
import styles from "./stubs.module.css";

/**
 * Shared shell for the routing-skeleton stubs (D2/D8): brand nav with the
 * preference controls (every screen carries them, per the design of record)
 * and a centred placeholder body. The real screens replace the stubs without
 * touching the routes (OLY-40 auth, a future task for Topic List).
 */
export function StubLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className={styles["page"]}>
      <nav className={styles["nav"]}>
        <div className={styles["navInner"]}>
          <Link to="/" className={styles["brand"]} aria-label="Olympiad Academy">
            <Logo size={28} />
          </Link>
          <div className={styles["navActions"]}>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <div className={styles["body"]}>{children}</div>
    </div>
  );
}
