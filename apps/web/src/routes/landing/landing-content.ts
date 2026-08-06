/**
 * Landing page content data (OLY-39 S5).
 *
 * Topic chips: ids, accent colours and i18n key suffixes from the design of
 * record (D11-A1 snapshot, TOPIC_META). Accents are runtime values, so per
 * D12 they are applied inline as `--topic-accent` and the translucent
 * backgrounds/borders derive from it via color-mix() in the CSS module.
 * Names come from `landing.topics.*` keys (snapshot copy, 3 locales).
 */
export interface LandingTopic {
  readonly id: string;
  readonly accent: string;
  readonly key:
    | "numbers"
    | "fractions"
    | "decimals"
    | "measurement"
    | "geometry"
    | "algebra"
    | "percentages";
}

export const LANDING_TOPICS: readonly LandingTopic[] = [
  { id: "numbers", accent: "#60a5fa", key: "numbers" },
  { id: "fractions", accent: "#a78bfa", key: "fractions" },
  { id: "decimals", accent: "#2dd4bf", key: "decimals" },
  { id: "measurement", accent: "#fbbf24", key: "measurement" },
  { id: "geometry", accent: "#fb923c", key: "geometry" },
  { id: "algebra", accent: "#f472b6", key: "algebra" },
  { id: "percentages", accent: "#34d399", key: "percentages" },
] as const;

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
