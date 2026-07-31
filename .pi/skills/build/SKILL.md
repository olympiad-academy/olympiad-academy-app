---
name: build
description: Implement one approved Implementation Plan 2.0.0 through mandatory TDD and persist a Build Result 2.0.0 after the completion gate.
vibe-protocol: build-result-producer
vibe-input-artifact: approved-implementation-plan
vibe-output-artifact: build-result
runtimeExecutionClaim: pending-live
---

# build

Implement exactly one approved effective Implementation Plan 2.0.0 through
mandatory TDD at plan-mapped seams, create planned capabilities, run
verification, and persist a Build Result 2.0.0 after the truth-consistency and
completion gate.

## What this skill owns

One Build Result 2.0.0 under `.vibe/work/<work-id>/build-result.json` carrying
the source base/effective digests and amendment chains, gap resolutions, the
slices implemented with TDD red/green Evidence Packet 2.0.0 pairs, capabilities
created with real-consumer evidence, review runs with dispositions, the Atlas
effects separated from machine-context updates, and the truth-consistency
result. It may not produce a Ship Packet, push, PR, tag, publish, or deploy.

## Preflight and TDD

Run the build preflight gate (Work Brief/plan effective digests and amendment
chains, Atlas load-bearing drift, external-fact expiry, context freshness,
path/dirty-tree safety, capability resolvability, environment prerequisites,
acceptance-to-step-to-verification closure). Then run mandatory TDD at every
plan-mapped seam: red Evidence Packet 2.0.0 failing for the intended reason
(green-start triggers investigation, never a relabeled red), minimal green,
review/refactor preserving green, red/green pairs where the plan requires, and
controlled-breakage sensitivity proof.

## Capabilities and verification

Create planned agents, skills, commands, runners, validators, gates, and
schematics under their DL-31 contracts; a capability is complete only when its
real consumer uses it. Classify every gap and route it: decision/prototype/
domain/new-scope/vision → embedded discovery plus amendments plus plan repair;
pure derivation → Plan Amendment; missing planned capability → contract repair
plus capability factory; defect → fixer; environment → resolver or honest wait.
Build never asks the operator an implementation-affecting question; it routes
to the gap resolver and resumes automatically.

## Completion

The completion gate reports `passed` only when every slice is implemented,
every required red/green loop is evidenced, every planned schematic and
capability is complete and consumed, required deterministic verification passes,
required reviews ran and blocking findings are resolved, machine context is
current with no unresolved load-bearing Atlas inconsistency, the Build Result is
schema-valid and truth-consistent, and no unplanned semantic choice was made.

## Authority and recovery

Build never bounces the operator back to plan or discovery as recovery.
Recovery is always forward-only inside this run. A miss is never a dead-end rejection and never instructs the operator to re-invoke an earlier skill. The current run launches the forward-only gap resolver, persists a scoped Decision or Plan Amendment bound to the exact amendment digest, revalidates affected closure with targeted invalidation of only the impacted evidence, and resumes automatically. When bounded in-run resolution cannot establish a safe path, the run records an honest resumable wait or hard block with an exact next action — it never converts that into prose-green and never bounces the operator back to an earlier skill as recovery.

## Artifact carrier

- Persist this skill's one output under `.vibe/work/<work-id>/` as a UTF-8 JSON or
  Markdown artifact; chat history alone is never a carrier.
- Verification evidence lives under `.vibe/evidence/<work-id>/`; the starter runner
  catalog is `.vibe/registry/runner-catalog.json`.
- Runtime execution claim: pending-live — native pi loading and execution stay unproven
  until a recorded authenticated runtime witness exists.

## Forbidden outputs

This skill never produces: ship-packet, push, pull-request. Recovery stays
forward-only inside this run; a miss is resolved in place through the current-run gap
resolver, never by handing the operator back to an earlier skill.
