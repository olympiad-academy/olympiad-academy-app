// Renders the token objects as CSS custom properties (OLY-39 S3c, D3, D12).
//
// The output is committed as `tokens.css` so the web build needs no generation
// step, and `test/tokens-css.test.ts` asserts the committed file is exactly this
// function's output — that assertion is what keeps the two from drifting.
//
// Regenerate with: pnpm --filter @olympiad-academy-app/ui run gen:tokens

import { format, resolveConfig } from "prettier";
import {
  colorTokens,
  fontFamilyTokens,
  fontSizeTokens,
  fontWeightTokens,
  letterSpacingTokens,
  lineHeightTokens,
  radiusTokens,
  spacingTokens,
  themeModes,
} from "./tokens.js";

export const TOKENS_CSS_PATH = "tokens.css";

const PREFIX = "--oa";

/**
 * `textMuted` → `--oa-text-muted`. Only a case change starts a new word, so
 * `surface2` stays `--oa-surface2` rather than becoming `--oa-surface-2`, which
 * would read as a scale step.
 */
export const cssVarName = (tokenName: string): string =>
  `${PREFIX}-${tokenName.replace(/([A-Z])/g, "-$1").toLowerCase()}`;

const declaration = (name: string, value: string): string => `  ${name}: ${value};`;

const block = (selector: string, lines: readonly string[]): string =>
  `${selector} {\n${lines.join("\n")}\n}`;

const scale = (
  group: string,
  entries: Readonly<Record<string, number | string>>,
  unit = "",
): readonly string[] =>
  Object.entries(entries).map(([key, value]) =>
    declaration(`${PREFIX}-${group}-${stripScalePrefix(key)}`, `${String(value)}${unit}`),
  );

/**
 * Scale keys carry a letter prefix only to stay string-keyed (`s16`, `f14`);
 * CSS drops it, so `--oa-space-16` reads as its own px value. Word keys like
 * `rFull` or `black` lose the same prefix and kebab-case: `--oa-radius-full`.
 */
const stripScalePrefix = (key: string): string =>
  /^[srf][\dA-Z]/.test(key)
    ? key.slice(1).replace(/^([A-Z])/, (letter) => letter.toLowerCase())
    : key.replace(/([A-Z])/g, "-$1").toLowerCase();

export const renderTokensCss = (): string => {
  const [defaultMode, ...overrideModes] = themeModes;

  const blocks = [
    block(":root", [
      // Native widgets (scrollbars, form controls, Chrome autofill) follow
      // the active mode instead of staying light on a dark page.
      declaration("color-scheme", defaultMode),
      "",
      ...Object.entries(colorTokens[defaultMode]).map(([name, value]) =>
        declaration(cssVarName(name), value),
      ),
      "",
      ...scale("space", spacingTokens, "px"),
      "",
      ...scale("radius", radiusTokens, "px"),
      "",
      ...scale("font-size", fontSizeTokens, "px"),
      ...scale("font-weight", fontWeightTokens),
      ...scale("line-height", lineHeightTokens),
      ...scale("letter-spacing", letterSpacingTokens),
      "",
      ...scale("font-family", fontFamilyTokens),
    ]),
    ...overrideModes.map((mode) =>
      block(`[data-theme="${mode}"]`, [
        declaration("color-scheme", mode),
        "",
        ...Object.entries(colorTokens[mode]).map(([name, value]) =>
          declaration(cssVarName(name), value),
        ),
      ]),
    ),
  ];

  return `${HEADER}\n${blocks.join("\n\n")}\n`;
};

/**
 * The stylesheet as it is written to disk: the rendered tokens, run through
 * Prettier with the repository's own configuration.
 *
 * Formatting here rather than leaving the raw string is what lets `tokens.css`
 * satisfy the repo-wide `format:check` like any other file, even though nobody
 * writes it by hand. It also keeps the drift test a plain byte comparison —
 * a test that had to ignore whatever Prettier rewrites (spacing, quotes,
 * trailing zeros, line wrapping of long values) would end up comparing very
 * little.
 */
export const formatTokensCss = async (): Promise<string> => {
  const options = await resolveConfig(TOKENS_CSS_PATH);
  return format(renderTokensCss(), { ...options, parser: "css" });
};

const HEADER = `/* GENERATED FILE — do not edit by hand.
 * Source: packages/ui/src/tokens/tokens.ts
 * Regenerate: pnpm --filter @olympiad-academy-app/ui run gen:tokens
 *
 * :root is the dark mode (the design of record's default). Light mode is an
 * override on [data-theme="light"], set on <html> before first paint (D12).
 */`;
