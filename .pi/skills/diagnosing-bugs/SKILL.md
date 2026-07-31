---
name: diagnosing-bugs
description: "Bug-diagnosis discipline. Use when a reported defect must be reproduced, minimized, and driven to a proven root cause and intended correction before build implements the fix."
version: 2.0.0
invocation-policy: model_invoked
runtimeExecutionClaim: pending-live
---

# Bug diagnosis

Drive a defect from symptom to a locked root cause and intended correction through a tight, falsifiable loop; implementation stays with approved build.

1. Reproduce the defect deterministically inside a bounded, policy-constrained loop. Completion: a recorded reproduction fails for the reported reason and unrelated failures are classified out.
2. Minimize the reproduction to the smallest input and surface that still fails. Completion: the minimized case still reproduces and every removed factor is shown non-essential.
3. Rank falsifiable hypotheses and test exactly one prediction at a time. Completion: each probe records one prediction and its observed result, and refuted hypotheses are retired.
4. Instrument and prove the cause by controlled intervention, not correlation. Completion: a causal intervention flips the symptom on and off and the root cause is verified.
5. Add a regression check that fails before the fix and lock the intended correction as a decision. Completion: the regression check goes red for the intended reason and the correction is recorded for build, not applied here.
6. Guard against production fingerprints and record cleanup plus any prevention opportunity. Completion: no production system is mutated, the diagnosis carrier is immutable, and prevention work is separately decided.

A repairable miss stays in the current run: the forward-only gap resolver reopens the failing loop, persists a scoped amendment bound to its digest, revalidates only the affected hypotheses, and resumes automatically. When a trustworthy red loop cannot be established it records an honest resumable block, never prose-green and never a jump back to an earlier skill.
