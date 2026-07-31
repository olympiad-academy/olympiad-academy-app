---
name: tdd
description: "TDD discipline. Use when an approved build slice must establish red, minimal green, review-preserved green, or controlled sensitivity proof at a plan-mapped public seam."
version: 2.0.0
invocation-policy: model_invoked
runtimeExecutionClaim: pending-live
---

# Evidence-bearing TDD

Use the tracer-bullet loop at the exact public seam already locked by discovery and mapped by the approved effective plan.

1. Confirm the seam binding, acceptance criterion, public interface, and actual consumer. Completion: every identity and digest resolves; build chooses none of them.
2. Execute the smallest behavioral test or executable check. Completion: a canonical red Evidence Packet records a non-zero result caused by the intended missing behavior. Setup, environment, and unrelated failures are classified separately and do not count.
3. Investigate a green start. Completion: behavior-already-exists, insensitive-test, or wrong-scope is recorded and routed; green is never relabeled red.
4. Implement only the approved minimum and execute green. Completion: the same seam passes with a canonical green Evidence Packet linked after red.
5. Review and refactor through an independent checkpoint. Completion: clarity may improve, behavior stays unchanged, and targeted plus affected checks remain green.
6. Prove sensitivity with controlled breakage or a targeted mutation. Completion: break goes red for the intended reason and restore returns green through the actual consumer.
7. Preserve immutable red, green, review, affected-check, and sensitivity lineage. Completion: chronological validation accepts the complete chain.

A retained test reads as a behavior specification, uses an independent oracle from the locked decision or trusted fixture, and crosses the public interface. Private-state reach-in, internal-collaborator coupling, tautology, and oracle-free snapshots are typed test-quality failures. Boundary, failure, recovery, security, concurrency, migration, accessibility, and state cases are added when the plan marks them applicable.

Mock only an actual external boundary. Prefer a real interface or test service for owned collaborators. A mock never replaces the load-bearing producer-to-carrier-to-consumer witness.

A repairable miss enters the same-run gap resolver, applies durable amendments where required, reruns impacted proof, and resumes automatically. An unavailable lawful prerequisite remains an honest resumable wait.
