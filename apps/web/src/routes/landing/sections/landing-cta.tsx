import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { joinClassNames } from "@/lib/class-names.js";
import shared from "./landing-shared.module.css";
import styles from "./landing-cta.module.css";

/** Final CTA card. Title is its own i18n key (landing.ctaTitle). */
export function LandingCta(): ReactElement {
  const { t } = useTranslation();
  return (
    <section className={shared["section"]}>
      <div className={joinClassNames(shared["sectionInner"], styles["inner"])}>
        <div className={styles["card"]}>
          <h2 className={styles["title"]}>{t("landing.ctaTitle")}</h2>
          <p className={styles["note"]}>{t("landing.footerNote")}</p>
          <Link to="/signup" className={styles["button"]}>
            {t("landing.cta")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
