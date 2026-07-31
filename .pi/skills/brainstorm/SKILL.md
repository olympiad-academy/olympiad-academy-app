---
name: brainstorm
description: Explore an unclear raw request and converge it into one operator-locked Decision-Complete Work Brief 2.0.0.
vibe-protocol: work-brief-producer
vibe-input-artifact: raw-intent
vibe-output-artifact: work-brief
runtimeExecutionClaim: pending-live
---

# brainstorm

Explore an unclear raw request and converge it into exactly one operator-locked
Decision-Complete Work Brief 2.0.0.

## What this skill owns

One Work Brief 2.0.0 under `.vibe/work/<work-id>/work-brief.json`. It is the
only artifact this skill may produce; it carries the decision register, rejected
alternatives, coverage with omission rationales, the exact Project Atlas closure
cited by digest, research/prototype/diagnosis refs, acceptance criteria with
observable seams and proof classes, capability requirements, the discovery
review, and the operator lock. It may not leave implementation-affecting
unknowns at `decision_complete` and may not produce an implementation plan,
build result, or ship packet.

## Protocol

1. Capture the raw request under `.vibe/work/<work-id>/raw-intent.md` before
   normalizing it.
2. Read the exact Project Atlas closure (root pair, then the smallest relevant
   topic set); record document IDs, paths, statuses, and digests in the brief.
   A roadmap item or likely statement is never plan/build authority.
3. Map the applicable decision coverage dimensions breadth-first; explain every
   omitted dimension. Verify repository facts directly; use research for
   external facts and prototype where prose cannot settle a material choice.
4. Ask one operator decision at a time, each with a recommendation, rationale,
   alternatives, consequences, and a reopening condition. Record every resolved
   decision immediately in the decision register; facts are looked up, not
   delegated to the operator.
5. Run the six-axis discovery review (completeness, contradiction, research,
   scenario, implementation-question simulator, scope). Any unresolved
   implementation-affecting question blocks lock.
6. Present the exact persisted Work Brief 2.0.0 to the operator and record the
   operator lock binding approver identity/time to the effective artifact digest.

## Completion

The brief is `decision_complete` only when implementation-affecting
`assumptions`/`openQuestions` are empty, the discovery review carries zero
unresolved questions, and the operator lock is recorded. A short or vague
request stays sparse until real decisions close it — never padded into a fake
`decision_complete`.

## Authority and recovery

The one `project` skill is the sole Project Atlas entrypoint; foundation
enrichment routes to `project`, not here. A concrete task request routes here.
Recovery is always forward-only inside this run. A miss is never a dead-end rejection and never instructs the operator to re-invoke an earlier skill. The current run launches the forward-only gap resolver, persists a scoped Decision or Plan Amendment bound to the exact amendment digest, revalidates affected closure with targeted invalidation of only the impacted evidence, and resumes automatically. When bounded in-run resolution cannot establish a safe path, the run records an honest resumable wait or hard block with an exact next action — it never converts that into prose-green and never bounces the operator back to an earlier skill as recovery.

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
