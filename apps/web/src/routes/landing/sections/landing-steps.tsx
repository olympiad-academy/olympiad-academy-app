import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { Step } from "../landing-content.js";
import shared from "./landing-shared.module.css";
import styles from "./landing-steps.module.css";

/** «How it works» — the three numbered steps. */
export function LandingSteps({ steps }: { steps: readonly Step[] }): ReactElement {
  const { t } = useTranslation();
  return (
    <section className={shared["section"]}>
      <div className={shared["sectionInner"]}>
        <div className={shared["sectionKicker"]}>{t("landing.howItWorks")}</div>
        <div className={shared["cardsGrid"]}>
          {steps.map((step) => (
            <div key={step.stepNumber} className={shared["card"]}>
              <div className={styles["number"]}>{step.stepNumber}</div>
              <div className={styles["icon"]}>{step.icon}</div>
              <div className={shared["cardTitle"]}>{step.title}</div>
              <p className={shared["cardDesc"]}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
