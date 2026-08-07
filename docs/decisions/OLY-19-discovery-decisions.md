# OLY-19: Discovery decisions — Sign Up / Login screen

**Status:** locked by operator (2026-08-04); **updated 2026-08-06** — D11 Amendment 1 (final copy from the design snapshot), D12 (two colour modes), follow-up statuses after backend auth landed in `main`
**Scope:** OLY-19 ([3.1] Sign Up / Login screen) and its sub-issues OLY-39, OLY-40, OLY-42, OLY-41.
**Source:** full decision register with alternatives and reopening conditions lives in the local workflow memory (`.vibe/work/oly-19/`, gitignored by starter convention). This document is the team-visible summary for review and challenge.

Related ADR: [OLY-19-web-component-library-radix.md](./OLY-19-web-component-library-radix.md) (D3 in full).

## Delivery shape (D2)

OLY-19 ships as four Linear sub-issues, each its own branch + PR, strictly sequential:

| Order | Issue      | Content                                                                                                         | Target                            |
| ----- | ---------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| 1     | **OLY-39** | i18n infrastructure + landing `/` + language switcher + routing skeleton (`/signup`, `/login`, `/topics` stubs) | 8 Aug                             |
| 2     | **OLY-40** | Signup/login forms, realtime validation, API mocks, session, redirect, back-navigation guard, logout            | 8 Aug                             |
| 3     | **OLY-42** | Error states: duplicate account / invalid format / network failure                                              | 8 Aug                             |
| 4     | **OLY-41** | Forgot password                                                                                                 | **deferred**, blocked by contract |

## Acceptance criteria (OLY-19)

Source: the locked work brief (`.vibe/work/oly-19/work-brief.json`, local).
Copied here so reviewers can check the work against them.

| ID  | Slice  | Criterion                                                                                                                                              | Proof            |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| AC1 | OLY-39 | User switches UI language uz/ru/en on the landing; all chrome strings re-render; choice persists across reload                                         | unit + e2e       |
| AC2 | OLY-39 | `/`, `/signup`, `/login`, `/topics` render; stubs carry i18n'ed placeholders                                                                           | e2e              |
| AC3 | OLY-40 | Valid signup (name, phone or email single field, password ≥8) via mock → token stored → lands on `/topics`; browser Back never returns to auth screens | unit + e2e       |
| AC4 | OLY-40 | Validation messages appear in realtime (after first blur, on change), sourced from contract Zod schemas, rendered in the active locale                 | unit             |
| AC5 | OLY-40 | Mock fixtures validate against contract Zod schemas in tests (no silent mock/contract drift)                                                           | unit             |
| AC6 | OLY-42 | Duplicate account → UI offers login instead; invalid format → field-level errors; network failure → retry control with entered data preserved          | unit + e2e       |
| AC7 | all    | All UI types imported from `packages/contracts` via api-client; no frontend-owned copies of contract rules                                             | typecheck + lint |

## Decisions

### D1 — Full UI i18n from the first screen

react-i18next with three locales (uz/ru/en) for all UI chrome strings, language switcher on landing + auth screens, choice persisted in localStorage and sent as `signup.language` (the contract field already exists). Learning content stays uz (locked product direction). ru/en UI translations are agent-generated drafts pending native review (non-blocking). Locale list derives from `LanguageSchema` in `packages/contracts` — no duplicated enum.

### D3 — Radix UI Primitives + CSS Modules

See the linked ADR. No Tailwind/shadcn, no React Aria at this step.

### D4 — Forgot password deferred past 8 August

The 31 July call added forgot password to scope, but the OLY-8 contract has **no password-reset endpoint**. Decision: no «Forgot password?» affordance on the login screen for the milestone (consistent with §5.1 minimal auth; a dead link on a live demo is worse than absence). OLY-41 stays blocked until the contract gains a reset endpoint — **backend/team-lead follow-up**.

### D5 — API mocks via a seam, no MSW

A narrow `AuthApi` interface in `apps/web` with two implementations: `HttpAuthApi` (real, via `api-client`) and `MockAuthApi` (in-memory accounts; success / duplicate / invalid credentials / simulated network failure). Selected by `VITE_API_MOCK` env flag (default mock in dev and E2E). Mock fixtures are validated against contract Zod schemas in unit tests — no silent mock/contract drift. Rationale: no backend exists to disagree with; MSW would test a mock through a mock while adding service-worker + Playwright complexity days before the demo. When backend auth lands, flip the flag — screen code untouched.

