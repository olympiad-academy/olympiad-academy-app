---
name: domain-modeling
description: "Domain-modeling discipline. Use when discovery must challenge overloaded terminology and pin the domain language in concrete scenarios before decisions and code depend on it."
version: 2.0.0
invocation-policy: model_invoked
runtimeExecutionClaim: pending-live
---

# Domain modeling

Challenge terminology and model the domain in concrete scenarios so the shared language is precise before decisions and code depend on it.

1. Challenge each ambiguous or overloaded term immediately with a concrete question. Completion: every load-bearing term has one agreed meaning and no overloaded term survives unresolved.
2. Ground meaning in concrete edge scenarios rather than abstract definitions. Completion: each contested term is pinned by at least one concrete scenario, including its edges.
3. Cross-check the model against the existing code and context so the language matches reality. Completion: every modeled term is verified against its observed source and drift is recorded.
4. Update the project language glossary and orientation context capsules, keeping them distinct from decisions and specs. Completion: glossary and context updates are staged atomically and no spec or task artifact is polluted.
5. Use an architecture decision record only for a genuine, lasting domain decision, with its provenance. Completion: each recorded decision is justified, provenance-linked, and none is created speculatively.
6. Enforce the domain-neutral core versus project-extension boundary and validate every context and decision reference. Completion: core neutrality holds, project vocabulary stays in extensions, and all references validate.

A repairable miss stays in the current run: the forward-only gap resolver reopens the terminology question, persists a scoped amendment bound to its digest, revalidates only the affected language and references, and resumes automatically. It never silently redefines a term and never returns the operator to an earlier skill.
