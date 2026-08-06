import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { FlowStep } from "../landing-content.js";
import shared from "./landing-shared.module.css";
import styles from "./landing-flow.module.css";

/** «How it works» — the numbered flow steps (design name: flow). */
export const LandingFlow = ({ flowSteps }: { flowSteps: readonly FlowStep[] }): ReactElement => {
  const { t } = useTranslation();
  return (
    <section className={shared["section"]}>
      <div className={shared["sectionInner"]}>
        <div className={shared["sectionKicker"]}>{t("landing.howItWorks")}</div>
        <div className={shared["cardsGrid"]}>
          {flowSteps.map((step) => (
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
};
