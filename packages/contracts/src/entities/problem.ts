import { z } from "zod";

export const AnswerTypeSchema = z.enum(["numeric", "multiple_choice", "expression"]);
export type AnswerType = z.infer<typeof AnswerTypeSchema>;

/**
 * `problems` table (MVP doc §12). This is the full, internal shape.
 *
 * SECURITY: this schema (and therefore `correct_answer`) must never be used
 * to type an API response reachable by a student before they've earned it.
 * `GET /topics/:id/next-problem` uses `PublicProblemSchema` below instead —
 * do not change that endpoint to return `Problem` or a superset of it.
 *
 * `correct_answer` stays a single string for now, matching §12 literally.
 * OLY-37 is an open product decision on whether this becomes
 * `accepted_answers` (an array) to support multiple valid forms of an
 * answer; per OLY-37 that decision does not need to block this ticket or
 * the August 8 milestone. If it lands, this schema (and every response type
 * derived from it) will need a follow-up pass.
 */
export const ProblemSchema = z.object({
  id: z.string().uuid(),
  topic_id: z.string().uuid(),
  statement: z.string().min(1),
  answer_type: AnswerTypeSchema,
  correct_answer: z.string().min(1),
  /** Only populated when answer_type === "multiple_choice". */
  choices: z.array(z.string()).nullable(),
  difficulty: z.number().int().min(1).max(5),
  /** Shown to the student only after a correct submission (MVP doc §14, Screen 3). */
  explanation: z.string().min(1),
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
 * §13): "never returns correct_answer or hints". `explanation` is excluded
 * too, since per §14 (Screen 3) it is only revealed after a correct
 * submission, not when the problem is first fetched.
 */
export const PublicProblemSchema = z.object({
  id: z.string().uuid(),
  topic_id: z.string().uuid(),
  statement: z.string().min(1),
  answer_type: AnswerTypeSchema,
  choices: z.array(z.string()).nullable(),
  difficulty: z.number().int().min(1).max(5),
});
export type PublicProblem = z.infer<typeof PublicProblemSchema>;

/**
 * Compile-time guard, exported so it counts as used: fails to typecheck if
 * a forbidden key is ever added to PublicProblem.
 */
export type ForbiddenPublicProblemKeys = Extract<
  keyof PublicProblem,
  "correct_answer" | "explanation" | "reviewed"
>;
export type AssertNoForbiddenKeysLeakIntoPublicProblem = ForbiddenPublicProblemKeys extends never
  ? true
  : "PublicProblem must never contain correct_answer, explanation, or reviewed";
