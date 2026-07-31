---
description: Close one Build Result 2.0.0 into one Ship Packet 2.0.0 with no push, PR, publish, or deploy without explicit approval.
argument-hint: "<work-id-or-build-result-path>"
vibe-template-kind: skill-workflow
vibe-skill: ship
runtimeExecutionClaim: pending-live
---

Load and follow /skill:ship.

- Input artifact: build-result. Output artifact: ship-packet.
- Persist the one output under `.vibe/work/<work-id>/` and report the exact path written.
- $@ may add constraints; it must never contain secrets or production credentials.
- Recovery stays forward-only inside this run; resolve a miss in place and resume automatically.

Report exactly: the artifact path written; the completion state; any unresolved gap with its
exact next action; and the validation command with its result, or an honest note that validation
could not run (never claim truth-green without a recorded witness).
