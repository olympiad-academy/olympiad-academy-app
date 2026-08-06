import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { joinClassNames } from "@/lib/class-names.js";
import shared from "./landing-shared.module.css";
import styles from "./landing-target.module.css";

/** «Who is it for» — centred target-audience statement. */
export function LandingTarget(): ReactElement {
  const { t } = useTranslation();
  return (
    <section className={shared["section"]}>
      <div className={styles["inner"]}>
        <div className={joinClassNames(shared["sectionKicker"], styles["kicker"])}>
          {t("landing.targetTitle")}
        </div>
        <p className={styles["text"]}>{t("landing.targetDesc")}</p>
      </div>
    </section>
  );
}
