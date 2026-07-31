# Reference starter

This is the `@olympiad-academy-app` reference monorepo produced by a
locally verified `vibe-engineer create` command from shipped starter template
files. That local create proof is not public npm availability, global-install
freshness, hosted CI, live cloud-resource, or product readiness proof.
The starter recreates the harness's domain-neutral structure in its own private
`@olympiad-academy-app/*` workspace packages; it does **not** import
`@vibe-engineer/*` harness runtime packages and does **not** copy harness
implementation logic.

The starter ships only public health/readiness endpoints. Product CRUD,
authentication, RBAC, persistence models, contracts, web routes, and mobile flows
are added by schematics so generated products do not inherit demo records,
static stores, or reference CRUD controllers.

Local app startup:

```bash
pnpm run dev                 # API + web
WEB_PORT=5199 pnpm run dev:web # web only on a custom Vite port
pnpm run dev:mobile          # Expo-powered React Native app on Metro port 8081
pnpm run dev:mobile:ios      # open on iOS simulator
pnpm run dev:mobile:android  # open on Android emulator
```

The mobile app uses the Expo-managed React Native local runtime so users do not
need a globally installed React Native CLI or a checked-in native shell just to
open the starter on a simulator. Xcode / Android Studio / simulator setup remain
normal platform prerequisites.

The generated `.github/workflows/quality.yml` quick gate mirrors the local-only
starter proof path and intentionally excludes full E2E, mobile/device, visual,
and deployment proofs from default PR/push CI.

Verification runner starter path — run the deterministic readiness gates directly
through the shipped runner (one layer at a time):

```bash
node .tooling/scripts/starter-verify-runner.mjs typecheck
node .tooling/scripts/starter-verify-runner.mjs lint_format
node .tooling/scripts/starter-verify-runner.mjs unit
node .tooling/scripts/starter-verify-runner.mjs build_package
```

Each layer runs its deterministic gate and writes a canonical result under
`.vibe/evidence/vibe-runner/<layer>.json`. The generated
`docs/reference/starter-readiness-plan.json` is a starter-local readiness
descriptor (`vibe-engineer.starter-readiness/2.0.0`) that names those runner
layers — it is NOT an artifact-chain Implementation Plan.

`vibe-engineer verify --implementation-plan <path>` consumes ONLY a real,
operator-approved Implementation Plan 2.0.0 produced by the `plan` skill for
actual work; a v2-only intake gate runs first. Pointing `verify` at this
readiness descriptor (or at a v1 / unknown-version artifact) fails closed with
the stable CLI code `VE_VERIFY_PLAN_INTAKE_VERSION_REJECTED` — typed gate code
`ARTIFACT_KIND_MISMATCH` for the descriptor, `MIGRATION_REQUIRED` for a v1 plan,
`UNSUPPORTED_VERSION` for an unknown version. A real Implementation Plan 2.0.0 is
produced by the plan skill for actual work and is never shipped as a starter
fixture. Generated evidence is local-only starter evidence written under
`.vibe/evidence/**`. Canonical Evidence Packet JSON, digests, and lineage are
versioned workflow memory (DL-33 two-tier); only bulky `sidecars/**` and
binary/archive patterns are ignored and must be captured with
`vibe-engineer archive` before cleanup. Add project-specific runner entries and
update the descriptor before requiring additional readiness layers. Fake,
fixture, recorded, or local-only evidence must stay labeled and must not be
presented as live/public/package/product proof.

<!-- vibe-engineer:starter-qa-scope:start -->

## Generated starter QA and scope

Generated scope: `default` (API + web + mobile).

Generated surfaces:

- NestJS API with Prisma migrations
- React web app
- Expo React Native mobile app
- shared domain/contracts/api-client/config/testing/ui packages

Omitted surfaces/checks:

- none; the default starter includes API, web, and mobile surfaces.

### pnpm approve-builds guidance

If `pnpm install` reports ignored build scripts or prompts for approval, run `pnpm approve-builds` from the project root and approve only build scripts for packages you intentionally installed.
The default/API scopes may legitimately prompt for Prisma/Nest/esbuild-related packages such as `@prisma/client`, `prisma`, `@nestjs/core`, or `esbuild`; do not approve unrelated packages.

