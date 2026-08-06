import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { colorTokens } from "@olympiad-academy-app/ui";

/**
 * The favicon is a standalone SVG asset: the browser renders it outside the
 * document, so it CANNOT consume the app's CSS custom properties — hardcoded
 * stops are a recorded exception to the tokens-only rule (D3), not a lapse.
 * What we can enforce is that the literals never drift from the brand
 * tokens: this test pins favicon.svg to brandGradFrom/brandGradTo/brandMark.
 */
describe("favicon.svg — pinned to the brand tokens (recorded D3 exception)", () => {
  const svg = readFileSync(new URL("../public/favicon.svg", import.meta.url), "utf8");
  const light = colorTokens.light;

  it("gradient stops equal brandGradFrom / brandGradTo", () => {
    assert.ok(
      svg.includes(`stop-color="${light.brandGradFrom}"`),
      "favicon gradient start must equal brandGradFrom",
    );
    assert.ok(
      svg.includes(`stop-color="${light.brandGradTo}"`),
      "favicon gradient end must equal brandGradTo",
    );
  });

  it("mark colour equals brandMark (white → 'white' keyword in SVG)", () => {
    assert.equal(light.brandMark, "#ffffff");
    assert.ok(svg.includes('stroke="white"') && svg.includes('fill="white"'));
  });
});
