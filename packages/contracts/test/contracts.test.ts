import assert from "node:assert/strict";
import test from "node:test";
import {
  PublicProblemSchema,
  ProblemSchema,
  ProblemHintsSchema,
  ATTEMPT_VALID_TRANSITIONS,
  contract,
} from "../src/index.js";

const sampleHints = [
  { tier: 1, content: "Nudge: what operation does 'plus' suggest?" },
  { tier: 2, content: "Line up the digits and add column by column." },
  { tier: 3, content: "2 + 2 = 4 — add the ones column, no carrying needed." },
];

const sampleProblem = {
  id: "11111111-1111-1111-1111-111111111111",
  topic_id: "22222222-2222-2222-2222-222222222222",
  statement: "What is 2 + 2?",
  answer_type: "numeric" as const,
  correct_answer: "4",
  choices: null,
  difficulty: 1,
  explanation: "Add the two numbers.",
  hints: sampleHints,
  reviewed: true,
  created_at: "2026-08-01T00:00:00.000Z",
};

test("ProblemSchema accepts the full internal shape, including correct_answer and hints", () => {
  const parsed = ProblemSchema.parse(sampleProblem);
  assert.equal(parsed.correct_answer, "4");
  assert.deepEqual(
    parsed.hints.map((hint) => hint.tier),
    [1, 2, 3],
  );
});

test("ProblemHintsSchema rejects a problem missing one of the three tiers", () => {
  const missingTier3 = [sampleHints[0], sampleHints[1], sampleHints[1]];
  assert.throws(() => ProblemHintsSchema.parse(missingTier3));
});

test("PublicProblemSchema strips correct_answer, explanation, reviewed, and hints", () => {
  const parsed = PublicProblemSchema.parse(sampleProblem);
  const keys = Object.keys(parsed).sort();
  assert.deepEqual(keys, ["answer_type", "choices", "difficulty", "id", "statement", "topic_id"]);
  // The exact-keys assertion above already proves correct_answer/explanation/
  // reviewed/hints are absent; this just names the safety-critical ones
  // explicitly (MVP doc §13: "never returns correct_answer or hints").
  assert.ok(!keys.includes("correct_answer"));
  assert.ok(!keys.includes("explanation"));
  assert.ok(!keys.includes("hints"));
});

test("the next-problem contract route response schema is PublicProblemSchema, not ProblemSchema", () => {
  // Regression guard for the critical requirement in OLY-8: if someone ever
  // repoints this route at ProblemSchema (or a schema that is a superset of
  // it), this schema-shape check fails even though both are Zod objects.
  const publicShape = Object.keys(PublicProblemSchema.shape).sort();
  const routeResponseSchema = contract.getNextProblem.responses[200].unwrap();
  const routeShape = Object.keys(routeResponseSchema.shape).sort();
  assert.deepEqual(routeShape, publicShape);
  assert.ok(!routeShape.includes("correct_answer"));
  assert.ok(!routeShape.includes("explanation"));
  assert.ok(!routeShape.includes("hints"));
});

test("attempt state machine has no transitions out of a terminal state", () => {
  assert.deepEqual(ATTEMPT_VALID_TRANSITIONS.completed, []);
  assert.deepEqual(ATTEMPT_VALID_TRANSITIONS.completed_with_help, []);
});

test("attempt state machine matches the MVP doc §15 table shape", () => {
  assert.deepEqual(ATTEMPT_VALID_TRANSITIONS.not_started.slice().sort(), [
    "submitted_correct",
    "submitted_incorrect",
  ]);
  assert.deepEqual(ATTEMPT_VALID_TRANSITIONS.hint_tier_3, ["completed_with_help"]);
});
