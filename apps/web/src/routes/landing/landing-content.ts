/**
 * Landing page content data (OLY-39 S5).
 *
 * Topic list from the design of record (D11-A1 snapshot, TOPIC_META). The
 * accent palette itself lives in packages/ui (topicAccentTokens) — the
 * single-source rule covers runtime values too; names come from
 * `landing.topics.*` i18n keys (snapshot copy, 3 locales).
 */
import { topicAccentTokens, type TopicId } from "@olympiad-academy-app/ui";

export interface LandingTopic {
  readonly id: TopicId;
  readonly accent: string;
}

export const LANDING_TOPICS: readonly LandingTopic[] = (
  Object.entries(topicAccentTokens) as [TopicId, string][]
).map(([id, accent]) => ({ id, accent }));

/**
 * The hero shows the FIRST FIVE topics, not all seven (designer decision
 * 2026-08-06): seven chips wrapped to a second row, and the approved step-1
 * copy itself says "5 олимпиадных тем" — five also makes chips and copy
 * agree. The full set renders on the /topics stub.
 */
export const HERO_TOPICS: readonly LandingTopic[] = LANDING_TOPICS.slice(0, 5);

/**
 * Decorative math symbols scattered over the hero (design of record). Only
 * the glyph list lives here; positions are computed at render.
 */
export const HERO_SYMBOLS = ["∑", "π", "∞", "√", "∫", "≈", "Δ", "ℤ", "n!", "⟳"] as const;

/** A titled icon card on the landing. Steps extend it with their number. */
export interface Feature {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

export interface Step extends Feature {
  readonly stepNumber: string;
}

export interface ChatMessage {
  readonly from: "student" | "tutor";
  readonly text: string;
}

export interface LandingContent {
  readonly steps: readonly Step[];
  readonly tutorFeatures: readonly Feature[];
  readonly features: readonly Feature[];
  readonly chat: readonly ChatMessage[];
}

type Translate = (key: string) => string;

/** Builds the landing's structured content from the i18n copy (D11-A1). */
export function buildLandingContent(t: Translate): LandingContent {
  return {
    steps: [
      {
        stepNumber: "01",
        title: t("landing.step1Title"),
        description: t("landing.step1Desc"),
        icon: "🗂",
      },
      {
        stepNumber: "02",
        title: t("landing.step2Title"),
        description: t("landing.step2Desc"),
        icon: "✏️",
      },
      {
        stepNumber: "03",
        title: t("landing.step3Title"),
        description: t("landing.step3Desc"),
        icon: "✦",
      },
    ],
    tutorFeatures: [
      { title: t("landing.aiTutorF1Title"), description: t("landing.aiTutorF1Desc"), icon: "🔍" },
      { title: t("landing.aiTutorF2Title"), description: t("landing.aiTutorF2Desc"), icon: "🪜" },
      { title: t("landing.aiTutorF3Title"), description: t("landing.aiTutorF3Desc"), icon: "🤔" },
    ],
    features: [
      { title: t("landing.feat1Title"), description: t("landing.feat1Desc"), icon: "💡" },
      { title: t("landing.feat2Title"), description: t("landing.feat2Desc"), icon: "🤔" },
      { title: t("landing.feat3Title"), description: t("landing.feat3Desc"), icon: "📈" },
    ],
    chat: [
      { from: "student", text: t("landing.chat1") },
      { from: "tutor", text: t("landing.chat2") },
      { from: "student", text: t("landing.chat3") },
      { from: "tutor", text: t("landing.chat4") },
      { from: "student", text: t("landing.chat5") },
      { from: "tutor", text: t("landing.chat6") },
    ],
  };
}
