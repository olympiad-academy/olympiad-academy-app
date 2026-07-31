---
name: grilling
description: "Grilling discipline. Use when discovery must resolve an open implementation-affecting decision tree one operator-owned question at a time before a Work Brief can lock."
version: 2.0.0
invocation-policy: model_invoked
runtimeExecutionClaim: pending-live
---

# Decision-tree grilling

Traverse the open decision tree for a raw request and converge it to a shared, operator-owned understanding before any implementation begins.

1. Map the decision tree from the raw request: enumerate every implementation-affecting decision, its alternatives, and its prerequisites. Completion: every open decision resolves to a node with alternatives and a recommended answer, and no prerequisite is skipped.
2. Ask exactly one question at a time, each carrying a recommended answer and the reason for it. Completion: each turn records one question, one recommendation, and the operator decision; batched or recommendation-free questions are rejected.
3. Look facts up from repository, research, prototype, and diagnosis evidence instead of asking the operator for what can be observed. Completion: every evidence-dependent answer cites a research, prototype, or diagnosis reference by digest.
4. Keep every decision human-owned: the operator approves or overrides each recommendation and the run never proceeds on an assumed answer. Completion: no implementation-affecting decision is left assumed, silently inferred, or unresolved.
5. Persist each question and decision in the Work Brief 2.0.0 decision register with its alternatives, recommendation, approver, and reopening condition. Completion: the decision register validates and coverage tracking shows no unexplored implementation-affecting dimension.
6. Close only when the Work Brief is decision-complete and independently reviewed. Completion: implementation-affecting assumptions and open questions are empty and the independent discovery review passes.

A repairable miss stays in the current run: the forward-only gap resolver opens embedded discovery, persists a scoped Decision Amendment bound to its digest, revalidates only the affected closure, and resumes automatically. It never converts a miss into prose-green and never instructs the operator to restart an earlier skill.
