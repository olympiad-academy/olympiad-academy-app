// Design tokens for the @olympiad-academy-app/ui package (DL-16). Narrow:
// tokens/primitives/accessibility only; no app/api/Prisma/api-client code, no
// routes, API calls, navigation, persistence, or domain rules.
//
// Source of record: `.vibe/evidence/oly-19/design/theme.ts` (D11 Amendment 1).
// Colours are transcribed from it. The numeric scales below did NOT exist there
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
    textSubtle: "rgba(247,247,251,0.50)",
    textFaint: "rgba(247,247,251,0.38)",
    textOnAccent: "#f8f7ff",
    border: "rgba(247,247,251,0.09)",
    border2: "rgba(247,247,251,0.06)",
    divider: "rgba(247,247,251,0.075)",
    primary: "#818cf8",
    primaryStrong: "#6366f1",
    primarySoft: "rgba(129,140,248,0.14)",
    primaryBorder: "rgba(129,140,248,0.38)",
    primaryGradient: "linear-gradient(135deg,#6366f1,#a855f7)",
    focusRing: "rgba(129,140,248,0.74)",
    glowBg:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.2) 0%, transparent 70%)",
    inputBg: "rgba(247,247,251,0.07)",
    inputBorder: "rgba(247,247,251,0.12)",
    inputBorderFocus: "rgba(129,140,248,0.74)",
    langActiveBg: "rgba(247,247,251,0.15)",
    langInactiveColor: "rgba(247,247,251,0.50)",
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
  }),
  light: Object.freeze({
    bg: "#f2f2f8",
    surface: "#ffffff",
    surface2: "rgba(15,15,26,0.025)",
    surfaceHover: "rgba(15,15,26,0.05)",
    navBg: "rgba(242,242,248,0.92)",
    text: "#171722",
    textMuted: "rgba(23,23,34,0.68)",
    textSubtle: "rgba(23,23,34,0.52)",
    textFaint: "rgba(23,23,34,0.42)",
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
    langInactiveColor: "rgba(23,23,34,0.50)",
    langBorder: "rgba(23,23,34,0.14)",
    correctBg: "rgba(5,150,105,0.08)",
    correctBorder: "rgba(5,150,105,0.24)",
    correctText: "#047857",
    correctSubText: "rgba(4,120,87,0.72)",
    wrongBg: "rgba(217,119,6,0.08)",
    wrongBorder: "rgba(217,119,6,0.25)",
    wrongText: "#b45309",
    askWhyBg: "rgba(79,70,229,0.075)",
    askWhyBorder: "rgba(79,70,229,0.24)",
    askWhyText: "#4338ca",
    askWhyInputBg: "#ffffff",
    statCardBg: "rgba(23,23,34,0.045)",
    progressBg: "rgba(23,23,34,0.09)",
  }),
});

export type ColorTokenName = keyof (typeof colorTokens)["dark"];

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
 */
export const fontFamilyTokens = Object.freeze({
  display: "'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif",
  body: "'Nunito Variable', 'Nunito', system-ui, sans-serif",
});
