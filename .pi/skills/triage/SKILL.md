---
name: triage
description: "Advanced user-invoked entrypoint. The operator runs it to move an incoming issue through a verification-first state machine into a canonical Work Brief; it is never auto-invoked by the model."
version: 2.0.0
invocation-policy: user_invoked
disable-model-invocation: true
runtimeExecutionClaim: pending-live
---

# Triage

Move an incoming issue or request through a verification-first state machine into a canonical Work Brief, without treating an external tracker as the source of truth.

1. Capture the request and preserve its external issue or pull-request provenance verbatim. Completion: reporter-supplied information is recorded distinctly from any operator decision.
2. Verify the claim before grilling: reproduce or confirm it against the current codebase. Completion: the report is verified or refuted against observed evidence, not accepted on assertion.
3. Check codebase redundancy and prior rejections before proceeding. Completion: existing coverage and prior-rejection history are searched and recorded.
4. Route hard defects into diagnosis and route genuine work into discovery grilling. Completion: each accepted item is routed to diagnosis or grilling and none proceeds unrouted.
5. Validate any tracker action and require approval before it. Completion: no external tracker action occurs without validation and approval.
6. Produce a canonical Work Brief and a durable agent brief for handoff. Completion: the Work Brief validates and the durable brief references its source by digest.

A repairable miss stays in the current run: the forward-only gap resolver reopens the triage state, persists a scoped amendment bound to its digest, revalidates only the affected routing, and resumes automatically. It never treats a tracker as canonical truth and never sends the operator back to an earlier skill.
