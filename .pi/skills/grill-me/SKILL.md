---
name: grill-me
description: Pressure-test a proposal and converge it into one operator-locked Decision-Complete Work Brief 2.0.0.
vibe-protocol: work-brief-producer
vibe-input-artifact: raw-intent
vibe-output-artifact: work-brief
runtimeExecutionClaim: pending-live
---

# grill-me

Pressure-test an existing proposal against every implementation-affecting
decision and converge it into exactly one operator-locked Decision-Complete
Work Brief 2.0.0.

## What this skill owns

One Work Brief 2.0.0 under `.vibe/work/<work-id>/work-brief.json` — the same
class `brainstorm` and `task` produce. The grilling agent never answers its
own human-in-the-loop question and never proceeds while an
implementation-affecting branch is unresolved.

## Protocol

1. Read the exact Project Atlas closure, then decompose the proposal into
   dependent decision branches.
2. Challenge every assumption, including assumptions hidden in ordinary words
   like "simple", "modern", "secure", "fast", or "normal"; look up codebase
   facts directly and external facts through research; use prototype where a
   decision requires seeing or running behavior.
3. Ask exactly one question at a time and wait for the operator's answer; attach
   a recommendation with evidence and consequences so the operator never infers
   options unaided. Dependencies resolve before dependent questions.
4. Stress-test each locked decision with concrete normal, boundary, failure,
   abuse, concurrency, accessibility, migration, and recovery scenarios.
5. Record every resolution immediately in the decision register; maintain
   coverage with omission rationales.
6. Run the six-axis discovery review and record the operator lock against the
   effective Work Brief 2.0.0 digest.

## Completion

Same as `brainstorm`: `decision_complete` requires zero implementation-
affecting unknowns, a discovery review with zero unresolved questions, and an
operator lock.

## Authority and recovery

The grilling agent asks; the operator decides. Recovery is always forward-only inside this run. A miss is never a dead-end rejection and never instructs the operator to re-invoke an earlier skill. The current run launches the forward-only gap resolver, persists a scoped Decision or Plan Amendment bound to the exact amendment digest, revalidates affected closure with targeted invalidation of only the impacted evidence, and resumes automatically. When bounded in-run resolution cannot establish a safe path, the run records an honest resumable wait or hard block with an exact next action — it never converts that into prose-green and never bounces the operator back to an earlier skill as recovery.

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
