import { z } from "zod";

/**
 * Hint escalation tier (MVP doc §5.4): 1 = nudge, 2 = partial method,
 * 3 = full walkthrough.
 */
export const HintTierSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type HintTier = z.infer<typeof HintTierSchema>;

/**
 * A single hint at one escalation tier (MVP doc §12/§5.4).
 *
 * PR review (OLY-8): stored inline on `Problem.hints` (see
 * entities/problem.ts) as a fixed 3-tuple, one per tier, rather than as a
 * separate `hints` table/row with its own `id` + `problem_id` foreign key.
 * Every problem has exactly 3 hints, they are never queried, updated, or
 * sent to the client independently of the problem (a hint is only ever
 * revealed as part of `POST /attempts/:id/hint`, keyed by tier), and the
 * content pipeline (MVP doc §5.2) reviews a problem's hints together with
 * the problem itself — so the join this used to require had no matching
 * access pattern. If that ever changes (e.g. hints get their own authoring
 * workflow), this can be split back out into a real entity.
 */
export const HintSchema = z.object({
  tier: HintTierSchema,
  content: z.string().min(1),
});
export type Hint = z.infer<typeof HintSchema>;
