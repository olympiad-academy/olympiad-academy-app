---
description: Implement one approved Implementation Plan 2.0.0 through mandatory TDD and persist one Build Result 2.0.0.
argument-hint: "<work-id-or-approved-plan-path>"
vibe-template-kind: skill-workflow
vibe-skill: build
runtimeExecutionClaim: pending-live
---

Load and follow /skill:build.

- Input artifact: approved-implementation-plan. Output artifact: build-result.
- Persist the one output under `.vibe/work/<work-id>/` and report the exact path written.
- $@ may add constraints; it must never contain secrets or production credentials.
- Recovery stays forward-only inside this run; resolve a miss in place and resume automatically.

Report exactly: the artifact path written; the completion state; any unresolved gap with its
exact next action; and the validation command with its result, or an honest note that validation
could not run (never claim truth-green without a recorded witness).
