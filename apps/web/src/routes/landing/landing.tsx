import type { CSSProperties, ReactElement } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/language-switcher/language-switcher.js";
import { Logo } from "../../components/logo/logo.js";
import { ThemeToggle } from "../../components/theme-toggle/theme-toggle.js";
import { HERO_SYMBOLS, LANDING_TOPICS } from "./landing-content.js";
import styles from "./landing.module.css";

/**
 * Landing `/` (OLY-39 S5; D11 static blocks + CTA, D11-A1 final copy).
 *
 * Structure and copy follow the design of record (snapshot App.tsx
 * LandingScreen): nav → hero with topic chips → how-it-works → AI tutor with
 * chat mock → features → target audience → final CTA → footer. All text is
 * i18n'ed from the snapshot copy; CTAs are Links into the S6 routing
 * skeleton. The screen owns its nav (switchers included), like every screen
 * in the reference — the AppShell stays a bare outlet.
 *
 * Colour derivations: where the reference used hardcoded rgba accents, the
 * CSS module derives them from tokens via color-mix() (D12 pattern) — e.g.
 * tutor bubbles from --oa-primary-strong. Runtime accents (topic chips) are
 * set inline as --topic-accent, the one inline-style case D12 legitimises.
 */

/**
 * Deterministic scatter for the hero's decorative symbols (design of record:
 * positions are a function of the index). Inline because they are runtime
 * layout values, not colours — the colour comes from the CSS module.
 */
function heroSymbolStyle(index: number): CSSProperties {
  return {
    left: `${String(5 + index * 10)}%`,
    top: `${String(10 + Math.sin(index * 1.3) * 55)}%`,
    fontSize: `${(1.2 + index * 0.25).toFixed(2)}rem`,
    transform: `rotate(${String(index * 19 - 40)}deg)`,
  };
}

interface Step {
  readonly n: string;
  readonly title: string;
  readonly desc: string;
  readonly icon: string;
}

interface ChatMessage {
  readonly from: "student" | "tutor";
  readonly text: string;
}

