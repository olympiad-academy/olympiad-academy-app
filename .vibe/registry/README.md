# .vibe/registry

Project-local vibe-engineer registry files live here.

- `runner-catalog.json` is the generated default verification runner catalog.
- It maps common Verification Delta items (`typecheck`, `lint_format`, `unit`, `build_package`) to `.tooling/scripts/starter-verify-runner.mjs`.
- `vibe-engineer verify` consumes this catalog with `--runner-catalog .vibe/registry/runner-catalog.json`.

Implementation Plans may mark other layers `not_applicable` with a rationale or add project-specific runner entries before requiring them.
