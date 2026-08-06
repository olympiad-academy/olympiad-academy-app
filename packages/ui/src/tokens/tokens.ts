// Design tokens for the @olympiad-academy-app/ui package (DL-16). Narrow:
// tokens/primitives/accessibility only; no app/api/Prisma/api-client code, no
// routes, API calls, navigation, persistence, or domain rules.
//
// Source of record: `.vibe/evidence/oly-19/design/theme.ts` (D11 Amendment 1).
// Colours are transcribed from it, EXCEPT the ten accessibility overrides of
// D12 Amendment 1 (2026-08-06): text tokens that fell below WCAG AA 4.5:1 in
// the snapshot were raised to AA here, with the hierarchy faint < subtle <
// muted preserved. The exact old→new values are listed in the decision
// register (D12-A1) and in the design snapshot README's deviation list, so the
// design file can be brought in sync. test/tokens-contrast.test.ts enforces
// the AA floor mechanically. The numeric scales below did NOT exist there
// as data — in the Figma Make prototype they were Tailwind utility classes, and
// D3 rejects Tailwind, so they are derived from the values that prototype
// actually used and pinned here as the single source (OLY-39 S3b).
//
// This module is the source for BOTH platforms: web consumes it through the
// generated `tokens.css` custom properties, React Native consumes the objects
// directly. Never hardcode a colour in a CSS module or a component.

export const themeModes = Object.freeze(["dark", "light"] as const);
export type ThemeMode = (typeof themeModes)[number];

/**
 * Semantic colour tokens, one set per mode (D12). Components consume intent
 * (`primary`, `textMuted`, `wrongBg`) rather than palette values, so both modes
 * stay consistent without per-component overrides.
 *
 * Deliberately absent: the design of record also carries `hintBg(color)` and
 * `hintBorder(color)`, which are functions of a runtime topic accent. A function
 * cannot be a static custom property; per D12 those resolve through
 * `color-mix(in srgb, var(--oa-topic-accent) <n>%, transparent)` at the call
 * site, with `--oa-topic-accent` set inline on the element.
 */
export const colorTokens = Object.freeze({
  dark: Object.freeze({
    bg: "#0a0b14",
    surface: "rgba(247,247,251,0.045)",
    surface2: "rgba(247,247,251,0.03)",
    surfaceHover: "rgba(247,247,251,0.075)",
    navBg: "rgba(10,11,20,0.92)",
    text: "#f7f7fb",
    textMuted: "rgba(247,247,251,0.68)",
    textSubtle: "rgba(247,247,251,0.55)", // D12-A1: was 0.50 in the snapshot (kept above textFaint)
    textFaint: "rgba(247,247,251,0.48)", // D12-A1: was 0.38 (3.4:1, below AA)
    textOnAccent: "#f8f7ff",
    border: "rgba(247,247,251,0.09)",
    border2: "rgba(247,247,251,0.06)",
    divider: "rgba(247,247,251,0.075)",
    primary: "#818cf8",
    primaryStrong: "#6366f1",
    primarySoft: "rgba(129,140,248,0.14)",
    primaryBorder: "rgba(129,140,248,0.38)",
    primaryGradient: "linear-gradient(135deg,#5856e8,#9333ea)", // D12-A1: was #6366f1,#a855f7 (CTA label 3.7:1 at the light stop, below AA)
    focusRing: "rgba(129,140,248,0.74)",
    glowBg:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.2) 0%, transparent 70%)",
    inputBg: "rgba(247,247,251,0.07)",
    inputBorder: "rgba(247,247,251,0.12)",
    inputBorderFocus: "rgba(129,140,248,0.74)",
    langActiveBg: "rgba(247,247,251,0.15)",
    langInactiveColor: "rgba(247,247,251,0.55)", // D12-A1: tracks textSubtle, as in the snapshot
    langBorder: "rgba(247,247,251,0.14)",
    correctBg: "rgba(16,185,129,0.09)",
    correctBorder: "rgba(52,211,153,0.24)",
    correctText: "#6ee7b7",
    correctSubText: "rgba(110,231,183,0.72)",
    wrongBg: "rgba(245,158,11,0.09)",
    wrongBorder: "rgba(245,158,11,0.26)",
    wrongText: "#fcd34d",
    askWhyBg: "rgba(129,140,248,0.08)",
    askWhyBorder: "rgba(129,140,248,0.24)",
    askWhyText: "#a5b4fc",
    askWhyInputBg: "rgba(247,247,251,0.065)",
    statCardBg: "rgba(247,247,251,0.055)",
    progressBg: "rgba(247,247,251,0.085)",
    // Brand mark gradient + glyph — mode-independent by design (the logo does
    // not change with the colour mode in the design of record).
    brandGradFrom: "#6366f1",
    brandGradTo: "#a855f7",
    brandMark: "#ffffff",
  }),
  light: Object.freeze({
    bg: "#f2f2f8",
    surface: "#ffffff",
    surface2: "rgba(15,15,26,0.025)",
    surfaceHover: "rgba(15,15,26,0.05)",
    navBg: "rgba(242,242,248,0.92)",
    text: "#171722",
    textMuted: "rgba(23,23,34,0.80)", // D12-A1: was 0.68 (kept above textSubtle)
    textSubtle: "rgba(23,23,34,0.72)", // D12-A1: was 0.52 (3.5:1, below AA)
    textFaint: "rgba(23,23,34,0.62)", // D12-A1: was 0.42 (2.6:1, below AA)
    textOnAccent: "#fafaff",
    border: "rgba(23,23,34,0.10)",
    border2: "rgba(23,23,34,0.065)",
    divider: "rgba(23,23,34,0.08)",
    primary: "#4f46e5",
    primaryStrong: "#4338ca",
    primarySoft: "rgba(79,70,229,0.10)",
    primaryBorder: "rgba(79,70,229,0.34)",
    primaryGradient: "linear-gradient(135deg,#4f46e5,#9333ea)",
    focusRing: "rgba(79,70,229,0.58)",
    glowBg:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79,70,229,0.12) 0%, transparent 70%)",
    inputBg: "#ffffff",
    inputBorder: "rgba(23,23,34,0.15)",
    inputBorderFocus: "rgba(79,70,229,0.58)",
    langActiveBg: "rgba(23,23,34,0.10)",
    langInactiveColor: "rgba(23,23,34,0.72)", // D12-A1: tracks textSubtle, as in the snapshot
    langBorder: "rgba(23,23,34,0.14)",
    correctBg: "rgba(5,150,105,0.08)",
    correctBorder: "rgba(5,150,105,0.24)",
    correctText: "#047857",
    correctSubText: "#065f46", // D12-A1: was rgba(4,120,87,0.72) (2.8:1 on correctBg, below AA)
    wrongBg: "rgba(217,119,6,0.08)",
    wrongBorder: "rgba(217,119,6,0.25)",
    wrongText: "#92400e", // D12-A1: was #b45309 (4.2:1 on wrongBg, below AA)
    askWhyBg: "rgba(79,70,229,0.075)",
    askWhyBorder: "rgba(79,70,229,0.24)",
    askWhyText: "#4338ca",
    askWhyInputBg: "#ffffff",
    statCardBg: "rgba(23,23,34,0.045)",
    progressBg: "rgba(23,23,34,0.09)",
    brandGradFrom: "#6366f1",
    brandGradTo: "#a855f7",
    brandMark: "#ffffff",
  }),
});

