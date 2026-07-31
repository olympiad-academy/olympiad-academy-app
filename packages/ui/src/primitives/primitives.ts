import type { spacingTokens } from "../tokens/tokens.js";

export interface BoxProps {
  readonly padding?: keyof typeof spacingTokens;
}
export const primitiveNames = Object.freeze(["Box"] as const);
