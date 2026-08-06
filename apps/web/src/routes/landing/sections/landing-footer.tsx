import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import styles from "./landing-footer.module.css";

/** Landing footer: copyright + grade label. */
export function LandingFooter(): ReactElement {
  const { t } = useTranslation();
  return (
    <footer className={styles["footer"]}>
      <span>© 2026 Olympiad Academy</span>
      <span>{t("landing.gradeLabel")}</span>
    </footer>
  );
}
