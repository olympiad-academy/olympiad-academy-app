import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher/language-switcher.js";
import { Logo } from "@/components/logo/logo.js";
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle.js";
import styles from "./landing-nav.module.css";

/** Sticky landing nav: brand, preference controls, login + primary CTA. */
export const LandingNav = (): ReactElement => {
  const { t } = useTranslation();
  return (
    <nav className={styles["nav"]}>
      <div className={styles["inner"]}>
        <Link to="/" className={styles["brand"]}>
          <Logo size={32} />
          <span className={styles["brandName"]}>Olympiad Academy</span>
        </Link>
        <div className={styles["actions"]}>
          <LanguageSwitcher />
          <ThemeToggle />
          <Link to="/login" className={styles["login"]}>
            {t("landing.login")}
          </Link>
          <Link to="/signup" className={styles["cta"]}>
            {t("landing.cta")}
          </Link>
        </div>
      </div>
    </nav>
  );
};