### NestJS + tsx dependency injection

The API dev runtime uses `tsx`, which does not emit TypeScript decorator metadata. NestJS constructors must use explicit `@Inject(...)` tokens or explicit provider wiring; do not rely on reflected constructor parameter types.
Future Nest schematics or hand-written modules should copy the generated controller pattern and keep DI tokens explicit in tests and implementation files.

### Prisma migration safety

`vibe-engineer doctor` checks generated Prisma migration folders for missing or empty `migration.sql` files (the local symptom behind Prisma P3015). If the folder was never applied or shared, delete only that local empty folder and rerun `pnpm run db:migrate`; otherwise restore the migration from version control or create a new corrective migration.

### Local generated files

`.gitignore` and `.prettierignore` intentionally exclude local DB/data stores, env files, build/cache outputs, and generated evidence/work caches while keeping README placeholders tracked.

<!-- vibe-engineer:starter-qa-scope:end -->

<!-- vibe-engineer:architecture-agent-review:start -->

## Default architecture agent runner

Generated runner id: `architecture-agent-review` (review axis: architecture). This starter ships exactly one concretely-scaffolded architecture agent runner in `.vibe/registry/runner-catalog.json`; the existing typecheck/lint/unit/build runners remain deterministic and separate. The architecture runner is a model-mediated reviewer classed `model_advisory` (Evidence Packet trust), promoted to blocking by locked policy — never deterministic, even though a deterministic Node wrapper launches it (DL-30 REC-4). All eight required independent review axes are registered under the entry's `reviewAxisRegistration`, each model_advisory / promoted-to-blocking / pending-live and bound to the `review_finding_set` output validator; live semantic verdicts are pending-live and run by the operator's selected harness.

The architecture runner invokes the selected harness `pi` through `.vibe/harness/selected-harness.json` and fails closed for missing CLI/runtime/auth or unparseable output. It writes structured JSON evidence to `.vibe/evidence/architecture-agent-review/review.json` with `passed`, `failed`, or `blocked` plus findings paths and reasons.

The runner reviews the union of committed diff from the initial create commit/baseline to HEAD, staged diff, unstaged tracked diff, and bounded untracked file summaries. Before accepting a pass it fails product-completeness deltas for static seed/sample/demo/mock services, direct seed imports, local JSON/in-memory stores, descriptor-only UI, UI mutation flows without backend/API-client mutations, hard-coded/self-certifying findings, and hidden dirty work. For this generated scope (`default`), omitted architecture boundaries are: none.

<!-- vibe-engineer:architecture-agent-review:end -->

<!-- vibe-engineer:selected-harness:start -->

## Selected agentic harness

This starter was generated with `pi` (Pi Coding Agent).
Selected harness metadata is adapter-specific; Pi renders every workflow skill/prompt, the project skill, and the governed discipline/entrypoint catalog natively under `.pi/`.

- Context files: AGENTS.md, CLAUDE.md.
- Adapter-native asset families generated now: pi-skill-files, pi-prompt-templates.
- Pi skill/prompt families generated now: pi-skill-files, pi-prompt-templates.
- Governed discipline/entrypoint family (DL-25 §7) generated now: pi-governed-capability-skills.
- Blocked asset families:
  - pi-extensions
  - pi-package-manifest
  - agents
  - plan-mode
- Live runtime diagnostic: Pi CLI/auth/runtime unavailable for selected harness.
- Runtime binary probe: `pi --version`.
- Trust boundary:
  - Project-local .pi resources and TypeScript extensions require project trust; create/import emits only non-executable skills/prompts/context.
- Contract states:
  - contextFiles: ready
  - nativeSkills: ready
  - nativeCommands: ready
  - promptTemplates: ready
  - hooks: blocked
  - plugins: blocked
  - mcp: unsupported
  - agents: blocked
  - planMode: blocked
  - invocation: ready
  - structuredOutput: ready
  - verificationRunner: pending-live
  - securityTrustPolicy: ready
- See `.vibe/harness/README.md` and `.vibe/harness/handoff.md` for trust, security, blocked native surfaces, renderer extension points, and handoff guidance.

<!-- vibe-engineer:selected-harness:end -->
