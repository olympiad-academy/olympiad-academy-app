---
name: task
description: Normalize a concrete request and converge it into one operator-locked Decision-Complete Work Brief 2.0.0.
vibe-protocol: work-brief-producer
vibe-input-artifact: raw-intent
vibe-output-artifact: work-brief
runtimeExecutionClaim: pending-live
---

# task

Normalize a concrete request and converge it into exactly one operator-locked
Decision-Complete Work Brief 2.0.0. It is a shorter route, not a weaker
contract.

## What this skill owns

One Work Brief 2.0.0 under `.vibe/work/<work-id>/work-brief.json` — the same
class `brainstorm` and `grill-me` produce.

## Protocol

1. Capture the operator request under `.vibe/work/<work-id>/raw-intent.md`
   unless an existing durable raw-intent path is provided.
2. Read the relevant Project Atlas closure before deciding the request is
   complete.
3. If the request is genuinely decision-complete, validate and lock it quickly.
   If it hides decisions, invoke grilling, research, domain modeling, diagnosis,
   or prototype as needed inside this run — never pad a short request into a
   fake `decision_complete`.
4. For a bug, establish observed behavior, expected behavior, a reproducible
   signal, affected surfaces, regression expectations, and the intended
   correction in discovery, then record each resolution in the decision register
   before locking.
5. Run the six-axis discovery review and record the operator lock against the
   effective Work Brief 2.0.0 digest.

## Completion

Same as `brainstorm` and `grill-me`: `decision_complete` requires zero
implementation-affecting unknowns, a discovery review with zero unresolved
questions, and an operator lock. The label "small task" never bypasses
completeness.

## Authority and recovery

Foundation enrichment routes to the one `project` skill; a concrete task
request routes here. Recovery is always forward-only inside this run. A miss is never a dead-end rejection and never instructs the operator to re-invoke an earlier skill. The current run launches the forward-only gap resolver, persists a scoped Decision or Plan Amendment bound to the exact amendment digest, revalidates affected closure with targeted invalidation of only the impacted evidence, and resumes automatically. When bounded in-run resolution cannot establish a safe path, the run records an honest resumable wait or hard block with an exact next action — it never converts that into prose-green and never bounces the operator back to an earlier skill as recovery.

## Artifact carrier

- Persist this skill's one output under `.vibe/work/<work-id>/` as a UTF-8 JSON or
  Markdown artifact; chat history alone is never a carrier.
- Verification evidence lives under `.vibe/evidence/<work-id>/`; the starter runner
  catalog is `.vibe/registry/runner-catalog.json`.
- Runtime execution claim: pending-live — native pi loading and execution stay unproven
  until a recorded authenticated runtime witness exists.

## Forbidden outputs

This skill never produces: implementation-plan, build-result, ship-packet, push, pull-request. Recovery stays
forward-only inside this run; a miss is resolved in place through the current-run gap
resolver, never by handing the operator back to an earlier skill.
