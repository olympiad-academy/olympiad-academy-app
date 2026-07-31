---
name: code-review
description: "Code-review discipline. Use when a change set between HEAD and an operator-fixed point must be reviewed across the eight isolated review axes before ship."
version: 2.0.0
invocation-policy: model_invoked
runtimeExecutionClaim: pending-live
---

# Eight-axis code review

Review the change set between HEAD and one operator-fixed point along eight independent axes, each in an isolated review context, then aggregate their findings without cross-axis reranking.

1. Pin the fixed point exactly as the operator gave it (commit, branch, tag, or merge-base) and capture the three-dot diff and commit list once. Completion: the fixed point resolves, the diff is non-empty, and both are recorded before any axis runs; an unresolved ref or empty diff fails here, not inside an axis.
2. Bind the spec source from the locked Work Brief 2.0.0 and approved Implementation Plan 2.0.0 acceptance trace — never from an external tracker treated as canonical authority. Completion: every reviewed requirement resolves to an acceptance criterion or a recorded no-spec note.
3. Run each axis in its own isolated context so no axis pollutes another: spec-fidelity, standards, architecture, security, test-quality, accessibility, performance-and-operations, and context-and-claim. Completion: all eight axes report, each citing the exact hunk and the exact standard or acceptance line, with hard violations separated from judgement calls.
4. Carry the fixed smell baseline (mysterious name, duplicated code, feature envy, data clumps, primitive obsession, repeated switches, shotgun surgery, divergent change, speculative generality, message chains, middle man, refused bequest) as labelled judgement heuristics on the standards axis; a documented repository standard always overrides the baseline, and anything tooling already enforces is skipped. Completion: every baseline smell raised names the heuristic and quotes the hunk.
5. Aggregate the axes side by side under their own headings; no finding is merged or reranked across axes. Completion: each axis reports its own worst finding and no single cross-axis winner is chosen.
6. Persist findings as an Evidence Packet 2.0.0 with a per-finding disposition and proof boundary. Completion: every blocking finding is resolved or routed and the packet validates.

Each finding is a behavior- or standard-level observation with an independent citation; a finding with no matching hunk or standard line is rejected. A repairable miss enters the same-run gap resolver, applies durable amendments where required, reruns impacted proof, and resumes automatically. An unavailable lawful prerequisite remains an honest resumable wait, and recovery is forward-only inside the run.
