import { z } from "zod";
import { HintSchema } from "./hint.js";

export const AnswerTypeSchema = z.enum(["numeric", "multiple_choice", "expression"]);
export type AnswerType = z.infer<typeof AnswerTypeSchema>;

/**
 * A problem's 3 hints, one per tier, in tier order (PR review, OLY-8 — see
 * entities/hint.ts for why this is inline rather than a separate entity).
 * The refine enforces exactly one hint per tier 1/2/3; a plain 3-tuple type
 * alone would accept e.g. three tier-1 hints.
 */
export const ProblemHintsSchema = z.tuple([HintSchema, HintSchema, HintSchema]).refine(
  (hints) =>
    hints
      .map((hint) => hint.tier)
      .sort()
      .join(",") === "1,2,3",
  { message: "Problem.hints must contain exactly one hint per tier (1, 2, 3)" },
);

/**
 * `problems` table (MVP doc §12). This is the full, internal shape.
 *
 * SECURITY: this schema (and therefore `correct_answer` / `hints`) must
 * never be used to type an API response reachable by a student before
 * they've earned it. `GET /topics/:id/next-problem` uses
 * `PublicProblemSchema` below instead — do not change that endpoint to
 * return `Problem` or a superset of it.
 *
 * `correct_answer` stays a single string for now, matching §12 literally.
 * OLY-37 is an open product decision on whether this becomes
 * `accepted_answers` (an array) to support multiple valid forms of an
 * answer; per OLY-37 that decision does not need to block this ticket or
 * the August 8 milestone. If it lands, this schema (and every response type
 * derived from it) will need a follow-up pass.
 *
 * `correct_answer` holds the canonical form of the answer. For decimals the
 * canonical form uses a point (`0.7`), never a comma — the comma is only a
 * display/input convenience (both `0,7` and `0.7` are accepted on input and
 * normalized to `0.7` by `normalizeDecimalAnswer` in @olympiad-academy-app/domain).
 * Storing only the point form keeps `0,7` and `0.7` from ending up in the
 * column as two different strings (OLY-10 review).
 *
 * `difficulty` is 1–3 (fluency / standard / challenge) per the reviewed task
 * bank (OLY-10 review) — not 1–5. A 1–5 range would leave two levels
 * permanently empty and change the "same or lower difficulty" routing rule
 * in §5.6. The matching CHECK constraint lives in the migration SQL (Prisma
 * cannot express CHECK constraints).
 */
export const ProblemSchema = z.object({
  id: z.string().uuid(),
  topic_id: z.string().uuid(),
  statement: z.string().min(1),
  answer_type: AnswerTypeSchema,
  correct_answer: z.string().min(1),
  /** Only populated when answer_type === "multiple_choice". */
  choices: z.array(z.string()).nullable(),
  difficulty: z.number().int().min(1).max(3),
  /**
   * The reviewed worked solution from the task bank (OLY-10 review) — an
   * ordered list of steps. The bank has no separate authored `explanation`
   * field; `solution_steps` fills that role. Shown to the student only after
   * a correct submission (MVP doc §14, Screen 3) and also used as the "Full
   * Walkthrough" and as the visible context for Ask Why.
   */
  solution_steps: z.array(z.string().min(1)).min(1),
  hints: ProblemHintsSchema,
  reviewed: z.boolean().default(false),
  created_at: z.string().datetime(),
});
export type Problem = z.infer<typeof ProblemSchema>;

/**
 * The subset of a Problem that is safe to send to a student who has not
 * solved it yet. Built by explicit inclusion (not `ProblemSchema.omit(...)`)
 * so that adding a new sensitive field to `ProblemSchema` later does not
 * silently leak it here by default — a field only ever reaches the client
 * if it is explicitly added to this schema.
 *
 * This is the response type for `GET /topics/:id/next-problem` (MVP doc
 * §13): "never returns correct_answer or hints". `solution_steps` is
 * excluded too, since per §14 (Screen 3) the worked solution is only
 * revealed after a correct submission, not when the problem is first
 * fetched.
 */
export const PublicProblemSchema = z.object({
  id: z.string().uuid(),
  topic_id: z.string().uuid(),
  statement: z.string().min(1),
  answer_type: AnswerTypeSchema,
  choices: z.array(z.string()).nullable(),
  difficulty: z.number().int().min(1).max(3),
});
export type PublicProblem = z.infer<typeof PublicProblemSchema>;

/**
 * Compile-time guard, exported so it counts as used: fails to typecheck if
 * a forbidden key is ever added to PublicProblem.
 */
export type ForbiddenPublicProblemKeys = Extract<
  keyof PublicProblem,
  "correct_answer" | "solution_steps" | "reviewed" | "hints"
>;
export type AssertNoForbiddenKeysLeakIntoPublicProblem = ForbiddenPublicProblemKeys extends never
  ? true
  : "PublicProblem must never contain correct_answer, solution_steps, reviewed, or hints";