export function LandingRoute(): ReactElement {
  const { t } = useTranslation();

  const steps: readonly Step[] = [
    { n: "01", title: t("landing.step1Title"), desc: t("landing.step1Desc"), icon: "🗂" },
    { n: "02", title: t("landing.step2Title"), desc: t("landing.step2Desc"), icon: "✏️" },
    { n: "03", title: t("landing.step3Title"), desc: t("landing.step3Desc"), icon: "✦" },
  ];

  const tutorFeatures: readonly Omit<Step, "n">[] = [
    { title: t("landing.aiTutorF1Title"), desc: t("landing.aiTutorF1Desc"), icon: "🔍" },
    { title: t("landing.aiTutorF2Title"), desc: t("landing.aiTutorF2Desc"), icon: "🪜" },
    { title: t("landing.aiTutorF3Title"), desc: t("landing.aiTutorF3Desc"), icon: "🤔" },
  ];

  const features: readonly Omit<Step, "n">[] = [
    { title: t("landing.feat1Title"), desc: t("landing.feat1Desc"), icon: "💡" },
    { title: t("landing.feat2Title"), desc: t("landing.feat2Desc"), icon: "🤔" },
    { title: t("landing.feat3Title"), desc: t("landing.feat3Desc"), icon: "📈" },
  ];

  const chat: readonly ChatMessage[] = [
    { from: "student", text: t("landing.chat1") },
    { from: "tutor", text: t("landing.chat2") },
    { from: "student", text: t("landing.chat3") },
    { from: "tutor", text: t("landing.chat4") },
    { from: "student", text: t("landing.chat5") },
    { from: "tutor", text: t("landing.chat6") },
  ];

  return (
    <div className={styles["page"]}>
      <nav className={styles["nav"]}>
        <div className={styles["navInner"]}>
          <Link to="/" className={styles["brand"]}>
            <Logo size={32} />
            <span className={styles["brandName"]}>Olympiad Academy</span>
          </Link>
          <div className={styles["navActions"]}>
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/login" className={styles["navLogin"]}>
              {t("landing.login")}
            </Link>
            <Link to="/signup" className={styles["navCta"]}>
              {t("landing.cta")}
            </Link>
          </div>
        </div>
      </nav>

      <section className={styles["hero"]}>
        <div className={styles["heroDecor"]} aria-hidden="true">
          <div className={styles["heroGlow"]} />
          {HERO_SYMBOLS.map((symbol, i) => (
            <span key={symbol} className={styles["heroSymbol"]} style={heroSymbolStyle(i)}>
              {symbol}
            </span>
          ))}
        </div>
        <div className={styles["heroInner"]}>
          <div className={styles["badge"]}>🇺🇿 {t("landing.gradeLabel")}</div>
          <h1 className={styles["heroTitle"]}>{t("landing.hero")}</h1>
          <p className={styles["heroSub"]}>{t("landing.heroSub")}</p>
          <div className={styles["heroCtas"]}>
            <Link to="/signup" className={styles["ctaPrimary"]}>
              {t("landing.cta")} →
            </Link>
            <Link to="/login" className={styles["ctaSecondary"]}>
              {t("landing.login")}
            </Link>
          </div>
          <div className={styles["chips"]}>
            {LANDING_TOPICS.map((topic) => (
              <span
                key={topic.id}
                className={styles["chip"]}
                style={{ "--topic-accent": topic.accent } as CSSProperties}
              >
                {t(`landing.topics.${topic.key}`)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles["section"]}>
        <div className={styles["sectionInner"]}>
          <div className={styles["sectionKicker"]}>{t("landing.howItWorks")}</div>
          <div className={styles["cardsGrid"]}>
            {steps.map((step) => (
              <div key={step.n} className={styles["card"]}>
                <div className={styles["stepNumber"]}>{step.n}</div>
                <div className={styles["stepIcon"]}>{step.icon}</div>
                <div className={styles["cardTitle"]}>{step.title}</div>
                <p className={styles["cardDesc"]}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles["section"]}>
        <div className={styles["tutorGrid"]}>
          <div>
            <div className={styles["tutorBadge"]}>✦ {t("landing.aiTutorKicker")}</div>
            <h2 className={styles["tutorTitle"]}>{t("landing.aiTutorTitle")}</h2>
            <p className={styles["tutorDesc"]}>{t("landing.aiTutorDesc")}</p>
            <div className={styles["tutorFeatures"]}>
              {tutorFeatures.map((feature) => (
                <div key={feature.title} className={styles["tutorFeature"]}>
                  <div className={styles["tutorFeatureIcon"]}>{feature.icon}</div>
                  <div>
                    <div className={styles["tutorFeatureTitle"]}>{feature.title}</div>
                    <p className={styles["cardDesc"]}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles["chat"]}>
            <div className={styles["chatHeader"]}>
              <div className={styles["chatAvatar"]}>✦</div>
              <span className={styles["chatTitle"]}>{t("landing.aiTutorKicker")}</span>
              <span className={styles["chatTag"]}>{t("landing.chatTag")}</span>
            </div>
            <div className={styles["chatMessages"]}>
              {chat.map((message, i) => (
                <div
                  key={i}
                  className={message.from === "student" ? styles["rowStudent"] : styles["rowTutor"]}
                >
                  <div
                    className={
                      message.from === "student" ? styles["messageStudent"] : styles["messageTutor"]
                    }
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div className={styles["rowTutor"]}>
                <div className={styles["typing"]}>
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className={styles["typingDot"]}
                      style={{ animationDelay: `${String(dot * 0.18)}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles["section"]}>
        <div className={styles["sectionInner"]}>
          <div className={styles["sectionKicker"]}>{t("landing.featuresTitle")}</div>
          <div className={styles["cardsGrid"]}>
            {features.map((feature) => (
              <div key={feature.title} className={styles["card"]}>
                <div className={styles["featureIcon"]}>{feature.icon}</div>
                <div className={styles["cardTitle"]}>{feature.title}</div>
                <p className={styles["cardDesc"]}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles["section"]}>
        <div className={styles["target"]}>
          <div className={styles["sectionKicker"]}>{t("landing.targetTitle")}</div>
          <p className={styles["targetText"]}>{t("landing.targetDesc")}</p>
        </div>
      </section>

      <section className={styles["section"]}>
        <div className={styles["sectionInner"]}>
          <div className={styles["ctaCard"]}>
            <h2 className={styles["ctaTitle"]}>{t("landing.hero").split("\n")[0]}</h2>
            <p className={styles["ctaNote"]}>{t("landing.footerNote")}</p>
            <Link to="/signup" className={styles["ctaPrimary"]}>
              {t("landing.cta")} →
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles["footer"]}>
        <span>© 2026 Olympiad Academy</span>
        <span>{t("landing.gradeLabel")}</span>
      </footer>
    </div>
  );
}
