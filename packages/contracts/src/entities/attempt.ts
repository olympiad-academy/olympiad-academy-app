import { z } from "zod";

/**
 * Problem attempt state machine (MVP doc §15). This is the source of truth
 * for what UI to show — engineers should treat `completed` and
 * `completed_with_help` as distinct terminal states (solved independently
 * vs. solved with full help), since the difficulty adaptivity logic in §5.6
 * depends on the distinction and must not be collapsed into one "done" state.
 */
export const AttemptStatusSchema = z.enum([
  "not_started",
  "submitted_incorrect",
  "hint_tier_1",
  "hint_tier_2",
  "hint_tier_3",
  "submitted_correct",
  "completed",
  "completed_with_help",
]);
export type AttemptStatus = z.infer<typeof AttemptStatusSchema>;

export const ATTEMPT_TERMINAL_STATUSES: readonly AttemptStatus[] = [
  "completed",
  "completed_with_help",
];

/**
 * Valid next states per §15's table, transcribed literally so the state
 * machine can be checked in code (e.g. in a unit test, or by the attempts
 * service before writing a transition) instead of only living in a doc.
 */
export const ATTEMPT_VALID_TRANSITIONS: Readonly<Record<AttemptStatus, readonly AttemptStatus[]>> =
  Object.freeze({
    not_started: ["submitted_correct", "submitted_incorrect"],
    submitted_incorrect: ["hint_tier_1", "submitted_correct"],
    hint_tier_1: ["hint_tier_2", "submitted_correct"],
    hint_tier_2: ["hint_tier_3", "submitted_correct"],
    hint_tier_3: ["completed_with_help"],
    submitted_correct: ["completed"],
    completed: [],
    completed_with_help: [],
  });

/**
 * `attempts` table (MVP doc §12). One row per problem attempt session by a
 * student.
 */
export const AttemptSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  problem_id: z.string().uuid(),
  status: AttemptStatusSchema,
  submitted_answer: z.string().nullable(),
  is_correct: z.boolean().nullable(),
  /** 0 = no hint used yet. */
  max_hint_tier_used: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).default(0),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
});
export type Attempt = z.infer<typeof AttemptSchema>;