export type ColorTokenName = keyof (typeof colorTokens)["dark"];

/**
 * Per-topic accent colours from the design of record (snapshot TOPIC_META).
 * These are runtime values, not CSS custom properties: per D12 they are set
 * inline as `--topic-accent` on the element, and translucent backgrounds and
 * borders derive from it via color-mix() at the call site. The palette itself
 * lives HERE, not in app code — the ADR's single-source rule covers runtime
 * values too.
 */
export const topicAccentTokens = Object.freeze({
  numbers: "#60a5fa",
  fractions: "#a78bfa",
  decimals: "#2dd4bf",
  measurement: "#fbbf24",
  geometry: "#fb923c",
  algebra: "#f472b6",
  percentages: "#34d399",
});

export type TopicId = keyof typeof topicAccentTokens;

/**
 * Spacing ramp in px, keyed by its own value. Every step is one the reference
 * implementation actually uses; nothing is added "for completeness". Keys carry
 * a letter prefix so they stay string keys — bare numeric keys are reordered by
 * the JS engine and would silently break scale ordering.
 */
export const spacingTokens = Object.freeze({
  s2: 2,
  s4: 4,
  s6: 6,
  s8: 8,
  s10: 10,
  s12: 12,
  s14: 14,
  s16: 16,
  s20: 20,
  s24: 24,
  s28: 28,
  s32: 32,
  s48: 48,
  s56: 56,
  s80: 80,
  s96: 96,
  s112: 112,
});

/** Corner radii in px. `rFull` is the pill/circle case. */
export const radiusTokens = Object.freeze({
  r8: 8,
  r12: 12,
  r16: 16,
  r24: 24,
  rFull: 9999,
});

/** Font sizes in px. */
export const fontSizeTokens = Object.freeze({
  f10: 10,
  f11: 11,
  f12: 12,
  f14: 14,
  f16: 16,
  f18: 18,
  f20: 20,
  f24: 24,
  f30: 30,
  f48: 48,
});

export const fontWeightTokens = Object.freeze({
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900,
});

/** Unitless line heights. */
export const lineHeightTokens = Object.freeze({
  none: 1,
  tight: 1.25,
  snug: 1.375,
  relaxed: 1.625,
});

/** In `em`, so tracking scales with the font size it is applied to. */
export const letterSpacingTokens = Object.freeze({
  tight: "-0.025em",
  wider: "0.05em",
  widest: "0.1em",
});

/**
 * The design of record loads these from the Google Fonts CDN. We self-host them
 * instead (`@fontsource-variable/*`), so the critical path carries no
 * third-party request and the app renders correctly offline — which matters for
 * a live demo. The variable face is listed first with the static face as a
 * fallback, so either package satisfies the stack.
 *
 * Display stack carries Nunito as the first fallback because Plus Jakarta Sans
 * ships no basic-cyrillic subset (U+0400–045F) at all — only cyrillic-ext.
 * Without it, every Russian heading/CTA/brand label would render in system-ui
 * while uz/en render in Plus Jakarta. Fallback is per-glyph, so Russian text
 * sets in Nunito (the brand's body face) and latin text is unaffected.
 */
export const fontFamilyTokens = Object.freeze({
  display:
    "'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', 'Nunito Variable', 'Nunito', system-ui, sans-serif",
  body: "'Nunito Variable', 'Nunito', system-ui, sans-serif",
});
