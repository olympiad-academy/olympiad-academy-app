import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { Feature } from "../landing-content.js";
import { SectionCards } from "./section-cards.js";

/** «Why Olympiad Academy» — the three feature cards. */
export const LandingFeatures = ({ features }: { features: readonly Feature[] }): ReactElement => {
  const { t } = useTranslation();
  return <SectionCards kicker={t("landing.featuresTitle")} cards={features} />;
};
