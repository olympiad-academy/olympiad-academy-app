---
description: Explore an unclear request and converge it into one operator-locked Work Brief 2.0.0 with a persisted artifact handoff.
argument-hint: "<raw-request-or-raw-intent-path>"
vibe-template-kind: skill-workflow
vibe-skill: brainstorm
runtimeExecutionClaim: pending-live
---

Load and follow /skill:brainstorm.

- Input artifact: raw-intent. Output artifact: work-brief.
- Persist the one output under `.vibe/work/<work-id>/` and report the exact path written.
- $@ may add constraints; it must never contain secrets or production credentials.
- Recovery stays forward-only inside this run; resolve a miss in place and resume automatically.

Report exactly: the artifact path written; the completion state; any unresolved gap with its
exact next action; and the validation command with its result, or an honest note that validation
could not run (never claim truth-green without a recorded witness).
