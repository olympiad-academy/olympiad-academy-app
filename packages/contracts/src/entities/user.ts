import { z } from "zod";

/**
 * Languages the product ships or plans to ship in.
 * MVP ships Uzbek-only; Russian and English are additive later (MVP doc §10).
 */
export const LanguageSchema = z.enum(["uz", "ru", "en"]);
export type Language = z.infer<typeof LanguageSchema>;

/**
 * `users` table (MVP doc §12). This is the full, internal shape — it
 * includes `password_hash` and must never be returned from any API
 * response. API responses that need user data define their own narrow
 * response schema (see src/api/contract.ts) instead of reusing this type.
 *
 * `phone` / `email` are split (PR review, OLY-8) rather than a single
 * `phone_or_email` string, so each can be validated on its own shape.
 * Exactly one of the two being required is enforced by the `.refine()`
 * below rather than by the object shape, since either one alone is a valid
 * identity for signup/login (MVP doc §12).
 *
 * No `.default()` on any field here (PR review, OLY-8): this is the
 * *stored* row shape, and a default at this layer would silently paper
 * over a caller that forgot to set a real value. Anywhere a default makes
 * sense for convenience (e.g. a signup form defaulting `language`), it
 * belongs on that narrower request schema in src/api/contract.ts, not here.
 *
 * `grade` is `min(5).max(11)` to match the full secondary-school range from
 * the MVP doc's target audience description (§1). The pilot itself only
 * serves Grade 5 (MVP doc §4.1/§4.2 explicitly excludes "multiple grades or
 * broad age groups" from the first MVP) — that restriction is a *product*
 * rule enforced in the signup/onboarding flow when it's built, not a type
 * constraint here, since the type needs to already fit a Grade 6-11 user
 * once the pilot expands.
 */
export const UserSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1),
    phone: z.string().min(1).nullable(),
    email: z.string().email().nullable(),
    password_hash: z.string().min(1),
    grade: z.number().int().min(5).max(11),
    parent_contact: z.string().nullable(),
    language: LanguageSchema,
    created_at: z.string().datetime(),
  })
  .refine((user) => user.phone !== null || user.email !== null, {
    message: "User must have at least one of phone or email",
    path: ["phone"],
  });
export type User = z.infer<typeof UserSchema>;
