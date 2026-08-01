import assert from "node:assert/strict";
import test from "node:test";
import {
  PublicProblemSchema,
  ProblemSchema,
  ATTEMPT_VALID_TRANSITIONS,
  contract,
} from "../src/index.js";

const sampleProblem = {
  id: "11111111-1111-1111-1111-111111111111",
  topic_id: "22222222-2222-2222-2222-222222222222",
  statement: "What is 2 + 2?",
  answer_type: "numeric" as const,
  correct_answer: "4",
  choices: null,
  difficulty: 1,
  explanation: "Add the two numbers.",
  reviewed: true,
  created_at: "2026-08-01T00:00:00.000Z",
};

test("ProblemSchema accepts the full internal shape, including correct_answer", () => {
  const parsed = ProblemSchema.parse(sampleProblem);
  assert.equal(parsed.correct_answer, "4");
});

test("PublicProblemSchema strips correct_answer, explanation, and reviewed", () => {
  const parsed = PublicProblemSchema.parse(sampleProblem);
  const keys = Object.keys(parsed).sort();
  assert.deepEqual(keys, ["answer_type", "choices", "difficulty", "id", "statement", "topic_id"]);
  // The exact-keys assertion above already proves correct_answer/explanation/reviewed
  // are absent; this just names the two most safety-critical ones explicitly.
  assert.ok(!keys.includes("correct_answer"));
  assert.ok(!keys.includes("explanation"));
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
