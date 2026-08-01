import { z } from "zod";

/**
 * Hint escalation tier (MVP doc §5.4): 1 = nudge, 2 = partial method,
 * 3 = full walkthrough.
 */
export const HintTierSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type HintTier = z.infer<typeof HintTierSchema>;

/**
 * `hints` table (MVP doc §12). Up to 3 rows per problem, one per tier.
 * Like `Problem`, this must never be sent to the client ahead of the
 * corresponding `POST /attempts/:id/hint` call for the tier the student has
 * actually reached — see `HintResponseSchema` in src/api/contract.ts, which
 * reuses only `tier` + `content`, not this whole row.
 */
export const HintSchema = z.object({
  id: z.string().uuid(),
  problem_id: z.string().uuid(),
  tier: HintTierSchema,
  content: z.string().min(1),
});
export type Hint = z.infer<typeof HintSchema>;
