---
name: ship
description: Close one Build Result 2.0.0 into a Ship Packet 2.0.0 with no push, PR, publish, or deploy without explicit approval.
vibe-protocol: ship-packet-producer
vibe-input-artifact: build-result
vibe-output-artifact: ship-packet
runtimeExecutionClaim: pending-live
---

# ship

Close one Build Result 2.0.0 into a Ship Packet 2.0.0 after fingerprint-
equivalent final-proof reuse, a hidden-work scan, a bounded claim register, and
evidence-backed factual Atlas progress only.

## What this skill owns

One Ship Packet 2.0.0 under `.vibe/work/<work-id>/ship-packet.json` with the
Build Result ref, fingerprint-equivalent reuse lineage, the claim register with
proof boundaries, and `noPushWithoutApproval: true`. It may not commit, push,
open a PR, tag, publish, deploy, or mutate a remote without explicit scoped
approval, and it never emits an unsupported claim.

## Intake and reuse

Consume one truth-consistent Build Result 2.0.0 after a runtime-authorized Final
DoD v2 closure. Reuse prior final proof only when load-bearing inputs are
fingerprint-equivalent and produce explicit reuse evidence; without equivalence
the proof reruns.

## Hidden-work scan and claims

Scan committed, staged, unstaged, and relevant-untracked source and generated
state against the Build Result delta. Revalidate every physical Evidence Packet
2.0.0. Bind each claim to an exact evidence item and an exact proof boundary; a
claim with no matching proof boundary is rejected.

## Atlas synchronization

Apply only evidence-backed factual roadmap progress through the narrow
`evidence_backed_factual_progress` authority: append-only text under an
existing roadmap topic matching one current Evidence Packet 2.0.0 claim, exact
packet/file/artifact digests, exact task and proof boundary, and exact rendered
bytes. Topic creation and changes to outcomes, horizon, confidence, or broader
vision remain semantic and require operator approval. Every committed update
produces an Atlas receipt linked into the Ship Packet; Final DoD reruns after
synchronization.

## Authority and recovery

Ship-time defects route to the build fixer; ship-time decision misses route to
embedded discovery. Ship retains orchestration ownership, invalidates impacted
proof, reruns it, and resumes automatically — it never sends the operator to a
new workflow and never patches behavior directly.
Recovery is always forward-only inside this run. A miss is never a dead-end rejection and never instructs the operator to re-invoke an earlier skill. The current run launches the forward-only gap resolver, persists a scoped Decision or Plan Amendment bound to the exact amendment digest, revalidates affected closure with targeted invalidation of only the impacted evidence, and resumes automatically. When bounded in-run resolution cannot establish a safe path, the run records an honest resumable wait or hard block with an exact next action — it never converts that into prose-green and never bounces the operator back to an earlier skill as recovery.

## Artifact carrier

- Persist this skill's one output under `.vibe/work/<work-id>/` as a UTF-8 JSON or
  Markdown artifact; chat history alone is never a carrier.
- Verification evidence lives under `.vibe/evidence/<work-id>/`; the starter runner
  catalog is `.vibe/registry/runner-catalog.json`.
- Runtime execution claim: pending-live — native pi loading and execution stay unproven
  until a recorded authenticated runtime witness exists.

## Forbidden outputs

This skill never produces: push, pull-request. Recovery stays
forward-only inside this run; a miss is resolved in place through the current-run gap
resolver, never by handing the operator back to an earlier skill.
