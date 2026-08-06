export type ThemeMode = "dark" | "light"

/**
 * Semantic UI tokens. Components consume intent (primary, textMuted, warning)
 * rather than raw palette values, so both colour modes remain consistent.
 */
export interface Theme {
  mode: ThemeMode
  // Foundations
  bg: string
  surface: string
  surface2: string
  surfaceHover: string
  navBg: string
  // Typography — never use pure white as the default reading colour.
  text: string
  textMuted: string
  textSubtle: string
  textFaint: string
  textOnAccent: string
  // Structure
  border: string
  border2: string
  divider: string
  // Brand and interaction
  primary: string
  primaryStrong: string
  primarySoft: string
  primaryBorder: string
  primaryGradient: string
  focusRing: string
  glowBg: string
  inputBg: string
  inputBorder: string
  inputBorderFocus: string
  // Controls
  langActiveBg: string
  langInactiveColor: string
  langBorder: string
  // Learning states
  correctBg: string
  correctBorder: string
  correctText: string
  correctSubText: string
  wrongBg: string
  wrongBorder: string
  wrongText: string
  hintBg: (color: string) => string
  hintBorder: (color: string) => string
  // AI tutor
  askWhyBg: string
  askWhyBorder: string
  askWhyText: string
  askWhyInputBg: string
  // Supporting surfaces
  statCardBg: string
  progressBg: string
}

export const darkTheme: Theme = {
  mode: "dark",
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
  glowBg: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.2) 0%, transparent 70%)",
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
  hintBg: (color) => `${color}08`,
  hintBorder: (color) => `${color}28`,
  askWhyBg: "rgba(129,140,248,0.08)",
  askWhyBorder: "rgba(129,140,248,0.24)",
  askWhyText: "#a5b4fc",
  askWhyInputBg: "rgba(247,247,251,0.065)",
  statCardBg: "rgba(247,247,251,0.055)",
  progressBg: "rgba(247,247,251,0.085)",
}

export const lightTheme: Theme = {
  mode: "light",
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
  glowBg: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79,70,229,0.12) 0%, transparent 70%)",
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
  hintBg: (color) => `${color}10`,
  hintBorder: (color) => `${color}38`,
  askWhyBg: "rgba(79,70,229,0.075)",
  askWhyBorder: "rgba(79,70,229,0.24)",
  askWhyText: "#4338ca",
  askWhyInputBg: "#ffffff",
  statCardBg: "rgba(23,23,34,0.045)",
  progressBg: "rgba(23,23,34,0.09)",
}
