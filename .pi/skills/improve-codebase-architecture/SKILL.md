---
name: improve-codebase-architecture
description: "Advanced user-invoked entrypoint. The operator runs it to explore architecture improvement candidates that must re-enter full discovery before any refactor; it is never auto-invoked and never self-authorizes implementation."
version: 2.0.0
invocation-policy: user_invoked
disable-model-invocation: true
runtimeExecutionClaim: pending-live
---

# Improve codebase architecture

Explore architecture improvement candidates, present them for judgement, and route the chosen direction back through full discovery; the entrypoint never authorizes its own refactor.

1. Assess the current architecture against the recorded context and decision records within the task scope. Completion: the assessment cites current context and decisions and stays within the declared scope.
2. Produce before-and-after candidates with structured findings alongside any visual report. Completion: every candidate carries structured findings and each visual report has a machine-readable counterpart.
3. Keep any required local report free of a mandatory network or content-delivery dependency unless it is explicitly allowed. Completion: no required report depends on an external network fetch outside an explicit allowance.
4. State recommendation strength for each candidate without deciding. Completion: each candidate records a recommendation strength and none is auto-selected.
5. Grill the operator before any refactor and route the selected candidate into full discovery and decision lock. Completion: the selected candidate re-enters discovery and no refactor begins before its decision locks.
6. Forbid self-authorized implementation. Completion: no architecture change is applied by this entrypoint and implementation waits for an approved plan.

A repairable miss stays in the current run: the forward-only gap resolver reopens the affected assessment, persists a scoped amendment bound to its digest, revalidates only the impacted candidate, and resumes automatically. It never self-authorizes a refactor and never bounces the operator to an earlier skill.
