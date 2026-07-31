---
name: research
description: "Research discipline. Use when a discovery decision depends on evidence that must be gathered from primary sources and cited before the decision can lock."
version: 2.0.0
invocation-policy: model_invoked
runtimeExecutionClaim: pending-live
---

# Primary-source research

Investigate an evidence-dependent discovery question from primary sources and produce a cited research artifact that a decision can consume.

1. Frame the exact question and the candidate source set before reading. Completion: the question binds to a discovery decision and the candidate set is complete enough that no obvious primary source is omitted.
2. Read primary sources first and record owner, version, retrieval time, and freshness for each. Completion: every consulted source carries owner, version, retrieval, and freshness metadata.
3. Extract claims with claim-level citations and never state an unsourced conclusion. Completion: every load-bearing claim cites the exact source and location.
4. Handle contradiction and uncertainty explicitly rather than smoothing it over. Completion: each contradiction is recorded with both sides and each residual unknown is named.
5. Apply the explicit network-read security policy and take no autonomous product decision. Completion: only permitted reads occur and no decision is made inside research.
6. Emit a typed research artifact linked to its decision and independently citation-checked. Completion: the citation check passes and the decision link resolves.

A repairable miss stays in the current run: the forward-only gap resolver reruns the affected investigation, persists a scoped amendment bound to its digest, revalidates only the impacted citations, and resumes automatically. It never fabricates a source and never bounces the operator to an earlier skill.
