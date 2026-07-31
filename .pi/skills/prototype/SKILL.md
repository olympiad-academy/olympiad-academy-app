---
name: prototype
description: "Prototype discipline. Use when a discovery decision needs a throwaway logic or interface experiment, strictly isolated from production proof, to choose between alternatives."
version: 2.0.0
invocation-policy: model_invoked
runtimeExecutionClaim: pending-live
---

# Throwaway prototype

Answer a specific discovery question with a throwaway prototype whose only output is a decision, never production code.

1. State the exact question the prototype must answer and the alternatives under test. Completion: the question binds to a discovery decision and the alternatives are enumerated before any code is written.
2. Build the smallest throwaway logic or interface variant sufficient to answer it, keeping alternative visual variants side by side where the question is about experience. Completion: each variant is minimal and isolated from production build and proof.
3. Gather compatibility, accessibility, and performance evidence when the question depends on them. Completion: every experience or performance question resolves against recorded evidence, not opinion.
4. Capture operator feedback and record the chosen answer with its decision link. Completion: the operator decision and its rationale are persisted with a decision reference.
5. Enforce strict isolation from production proof and forbid promoting prototype code. Completion: no prototype artifact is reused as production evidence and no prototype code ships without rebuilding through an approved plan.
6. Apply the cleanup and retention policy and record the reopening condition. Completion: retired prototype state is cleaned per policy and its reopening condition is recorded.

A repairable miss stays in the current run: the forward-only gap resolver reframes the prototype question, persists a scoped amendment bound to its digest, revalidates only the affected variant evidence, and resumes automatically. It never promotes throwaway code and never sends the operator back to an earlier skill.
