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
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  phone_or_email: z.string().min(1),
  password_hash: z.string().min(1),
  grade: z.number().int().default(5),
  parent_contact: z.string().nullable(),
  language: LanguageSchema.default("uz"),
  created_at: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;
