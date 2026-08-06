import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { buildLandingContent } from "./landing-content.js";
import { LandingCta } from "./sections/landing-cta.js";
import { LandingFeatures } from "./sections/landing-features.js";
import { LandingFooter } from "./sections/landing-footer.js";
import { LandingHero } from "./sections/landing-hero.js";
import { LandingNav } from "./sections/landing-nav.js";
import { LandingFlow } from "./sections/landing-flow.js";
import { LandingTarget } from "./sections/landing-target.js";
import { LandingTutor } from "./sections/landing-tutor.js";
import styles from "./landing.module.css";

/**
 * Landing `/` (OLY-39 S5; D11 static blocks + CTA, D11-A1 final copy).
 *
 * Composition root only — every block is its own component with its own CSS
 * Module under sections/ (clean-code: split big components, files ≤400
 * lines). Structure and copy follow the design of record (snapshot App.tsx
 * LandingScreen). CTAs are Links into the S6 routing skeleton.
 *
 * i18n seam rule for sections: repeated card/chat collections arrive as
 * props from buildLandingContent (one mapping place, covered by the
 * resolved-copy tests); one-off strings (kickers, hero, CTA) are fetched by
 * the section itself via useTranslation.
 */
export const LandingRoute = (): ReactElement => {
  const { t } = useTranslation();
  const content = buildLandingContent(t);
  return (
    <div className={styles["page"]}>
      <LandingNav />
      <LandingHero />
      <LandingFlow flowSteps={content.flowSteps} />
      <LandingTutor tutorFeatures={content.tutorFeatures} chat={content.chat} />
      <LandingFeatures features={content.features} />
      <LandingTarget />
      <LandingCta />
      <LandingFooter />
    </div>
  );
};
