---
name: handoff
description: "Advanced user-invoked entrypoint. The operator runs it to transfer work across sessions by reference to canonical artifacts; it is never auto-invoked by the model."
version: 2.0.0
invocation-policy: user_invoked
disable-model-invocation: true
runtimeExecutionClaim: pending-live
---

# Handoff

Transfer work across sessions or contexts by reference, producing a concise redacted handoff that points at canonical artifacts instead of duplicating them.

1. Identify the exact artifacts the next context needs and reference them by digest. Completion: every referenced artifact resolves by digest and none of its content is duplicated inline.
2. Redact secrets and irrelevant context so the handoff stays concise. Completion: no secret or out-of-scope content is carried and the handoff stays within its size bound.
3. Validate the handoff schema and format before it is emitted. Completion: the handoff validates against its schema and a malformed handoff is rejected.
4. Bind source artifact digests so the receiver can detect drift. Completion: each source digest is recorded and the receiver can verify freshness.
5. Forbid promoting handoff content to truth without its canonical source. Completion: no handoff statement is treated as authoritative unless its canonical artifact is present.
6. Apply the retention and selected-harness transport policy. Completion: the handoff is retained and transported per policy with no unbounded persistence.

A repairable miss stays in the current run: the forward-only gap resolver regenerates the affected reference, persists a scoped amendment bound to its digest, revalidates only the impacted links, and resumes automatically. It never duplicates canonical content as truth and never returns the operator to an earlier skill.
