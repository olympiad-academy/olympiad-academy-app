import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { APP_NAME } from "@/constants/app.js";
import styles from "./landing-footer.module.css";

/** Landing footer: copyright + grade label. */
export const LandingFooter = (): ReactElement => {
  const { t } = useTranslation();
  return (
    <footer className={styles["footer"]}>
      <span>© 2026 {APP_NAME}</span>
      <span>{t("landing.gradeLabel")}</span>
    </footer>
  );
};
