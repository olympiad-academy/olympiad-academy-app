import assert from "node:assert/strict";
import test from "node:test";
import {
  colorTokens,
  fontSizeTokens,
  fontWeightTokens,
  lineHeightTokens,
  radiusTokens,
  spacingTokens,
  themeModes,
} from "../src/index.js";

test("both colour modes exist and are the only modes", () => {
  assert.deepEqual([...themeModes], ["dark", "light"]);
  assert.deepEqual(Object.keys(colorTokens).sort(), ["dark", "light"]);
});

// D12 boundary: a token present in one mode but not the other would render as an
// unresolved var() in that mode, silently. This is the invariant that prevents it.
test("every colour token is defined in both modes", () => {
  const dark = Object.keys(colorTokens.dark).sort();
  const light = Object.keys(colorTokens.light).sort();
  assert.deepEqual(light, dark);
});

test("colour tokens carry the semantic names the design of record uses", () => {
  const required = [
    "bg",
    "surface",
    "surfaceHover",
    "navBg",
    "text",
    "textMuted",
    "textSubtle",
    "textFaint",
    "textOnAccent",
    "border",
    "primary",
    "primaryGradient",
    "focusRing",
    "inputBg",
    "inputBorder",
    "correctBg",
    "correctText",
    "wrongBg",
    "wrongText",
    "askWhyBg",
  ];
  for (const name of required) {
    assert.ok(name in colorTokens.dark, `dark mode is missing token "${name}"`);
  }
});

test("no colour token is empty in either mode", () => {
  for (const mode of themeModes) {
    for (const [name, value] of Object.entries(colorTokens[mode])) {
      assert.ok(value.trim().length > 0, `${mode}.${name} is empty`);
    }
  }
});

// The scales below do not exist in the design of record as data — in the Figma
// Make prototype they were Tailwind utility classes. D3 rejects Tailwind, so they
// are pinned here as the single source instead of being retyped per component.
test("numeric scales are non-empty and strictly ascending", () => {
  for (const [label, scale] of [
    ["spacing", spacingTokens],
    ["radius", radiusTokens],
    ["fontSize", fontSizeTokens],
    ["fontWeight", fontWeightTokens],
  ] as const) {
    const values = Object.values(scale);
    assert.ok(values.length > 0, `${label} scale is empty`);
    values.reduce((previous, current, index) => {
      assert.ok(current > previous, `${label} scale is not ascending at index ${String(index)}`);
      return current;
    });
  }
});

test("line-height scale is unitless and in a sane typographic range", () => {
  const values = Object.values(lineHeightTokens);
  assert.ok(values.length > 0);
  for (const value of values) {
    assert.ok(value >= 1 && value <= 2, `line height ${String(value)} is out of range`);
  }
});
