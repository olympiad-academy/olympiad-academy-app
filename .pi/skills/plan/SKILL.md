---
name: plan
description: Derive an Implementation Plan 2.0.0 (with Verification Delta 2.0.0) from exactly one Decision-Complete Work Brief 2.0.0.
vibe-protocol: implementation-plan-producer
vibe-input-artifact: work-brief
vibe-output-artifact: implementation-plan-with-verification-delta
runtimeExecutionClaim: pending-live
---

# plan

Derive an Implementation Plan 2.0.0 (with embedded Verification Delta 2.0.0) from
exactly one operator-locked Decision-Complete Work Brief 2.0.0. Plan derives; it
decides nothing.

## What this skill owns

One Implementation Plan 2.0.0 under `.vibe/work/<work-id>/implementation-plan.json`
with the embedded Verification Delta 2.0.0. The plan carries first-class
`verticalSlices`, `dagEdges` with parallel-safety rationale, `pathOwnership`,
`schematicInvocations`, `capabilityWork`, `tddSeams`, `migrationSequence`,
`acceptanceTrace` over every step, `sourceTrace` over every derived statement,
`noNewDecisionsProof`, and an independent `planValidation`. The retired v1
plan extension is not produced — the v2 first-class fields supersede it.

## Intake

Consume exactly one effective Work Brief 2.0.0 that is schema-valid, reviewed,
operator-locked, digest-stable, and free of implementation-affecting unknowns.
A structurally plausible but gapped brief opens a forward-only gap — it is never
a dead-end rejection and the operator is never bounced back to brainstorm or
grill-me.

## Derivation

Map locked decisions into execution and verification only: vertical slices sized
for focused contexts, a dependency-valid DAG, owned/read-only/untouchable paths,
exact schematic invocations, capability work, migration/rollout/rollback order,
acceptance-to-step-to-evidence trace, and the Verification Delta 2.0.0 with
per-item source links, runner and trust class, input fingerprints, blocking and
freshness and reuse policy, and machine-validated `not_applicable` rationales.
Every derived item cites a locked decision or repository standard.

## What plan may not do

Plan introduces or changes no behavior, UX, domain term, API/data, architecture,
dependency, security/perf/ops objective, test seam that changes architecture,
Atlas vision, scope, risk acceptance, or quality threshold. When more than one
materially valid plan remains, plan emits a typed `discovery_gap` and routes it
to the forward-only resolver — it never chooses between valid architectures and
never asks the operator to restart discovery.

## Approval and recovery

The operator approves the exact persisted base plan; later corrections are
append-only Plan Amendments. A material choice smuggled in a Plan Amendment is
reclassified as a Decision Amendment. Recovery is always forward-only inside this run. A miss is never a dead-end rejection and never instructs the operator to re-invoke an earlier skill. The current run launches the forward-only gap resolver, persists a scoped Decision or Plan Amendment bound to the exact amendment digest, revalidates affected closure with targeted invalidation of only the impacted evidence, and resumes automatically. When bounded in-run resolution cannot establish a safe path, the run records an honest resumable wait or hard block with an exact next action — it never converts that into prose-green and never bounces the operator back to an earlier skill as recovery.

## Artifact carrier

- Persist this skill's one output under `.vibe/work/<work-id>/` as a UTF-8 JSON or
  Markdown artifact; chat history alone is never a carrier.
- Verification evidence lives under `.vibe/evidence/<work-id>/`; the starter runner
  catalog is `.vibe/registry/runner-catalog.json`.
- Runtime execution claim: pending-live — native pi loading and execution stay unproven
  until a recorded authenticated runtime witness exists.

## Forbidden outputs

This skill never produces: build-result, ship-packet, push, pull-request. Recovery stays
forward-only inside this run; a miss is resolved in place through the current-run gap
resolver, never by handing the operator back to an earlier skill.