### D6 — Error taxonomy lives on the frontend seam; contract untouched

The OLY-8 contract defines only 200 responses for signup/login, but the DoD requires distinguishing duplicate account / invalid format / network failure. Decision: a discriminated `AuthResult` union on the `AuthApi` seam (`duplicate_account` / `invalid_credentials` / `validation` / `network`). The contract is **not** modified inside a frontend ticket; contract error schemas are a **team-lead/backend follow-up**. When the backend lands, HTTP→AuthResult mapping lives in `HttpAuthApi` only.

### D7 — Token in localStorage; replace-navigation

`authSession` module (localStorage get/set/clear); `ProtectedRoutes` in `app.tsx` wired via the existing schematic markers; API client sends `Authorization: Bearer`. All post-auth navigation uses `replace: true` — browser Back never returns to auth screens (31 July call requirement). **Known accepted risk:** localStorage is XSS-readable; httpOnly-cookie migration is a follow-up for when the real backend exists.

### D8 — Redirect target: stub `/topics`

OLY-19 requires redirect to Topic List, which does not exist yet. Decision: routing skeleton includes a `/topics` stub (i18n'ed, styled in the spirit of the existing Topic List Figma design). The real Topic List screen is a separate future task. Logout is in OLY-40 scope (trivial via `authSession.clear()`).

### D9 — Validation: react-hook-form + zodResolver over contract schemas

The contract Zod schema is the **only** source of validation rules (`zodResolver(contract.signup.body)`) — zero duplicated rules in the frontend. `mode: "onTouched"`, `reValidateMode: "onChange"` (realtime per the 31 July call, without scolding before first blur). Error texts via i18n keys. The identity control is a **single «phone or email» field** (per Figma): the frontend detects the kind (`@` → email, else phone) and maps into the contract's `phone`/`email` fields.

### D10 — `grade` gap flagged, not silently fixed

`UserSchema` requires `grade` (5–11), but the signup contract and §14 Screen 1 do not collect it. Decision: build the form strictly per §14 + contract — no grade field. **Team-lead follow-up:** decide where grade enters (signup extension vs onboarding step) before backend auth is implemented.

### D11 — Landing scope: static blocks + CTA

Landing `/` = static multi-block page per the Figma Make draft (several simple content blocks, no forms, CTA buttons → `/signup`, `/login`) + language switcher.

**D11 Amendment 1 (2026-08-05, updated 2026-08-06):** design of record is the Figma **Make** snapshot (file `SqHXE7vPridy3ZHWtDLpQV`), captured as evidence at `.vibe/evidence/oly-19/design/` (theme tokens, final i18n copy ×3 locales, reference implementation, README with provenance). **The snapshot is local to the frontend owner's machine** (operator decision, second pass 2026-08-06: sole frontend developer + design owner) — it is not committed; rebuild it from the documented source per `.vibe/evidence/README.md`. Copy is **final, taken from the snapshot** — the earlier "placeholder copy + mandatory PNG exports" clause is replaced: frame exports are impossible from Make, and the published live prototype (<https://cleat-boil-62436427.figma.site/>) supersedes them as the rendering reference. Full record in the register (D11-A1).

### D12 — Two colour modes with a switcher

New design fact from the snapshot: the design of record defines two complete colour modes (dark + light, 39 semantic tokens each — the snapshot's theme object has 41 fields; the other two are `hintBg`/`hintBorder`, which are runtime functions, not tokens) and a theme toggle in the navigation of every screen. Decision (2026-08-05): **ship both modes** with an explicit toggle next to the language switcher; choice persists in localStorage and applies before first paint. Dark is the default. Every OLY-39/40/42 screen is visually verified in both modes. Full record in the register (D12, incl. the `color-mix()` rule for topic-accent-derived tokens).

## Team-lead follow-ups (blocking nothing in OLY-39/40/42)

1. Contract error schemas for signup/login (D6) — **updated 2026-08-06:** backend auth landed in `main` (PR #4) and the implementation does return 409 duplicate / 400 validation / 401 invalid credentials (also in Swagger). **But the contract still declares only `responses: { 200 }`** — no error schemas. The frontend will map HTTP codes to the `AuthResult` union against observed implementation behaviour (exactly what D6 prescribes), but response-body shapes are undefined anywhere. Please add error schemas to `contract.ts` — small PR, I can propose the shapes.
2. Password-reset endpoint → unblocks OLY-41 (D4)
3. `grade` collection point: signup vs onboarding (D10) — **updated 2026-08-06:** backend merged with a temporary hardcoded `DEFAULT_GRADE = 5` (flagged `FLAG (D10)` in code). Acceptable for demos; must be decided before any real user data exists.
4. httpOnly-cookie auth when the real backend lands (D7)
5. `parent_contact` field: the prototype's signup form collects it, but `contract.signup.body` does not accept it — frontend omits it. If product wants it, contract extension needed (design snapshot README, freezing notes)

## Stack confirmations

- Team lead, 2026-08-04: «simple SPA React 18 is better for now, we don't need anything from Next or React 19» — DL-16 starter stack stands.

## Post-review hardening record (2026-08-06) — visible justifications

The full decision register lives in `.vibe/work/oly-19/` (local, gitignored by design). This section keeps the justifications a PR reviewer needs **inside** the committed tree:

- **Starter scaffold routes removed** (`home`, `system-status`, S5). OLY-8's DoD evidence was «web consumes `createApiClient`» — that consumption is now load-bearing through `i18n/index.ts`, which derives the locale list from the contract's `LanguageSchema` (same api-client package). The scaffold screens were starter placeholders, not product screens; their deletion is recorded here and in the register (D2/D8/D11).
- **Path-ownership expansion beyond the plan's `owned` list**, all review-driven and listed with reasons: `eslint.config.mjs` (operator rule: machine-checkable standards live in the linter — strict block scoped to `apps/web`), `AGENTS.md` (one pointer line to `docs/code-standards.md`), `.github/workflows/quality.yml` (e2e-web job proving AC1/AC2 in CI, PR-only), `apps/web/index.html` (`lang="uz"` + favicon link), `apps/web/public/favicon.svg` (below).
- **favicon.svg hardcoded colours — recorded exception to the tokens-only rule (D3).** A favicon renders outside the document and cannot consume CSS custom properties, so the brand stops are literals; `apps/web/test/favicon.test.ts` pins them to `brandGradFrom`/`brandGradTo`/`brandMark` so any drift breaks the build.
- **Dead `nav` i18n namespace removed** (2026-08-06): no consumers after the shell became nav-less per the design of record. OLY-40 re-adds exactly the keys it needs.
- **Landing nav on phones: login link hidden and wordmark clipped below 640px** (operator, 2026-08-07). Measured at 375px: the four controls need 366px of the 335px available, so the row wrapped, the brand dropped to its own line and the sticky header grew to 167px — a fifth of the viewport. The design of record offers nothing to copy here: its nav carries no responsive classes and no wrap, so at this width the prototype would overflow sideways rather than stack. (The rest of the landing does carry responsive intent — `sm:grid-cols-3`, `lg:grid-cols-2`, `sm:flex-row` — and all of it was ported; the nav is the one place the design is silent.) Two changes: the nav's login link is hidden — it is duplicated in the hero and `/login` is a first-class route — and the wordmark is clipped rather than removed, because the logo is `aria-hidden` and dropping the text outright would leave the home link with no accessible name (WCAG 2.4.4). Result: 167px → 76px, everything on one row, no horizontal overflow, holds down to 360px and degrades to two rows below that instead of scrolling. The auth-screens nav was measured too (297px of 335px, single row) and needs no change. Guarded by `apps/web/e2e/landing-nav.mobile.spec.ts` in a dedicated `mobile-chrome` Playwright project, because unit tests stub CSS Modules away and the desktop project never crosses the breakpoint.
- **Design deviations from the snapshot are deliberate** (D11-A2, D12-A1): 5 of 7 hero topic chips (explicit `HERO_TOPIC_IDS` list), ToggleGroup instead of Select for the switcher, 10 tokens raised to WCAG AA with a contrast test, no theme-switch animation. The full old→new token list lives in the local design snapshot README («Deviations») — the frontend owner runs the Figma sync from it.
- **`/profile` stub beyond the S6 list** (operator, 2026-08-06): the profile page exists in the design of record (avatar in the post-auth header), so its route was reserved under the same D2 routing-skeleton rule as the other stubs — constant `ROUTES.PROFILE`, shared StubLayout, i18n ×3, unit tests.
