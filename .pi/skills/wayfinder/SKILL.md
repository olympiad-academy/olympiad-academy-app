---
name: wayfinder
description: "Advanced user-invoked entrypoint. The operator runs it to orient a large or foggy body of work through a destination, map, frontier, and blocking decision tickets; it is never auto-invoked by the model."
version: 2.0.0
invocation-policy: user_invoked
disable-model-invocation: true
runtimeExecutionClaim: pending-live
---

# Wayfinder

Orient a large or foggy body of work: fix the destination, draw a low-resolution map, expose the frontier, and drive blocking decision tickets to resolution until a Work Brief can lock.

1. Fix the destination and draw the low-resolution map before any detail work. Completion: the destination is stated and the map records known regions and fog without inventing detail.
2. Expose the frontier and mark blocking edges as typed decision tickets. Completion: every blocking edge is a typed ticket and no frontier item is left implicit.
3. Work one ticket at a time through durable orchestration state and typed artifact references. Completion: each ticket has an owner, state, and resolution reference, and progress is persisted.
4. Read tracker context only through a configured, security-policed adapter and never mutate an external tracker without approved configuration. Completion: no external mutation occurs outside approved configuration.
5. Update the Work Brief decision register for every resolved ticket. Completion: each resolved ticket writes its decision, alternatives, and approver into the register.
6. Run a final completeness review before producing the lock. Completion: no blocking ticket remains open and the completeness review passes before lock.

A repairable miss stays in the current run: the forward-only gap resolver reopens the affected ticket, persists a scoped amendment bound to its digest, revalidates only the impacted map region, and resumes automatically. It never abandons the frontier and never bounces the operator to an earlier skill.
