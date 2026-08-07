import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { colorTokens, fontFamilyTokens, letterSpacingTokens, themeModes } from "../src/index.js";
import {
  cssVarName,
  formatTokensCss,
  renderTokensCss,
  TOKENS_CSS_PATH,
} from "../src/tokens/css.js";

const committed = (): string =>
  readFileSync(fileURLToPath(new URL(`../src/tokens/${TOKENS_CSS_PATH}`, import.meta.url)), "utf8");

/**
 * Returns the declarations inside a rule. Matched as a real block at line start,
 * not by `indexOf` on the selector text: the header comment also mentions
 * `[data-theme="light"]`, and a substring search finds that first, which makes
 * the surrounding assertion silently vacuous.
 */
const blockBody = (css: string, selector: string): string => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^${escaped} \\{\\n([\\s\\S]*?)\\n\\}`, "m").exec(css);
  assert.ok(match !== null, `no "${selector}" block in the stylesheet`);
  return match[1] ?? "";
};

// The generated stylesheet is committed so the web build needs no generation
// step. That only stays honest if drift is caught: this assertion fails when
// someone changes a token and forgets to regenerate, or hand-edits the CSS.
//
// It compares against the Prettier-formatted render, which is what `gen:tokens`
// writes — so a pass proves both that the file is current AND that it satisfies
// the repo-wide format gate, with no normalisation to weaken the comparison.
test("committed tokens.css is exactly the generator output", async () => {
  assert.equal(committed(), await formatTokensCss());
});

test("var names are derived predictably from token names", () => {
  assert.equal(cssVarName("bg"), "--oa-bg");
  assert.equal(cssVarName("textMuted"), "--oa-text-muted");
  assert.equal(cssVarName("askWhyBg"), "--oa-ask-why-bg");
  // digits are part of the name, not a new word — `surface2` must not become
  // `surface-2`, which would read as an unrelated scale step
  assert.equal(cssVarName("surface2"), "--oa-surface2");
});

test(":root carries every colour token at its dark value", () => {
  const root = blockBody(renderTokensCss(), ":root");
  for (const [name, value] of Object.entries(colorTokens.dark)) {
    assert.ok(root.includes(`${cssVarName(name)}: ${value};`), `:root is missing ${name}`);
  }
});

test('[data-theme="light"] overrides every colour token', () => {
  const light = blockBody(renderTokensCss(), '[data-theme="light"]');
  for (const [name, value] of Object.entries(colorTokens.light)) {
    assert.ok(light.includes(`${cssVarName(name)}: ${value};`), `light is missing ${name}`);
  }
});

// A mode selector that resolves to nothing is worse than a missing one: the page
// renders half-themed instead of failing loudly. Every declared mode must have a
// real block, and the light block must not silently repeat the dark values.
test("every declared mode has a block that actually overrides", () => {
  const css = renderTokensCss();
  assert.ok(blockBody(css, ":root").length > 0, "dark mode block is empty");
  for (const mode of themeModes.filter((m) => m !== "dark")) {
    const body = blockBody(css, `[data-theme="${mode}"]`);
    assert.notEqual(body, blockBody(css, ":root"), `${mode} block duplicates :root`);
  }
});

test("typography tokens the landing needs are present", () => {
  const css = renderTokensCss();
  assert.ok(css.includes("--oa-font-family-display"));
  assert.ok(css.includes("--oa-font-family-body"));
  assert.ok(css.includes("--oa-space-20"));
  assert.ok(css.includes("--oa-radius-16"));
  assert.ok(css.includes("--oa-font-size-14"));
  assert.ok(css.includes("--oa-font-weight-black"));
  assert.ok(css.includes("--oa-line-height-relaxed"));
  assert.ok(css.includes("--oa-letter-spacing-widest"));
});

test("font families name a self-hosted face and a fallback", () => {
  for (const stack of Object.values(fontFamilyTokens)) {
    assert.ok(stack.includes(","), `"${stack}" has no fallback`);
  }
});

test("letter spacing is expressed in em so it scales with font size", () => {
  for (const value of Object.values(letterSpacingTokens)) {
    assert.match(value, /^-?\d*\.?\d+em$/);
  }
});
