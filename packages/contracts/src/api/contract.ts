import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { LanguageSchema } from "../entities/user.js";
import { TopicWithProgressSchema } from "../entities/topic.js";
import { PublicProblemSchema } from "../entities/problem.js";
import { AttemptStatusSchema } from "../entities/attempt.js";
import { HintSchema } from "../entities/hint.js";

const c = initContract();

// ---------------------------------------------------------------------------
// Shared response fragments
// ---------------------------------------------------------------------------

const AuthSuccessResponseSchema = z.object({
  user_id: z.string().uuid(),
  token: z.string().min(1),
});

/**
 * Signup/login accept `phone` and/or `email` (PR review, OLY-8 — see
 * entities/user.ts for why `User` itself splits these) rather than a single
 * `phone_or_email` string. The refine requires at least one of the two,
 * matching the previous single-field requirement.
 */
const PhoneOrEmailIdentitySchema = z
  .object({
    phone: z.string().min(1).nullable(),
    email: z.string().email().nullable(),
  })
  .refine((identity) => identity.phone !== null || identity.email !== null, {
    message: "Provide at least one of phone or email",
    path: ["phone"],
  });

/**
 * MVP doc §5.7.A / §14 Screen: shown right after the student stops
 * practicing. `calloutStat` is the one specific, earned statement called
 * out in §5.7.A (e.g. "You solved 2 combinatorics problems without hints
 * today — first time this week.") — free text generated server-side, not a
 * fixed enum, since the spec explicitly wants it to vary per session.
 */
const SessionSummarySchema = z.object({
  sessionId: z.string(),
  problemsAttempted: z.number().int().nonnegative(),
  problemsSolved: z.number().int().nonnegative(),
  hintTierBreakdown: z.object({
    noHint: z.number().int().nonnegative(),
    tier1: z.number().int().nonnegative(),
    tier2: z.number().int().nonnegative(),
    tier3: z.number().int().nonnegative(),
  }),
  calloutStat: z.string().nullable(),
});

/**
 * MVP doc §5.7.D / §14 Screen 5. `sessionId` in the underlying data model
 * (§12) has no dedicated table — `attempts` + `daily_activity` are the only
 * persisted rows. This response type assumes a session is a
 * server-computed grouping (e.g. attempts within one contiguous visit), not
 * a stored entity. That's a gap worth a product/eng conversation before
 * `GET /profile/session-summary/:sessionId` (below) is implemented against
 * a real store — flagging here rather than silently picking a definition.
 */
const ProfileResponseSchema = z.object({
  streakDays: z.number().int().nonnegative(),
  lifetime: z.object({
    problemsSolved: z.number().int().nonnegative(),
    accuracyPercent: z.number().min(0).max(100),
  }),
  topicMastery: z.array(
    z.object({
      topicId: z.string().uuid(),
      name: z.string(),
      masteryPercent: z.number().min(0).max(100),
    }),
  ),
  lastSession: SessionSummarySchema.nullable(),
});

// ---------------------------------------------------------------------------
// Contract (MVP doc §13)
// ---------------------------------------------------------------------------

export const contract = c.router({
  signup: {
    method: "POST",
    path: "/auth/signup",
    body: z.intersection(
      z.object({
        name: z.string().min(1),
        password: z.string().min(8),
        language: LanguageSchema.default("uz"),
      }),
      PhoneOrEmailIdentitySchema,
    ),
    responses: { 200: AuthSuccessResponseSchema },
  },

  login: {
    method: "POST",
    path: "/auth/login",
    body: z.intersection(z.object({ password: z.string().min(1) }), PhoneOrEmailIdentitySchema),
    responses: { 200: AuthSuccessResponseSchema },
  },

  listTopics: {
    method: "GET",
    path: "/topics",
    responses: { 200: z.array(TopicWithProgressSchema) },
  },

  /**
   * SECURITY (MVP doc §13, §17): must never return `correct_answer` or
   * hint content. Response is `PublicProblemSchema`, not `ProblemSchema` —
   * see packages/contracts/src/entities/problem.ts for why that's
   * structurally enforced, not just a convention.
   * `null` covers the "topic has no problems left" edge case (§14 Screen 2,
   * §17) — caller should show a "more problems coming soon" state, not
   * treat it as an error.
   */
  getNextProblem: {
    method: "GET",
    path: "/topics/:topicId/next-problem",
    pathParams: z.object({ topicId: z.string().uuid() }),
    responses: { 200: PublicProblemSchema.nullable() },
  },

  startAttempt: {
    method: "POST",
    path: "/attempts",
    body: z.object({ problem_id: z.string().uuid() }),
    responses: {
      200: z.object({
        attempt_id: z.string().uuid(),
        status: AttemptStatusSchema,
      }),
    },
  },

  /**
   * `explanation` is present only when `is_correct` is true (MVP doc §14,
   * Screen 3: shown on correct submission, withheld otherwise).
   */
  submitAttempt: {
    method: "POST",
    path: "/attempts/:attemptId/submit",
    pathParams: z.object({ attemptId: z.string().uuid() }),
    body: z.object({ submitted_answer: z.string().min(1) }),
    responses: {
      200: z.object({
        is_correct: z.boolean(),
        explanation: z.string().nullable(),
        status: AttemptStatusSchema,
      }),
    },
  },

  /**
   * Response reuses `HintSchema` as-is (PR review, OLY-8 — hints are now a
   * `{tier, content}` shape shared with `Problem.hints`; no reason to
   * redeclare the same two fields here).
   */
  requestHint: {
    method: "POST",
    path: "/attempts/:attemptId/hint",
    pathParams: z.object({ attemptId: z.string().uuid() }),
    body: z.object({}),
    responses: { 200: HintSchema },
  },

  /**
   * MVP doc §17: cap "Ask Why" requests per attempt (e.g. max 5) — enforced
   * server-side, not expressed in this wire contract.
   */
  askWhy: {
    method: "POST",
    path: "/attempts/:attemptId/ask-why",
    pathParams: z.object({ attemptId: z.string().uuid() }),
    body: z.object({ question: z.string().min(1) }),
    responses: {
      200: z.object({ ai_response: z.string().min(1) }),
    },
  },

  getProfile: {
    method: "GET",
    path: "/profile",
    responses: { 200: ProfileResponseSchema },
  },

  getSessionSummary: {
    method: "GET",
    path: "/profile/session-summary/:sessionId",
    pathParams: z.object({ sessionId: z.string() }),
    responses: { 200: SessionSummarySchema },
  },
});

export type Contract = typeof contract;
