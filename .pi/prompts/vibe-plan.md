---
description: Derive one Implementation Plan 2.0.0 with its Verification Delta 2.0.0 from one Decision-Complete Work Brief 2.0.0.
argument-hint: "<work-id-or-work-brief-path>"
vibe-template-kind: skill-workflow
vibe-skill: plan
runtimeExecutionClaim: pending-live
---

Load and follow /skill:plan.

- Input artifact: work-brief. Output artifact: implementation-plan-with-verification-delta.
- Persist the one output under `.vibe/work/<work-id>/` and report the exact path written.
- $@ may add constraints; it must never contain secrets or production credentials.
- Recovery stays forward-only inside this run; resolve a miss in place and resume automatically.

Report exactly: the artifact path written; the completion state; any unresolved gap with its
exact next action; and the validation command with its result, or an honest note that validation
could not run (never claim truth-green without a recorded witness).
