import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { FlowStep } from "../landing-content.js";
import { SectionCards } from "./section-cards.js";

/** «How it works» — the numbered flow steps (design name: flow). */
export const LandingFlow = ({ flowSteps }: { flowSteps: readonly FlowStep[] }): ReactElement => {
  const { t } = useTranslation();
  return <SectionCards kicker={t("landing.howItWorks")} cards={flowSteps} numbered />;
};
