import type { CSSProperties, ReactElement } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TopicChip } from "@/components/topic-chip/topic-chip.js";
import { HERO_SYMBOLS, HERO_TOPICS } from "../landing-content.js";
import styles from "./landing-hero.module.css";

/**
 * Deterministic scatter for the hero's decorative symbols (design of record:
 * positions are a function of the index). Inline because they are runtime
 * layout values, not colours — the colour comes from the CSS module.
 */
const heroSymbolStyle = (index: number): CSSProperties => {
  return {
    left: `${String(5 + index * 10)}%`,
    top: `${String(10 + Math.sin(index * 1.3) * 55)}%`,
    fontSize: `${(1.2 + index * 0.25).toFixed(2)}rem`,
    transform: `rotate(${String(index * 19 - 40)}deg)`,
  };
};

/** Hero: badge, pre-line title, sub, CTA pair, topic chips over a decorated glow. */
export const LandingHero = (): ReactElement => {
  const { t } = useTranslation();
  return (
    <section className={styles["hero"]}>
      <div className={styles["decor"]} aria-hidden="true">
        <div className={styles["glow"]} />
        {HERO_SYMBOLS.map((symbol, index) => (
          <span key={symbol} className={styles["symbol"]} style={heroSymbolStyle(index)}>
            {symbol}
          </span>
        ))}
      </div>
      <div className={styles["inner"]}>
        <div className={styles["badge"]}>🇺🇿 {t("landing.gradeLabel")}</div>
        <h1 className={styles["title"]}>{t("landing.hero")}</h1>
        <p className={styles["sub"]}>{t("landing.heroSub")}</p>
        <div className={styles["ctas"]}>
          <Link to="/signup" className={styles["ctaPrimary"]}>
            {t("landing.cta")} →
          </Link>
          <Link to="/login" className={styles["ctaSecondary"]}>
            {t("landing.login")}
          </Link>
        </div>
        <div className={styles["chips"]}>
          {HERO_TOPICS.map((topic) => (
            <TopicChip
              key={topic.id}
              accent={topic.accent}
              label={t(`landing.topics.${topic.id}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
