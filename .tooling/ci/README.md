# .tooling/ci

Generated starter CI uses GitHub Actions (`.github/workflows/quality.yml`) as the
locked v0.1 provider. The default workflow is a quick deterministic gate:
install, project-local `pnpm exec vibe-engineer help --json`, typecheck, lint,
format check, unit tests, and build.

Full web E2E, mobile E2E, visual baselines, Pulumi deploys, and other expensive
or environment-heavy proofs remain explicit/manual/orchestrator-run and are not
part of default PR/push CI.
