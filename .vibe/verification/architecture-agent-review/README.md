# Architecture agent review runner

Runner id: `architecture-agent-review` (review axis: architecture).

This is the generated starter's concretely-scaffolded architecture review axis. It is a model-mediated (agent) reviewer: its verdict is advisory — Evidence Packet trustClass `model_advisory`, promoted to blocking by locked policy (DL-30). It is NOT deterministic; the deterministic Node wrapper that launches it does not make the model verdict deterministic. The four typecheck/lint/unit/build runners stay deterministic and separate. It invokes the selected harness `pi` via `.vibe/harness/selected-harness.json` and the runner catalog metadata; no Pi fallback is allowed. Its live semantic verdict is pending-live and run by the operator's selected harness.

All eight required independent review axes (spec-fidelity, standards-maintainability, architecture, security, test-quality, ux-accessibility, performance-operations, context-claim-integrity) are registered under `reviewAxisRegistration` in `.vibe/registry/runner-catalog.json`, each classified model_advisory / promoted-to-blocking / pending-live and bound to the `review_finding_set` output validator; the authoritative registration lives in `packages/registry/review-agents`.

Evidence is written to `.vibe/evidence/architecture-agent-review/review.json` with `passed`, `failed`, or `blocked` status plus findings containing paths and reasons. Missing CLI/runtime/auth, non-zero harness exits, and unparseable harness output produce `blocked` evidence and a non-zero runner exit.

The runner reviews the union of committed diff from the initial create commit/baseline to HEAD, staged diff, unstaged tracked diff, and bounded untracked file summaries. It also runs fail-closed product completeness checks for static seed/sample/demo/mock services, direct seed imports, local JSON/in-memory storage, descriptor-only UI, missing backend/API-client mutations for UI mutation flows, hard-coded/self-certifying findings, and hidden dirty work. Scope filtering is generated from `default`: backend=true, web=true, mobile=true.
