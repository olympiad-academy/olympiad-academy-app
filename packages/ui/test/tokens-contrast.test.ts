import assert from "node:assert/strict";
import test from "node:test";
import { colorTokens, type ThemeMode } from "../src/index.js";

/**
 * WCAG AA floor for every text-bearing token pair (D12 Amendment 1).
 *
 * The design of record shipped several text tokens below 4.5:1; D12-A1 raised
 * them here and this test is what keeps the floor from eroding the next time a
 * token value is edited by hand. Semi-transparent tokens are composited over
 * the page background exactly as a browser would.
 */

type Rgb = readonly [number, number, number];

function parseHex(value: string): Rgb {
  const h = value.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ] as const;
}

/** `rgba(r,g,b,a)` composited over an opaque background, as the browser blends it. */
function composite(fg: Rgb, alpha: number, bg: Rgb): Rgb {
  return fg.map((channel, i) =>
    Math.round(channel * alpha + (bg[i] ?? 0) * (1 - alpha)),
  ) as unknown as Rgb;
}

/** Parses `#rrggbb` or `rgba(r,g,b,a)`; anything else (gradients) is rejected. */
function parseColor(value: string): { rgb: Rgb; alpha: number } {
  if (value.startsWith("#")) {
    return { rgb: parseHex(value), alpha: 1 };
  }
  const match = /^rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)$/.exec(value.replace(/\s/g, ""));
  assert.ok(match, `test helper cannot parse colour: ${value}`);
  return {
    rgb: [Number(match[1]), Number(match[2]), Number(match[3])] as const,
    alpha: match[4] === undefined ? 1 : Number(match[4]),
  };
}

function relativeLuminance([r, g, b]: Rgb): number {
  const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

/** A foreground token against a background token, composited over the page bg. */
function pairRatio(mode: ThemeMode, fgToken: string, bgToken = "bg"): number {
  const tokens = colorTokens[mode] as Record<string, string>;
  const pageBg = parseHex(tokens["bg"] ?? "");
  const fg = parseColor(fgToken in tokens ? (tokens[fgToken] ?? "") : fgToken);
  const bgRaw = tokens[bgToken] ?? bgToken;
  assert.ok(!bgRaw.startsWith("linear-gradient"), "use gradientStopRatio for gradients");
  const bgParsed = parseColor(bgRaw);
  const fgComposited = composite(fg.rgb, fg.alpha, pageBg);
  const bgComposited = composite(bgParsed.rgb, bgParsed.alpha, pageBg);
  return contrastRatio(fgComposited, bgComposited);
}

/** The CTA label sits on a gradient: check the worst (lightest-contrast) stop. */
function gradientStopRatio(mode: ThemeMode, fgToken: string): number {
  const tokens = colorTokens[mode] as Record<string, string>;
  const gradient = tokens["primaryGradient"] ?? "";
  const stops = [...gradient.matchAll(/#[0-9a-fA-F]{6}/g)].map((m) => m[0]);
  assert.ok(stops.length >= 2, `expected gradient stops in ${gradient}`);
  const fg = parseColor(tokens[fgToken] ?? "");
  const pageBg = parseHex(tokens["bg"] ?? "");
  const fgComposited = composite(fg.rgb, fg.alpha, pageBg);
  return Math.min(...stops.map((stop) => contrastRatio(fgComposited, parseHex(stop))));
}

const AA_NORMAL_TEXT = 4.5;

for (const mode of ["dark", "light"] as const) {
  test(`${mode}: body/secondary/caption text tokens meet WCAG AA on the page background`, () => {
    for (const token of ["text", "textMuted", "textSubtle", "textFaint", "langInactiveColor"]) {
      const ratio = pairRatio(mode, token);
      assert.ok(
        ratio >= AA_NORMAL_TEXT,
        `${mode}.${token} contrast ${ratio.toFixed(2)}:1 is below AA ${AA_NORMAL_TEXT}:1`,
      );
    }
  });

  test(`${mode}: status text tokens meet WCAG AA on their tinted backgrounds`, () => {
    const pairs: readonly (readonly [string, string])[] = [
      ["correctText", "correctBg"],
      ["correctSubText", "correctBg"],
      ["wrongText", "wrongBg"],
      ["askWhyText", "askWhyBg"],
    ];
    for (const [fg, bg] of pairs) {
      const ratio = pairRatio(mode, fg, bg);
      assert.ok(
        ratio >= AA_NORMAL_TEXT,
        `${mode}.${fg} on ${bg} contrast ${ratio.toFixed(2)}:1 is below AA ${AA_NORMAL_TEXT}:1`,
      );
    }
  });

  test(`${mode}: CTA label meets WCAG AA at both gradient stops`, () => {
    const ratio = gradientStopRatio(mode, "textOnAccent");
    assert.ok(
      ratio >= AA_NORMAL_TEXT,
      `${mode}.textOnAccent on primaryGradient worst stop ${ratio.toFixed(2)}:1 is below AA ${AA_NORMAL_TEXT}:1`,
    );
  });
}
