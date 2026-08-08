/**
 * Single "phone or email" identity field (D9, design-dependent sub-point):
 * the Figma design has ONE contact input; the contract wants separate
 * `phone`/`email`. This module owns the split, so the form component stays
 * a thin RHF binding and the mapping rule is unit-testable on its own.
 */

export type IdentityKind = "email" | "phone";

/** "@" present → email, else phone — exactly the design's detection rule. */
export const detectIdentityKind = (value: string): IdentityKind => {
  return value.includes("@") ? "email" : "phone";
};

/**
 * D9 technical note (2026-08-06): map by OMITTING the unused field, never by
 * sending `null`. With `exactOptionalPropertyTypes: true`, `undefined`,
 * `null`, and "absent" are three distinct types — the contract's
 * `.nullable().optional()` already accepts "absent" as valid, so there is
 * nothing a `null` would communicate that omission does not.
 */
export const toIdentityFields = (value: string): { phone: string } | { email: string } => {
  const trimmed = value.trim();
  return detectIdentityKind(trimmed) === "email" ? { email: trimmed } : { phone: trimmed };
};
