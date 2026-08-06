import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { Feature } from "../landing-content.js";
import shared from "./landing-shared.module.css";
import styles from "./landing-features.module.css";

/** «Why Olympiad Academy» — the three feature cards. */
export function LandingFeatures({ features }: { features: readonly Feature[] }): ReactElement {
  const { t } = useTranslation();
  return (
    <section className={shared["section"]}>
      <div className={shared["sectionInner"]}>
        <div className={shared["sectionKicker"]}>{t("landing.featuresTitle")}</div>
        <div className={shared["cardsGrid"]}>
          {features.map((feature) => (
            <div key={feature.title} className={shared["card"]}>
              <div className={styles["icon"]}>{feature.icon}</div>
              <div className={shared["cardTitle"]}>{feature.title}</div>
              <p className={shared["cardDesc"]}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
