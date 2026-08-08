# OLY-19: Discovery decisions — Sign Up / Login screen

**Status:** locked by operator (2026-08-04); **last updated 2026-08-08** — D4/D10 resolved by the operator, D7 follow-up status checked against the merged backend, three contract gaps added from the OLY-40 review, two OLY-40 scope additions recorded. Earlier revision (2026-08-06): D11 Amendment 1 (final copy from the design snapshot), D12 (two colour modes), follow-up statuses after backend auth landed in `main`.
**Scope:** OLY-19 ([3.1] Sign Up / Login screen) and its sub-issues OLY-39, OLY-40, OLY-42, OLY-41.
**Source:** full decision register with alternatives and reopening conditions lives in the local workflow memory (`.vibe/work/oly-19/`, gitignored by starter convention). This document is the team-visible summary for review and challenge.

Related ADR: [OLY-19-web-component-library-radix.md](./OLY-19-web-component-library-radix.md) (D3 in full).

## Delivery shape (D2)

OLY-19 ships as four Linear sub-issues, each its own branch + PR, strictly sequential:

| Order | Issue      | Content                                                                                                         | Target                |
| ----- | ---------- | --------------------------------------------------------------------------------------------------------------- | --------------------- |
| 1     | **OLY-39** | i18n infrastructure + landing `/` + language switcher + routing skeleton (`/signup`, `/login`, `/topics` stubs) | 8 Aug                 |
| 2     | **OLY-40** | Signup/login forms, realtime validation, API mocks, session, redirect, back-navigation guard, logout            | 8 Aug                 |
| 3     | **OLY-42** | Error states: duplicate account / invalid format / network failure                                              | 8 Aug                 |
| 4     | **OLY-41** | Forgot password                                                                                                 | **deferred** (see D4) |

The 8 August targets above are the original milestone. It passed without a
demo — the app is not being shown yet and development continues — so those
dates are kept as a record of what was planned, not as live commitments. No
replacement dates are set here; scheduling is the team lead's call.

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

The 31 July call added forgot password to scope, but the OLY-8 contract has **no password-reset endpoint**. Decision: no «Forgot password?» affordance on the login screen for the milestone (consistent with §5.1 minimal auth; a dead link on a live demo is worse than absence).

**D4 Amendment 1 (operator, 2026-08-07) — deferred, not blocked.** Asked whether a reset endpoint was planned; the answer was not now, later. OLY-41 is therefore an explicit not-now rather than a ticket waiting on a dependency someone should be chased for, and it is filed that way in Linear (retitled to «Forgot password» only, after OLY-42 was split out). No reset endpoint is being requested. The original decision — no affordance on the login screen — stands unchanged. Reopens if the contract gains a reset endpoint or the team reprioritises.

### D5 — API mocks via a seam, no MSW

A narrow `AuthApi` interface in `apps/web` with two implementations: `HttpAuthApi` (real, via `api-client`) and `MockAuthApi` (in-memory accounts; success / duplicate / invalid credentials / simulated network failure). Selected by `VITE_API_MOCK` env flag (default mock in dev and E2E). Mock fixtures are validated against contract Zod schemas in unit tests — no silent mock/contract drift. Rationale: no backend exists to disagree with; MSW would test a mock through a mock while adding service-worker + Playwright complexity days before the demo. When backend auth lands, flip the flag — screen code untouched.

### D6 — Error taxonomy lives on the frontend seam; contract untouched

The OLY-8 contract defines only 200 responses for signup/login, but the DoD requires distinguishing duplicate account / invalid format / network failure. Decision: a discriminated `AuthResult` union on the `AuthApi` seam (`duplicate_account` / `invalid_credentials` / `validation` / `network`). The contract is **not** modified inside a frontend ticket; contract error schemas are a **team-lead/backend follow-up**. When the backend lands, HTTP→AuthResult mapping lives in `HttpAuthApi` only.

### D7 — Token in localStorage; replace-navigation

`authSession` module (localStorage get/set/clear); `ProtectedRoutes` in `app.tsx` wired via the existing schematic markers; API client sends `Authorization: Bearer`. All post-auth navigation uses `replace: true` — browser Back never returns to auth screens (31 July call requirement). **Known accepted risk:** localStorage is XSS-readable; httpOnly-cookie migration is a follow-up for when the real backend exists.

**Status check (2026-08-08):** the reopening condition has fired — the real backend exists (PR #4). Checked what it actually ships: `auth.controller.ts` and `auth.service.ts` return the token in the JSON body only, `cookie-parser` is not a dependency, and `res.cookie()` appears nowhere in `apps/api`. So this is not «already available, just not wired up» — it has not been built on either side, and moving to httpOnly cookies is work for both (backend: `Set-Cookie` plus, most likely, CSRF protection once the browser sends the cookie automatically; frontend: stop reading the token from JS). Nothing changes for now; the risk stays accepted, and it is recorded here so it stays accepted rather than forgotten.

**Extended in OLY-40 (operator, 2026-08-07) — the landing is a pre-auth screen too.** D7 sends an authenticated user forward from `/signup` and `/login`; `/` was not covered, because no working auth existed when D7 was decided. The landing's nav and hero offer exactly the two actions D7 says such a user should not be offered, and the brand link in the post-auth header points straight at it — one click from `/topics`. The index route now sits behind the same guard. Consequence, accepted deliberately: Back out of `/topics` is a no-op for an authenticated user, and the landing is unreachable while signed in. **This narrows what OLY-39 delivered**, so read AC2 («`/` … render») as holding for an unauthenticated visitor, which is the case its e2e proof exercises.

### D8 — Redirect target: stub `/topics`

OLY-19 requires redirect to Topic List, which does not exist yet. Decision: routing skeleton includes a `/topics` stub (i18n'ed, styled in the spirit of the existing Topic List Figma design). The real Topic List screen is a separate future task. Logout is in OLY-40 scope (trivial via `authSession.clear()`).

### D9 — Validation: react-hook-form + zodResolver over contract schemas

The contract Zod schema is the **only** source of validation rules (`zodResolver(contract.signup.body)`) — zero duplicated rules in the frontend. `mode: "onTouched"`, `reValidateMode: "onChange"` (realtime per the 31 July call, without scolding before first blur). Error texts via i18n keys. The identity control is a **single «phone or email» field** (per Figma): the frontend detects the kind (`@` → email, else phone) and maps into the contract's `phone`/`email` fields.

### D10 — `grade` gap flagged, not silently fixed

`UserSchema` requires `grade` (5–11), but the signup contract and §14 Screen 1 do not collect it. Decision: build the form strictly per §14 + contract — no grade field.

**D10 Amendment 1 (operator, 2026-08-07) — resolved: Grade 5 only.** The original follow-up asked for a decision «before backend auth is implemented»; auth was merged first, carrying a hardcoded `DEFAULT_GRADE = 5` marked `FLAG (D10)` in `auth.constants.ts`. That default is now confirmed as the intended behaviour rather than an unreviewed leftover: the pilot serves Grade 5 and nothing else. Explicitly a **working answer**, valid only while that is true — no contract change, no onboarding step, no field on the form. Reopens if scope widens past Grade 5, which is also where `UserSchema`'s 5–11 range starts to matter.

### D11 — Landing scope: static blocks + CTA

Landing `/` = static multi-block page per the Figma Make draft (several simple content blocks, no forms, CTA buttons → `/signup`, `/login`) + language switcher.

**D11 Amendment 1 (2026-08-05, updated 2026-08-06):** design of record is the Figma **Make** snapshot (file `SqHXE7vPridy3ZHWtDLpQV`), captured as evidence at `.vibe/evidence/oly-19/design/` (theme tokens, final i18n copy ×3 locales, reference implementation, README with provenance). **The snapshot is local to the frontend owner's machine** (operator decision, second pass 2026-08-06: sole frontend developer + design owner) — it is not committed; rebuild it from the documented source per `.vibe/evidence/README.md`. Copy is **final, taken from the snapshot** — the earlier "placeholder copy + mandatory PNG exports" clause is replaced: frame exports are impossible from Make, and the published live prototype (<https://cleat-boil-62436427.figma.site/>) supersedes them as the rendering reference. Full record in the register (D11-A1).

### D12 — Two colour modes with a switcher

New design fact from the snapshot: the design of record defines two complete colour modes (dark + light, 39 semantic tokens each — the snapshot's theme object has 41 fields; the other two are `hintBg`/`hintBorder`, which are runtime functions, not tokens) and a theme toggle in the navigation of every screen. Decision (2026-08-05): **ship both modes** with an explicit toggle next to the language switcher; choice persists in localStorage and applies before first paint. Dark is the default. Every OLY-39/40/42 screen is visually verified in both modes. Full record in the register (D12, incl. the `color-mix()` rule for topic-accent-derived tokens).

## Team-lead follow-ups (blocking nothing in OLY-39/40/42)

### Open — needs a change in `packages/contracts` / `apps/api`

1. **No phone format at all** (found while reviewing OLY-40, 2026-08-08). `PhoneOrEmailIdentitySchema` types phone as `z.string().min(1)`, so any non-empty string without an `@` is a valid phone — `helhagsrffff` creates an account, verified in the browser. The frontend cannot add a format rule of its own without breaking AC7, and a rule living only in the browser would disagree with what the API accepts anyway. Second half of the same problem: `auth.service.ts` only `.trim()`s phone (it lower-cases email), so `+998901234567`, `998901234567` and `+998 90 123 45 67` create three accounts and the `@unique` constraint never fires. Both close with one schema change — trim, strip spaces/parens/dashes, then a format check — and normalising inside the schema gives every client the same behaviour. **Highest priority of these: this one is already putting unusable data in the database.**
2. **Contract error schemas for signup/login (D6)** — backend auth landed in `main` (PR #4) and the implementation does return 409 duplicate / 400 validation / 401 invalid credentials (also in Swagger). **But the contract still declares only `responses: { 200 }`** — no error schemas. The frontend maps HTTP codes to the `AuthResult` union against observed implementation behaviour (exactly what D6 prescribes), but response-body shapes are undefined anywhere. Needed before OLY-42, which is entirely about telling those cases apart. Small PR; the frontend owner can propose the shapes.
3. **`parent_contact` field** — the prototype's signup form collects it, but `contract.signup.body` does not accept it, so the frontend omits it. The column exists (`schema.prisma`) and so does the entity field (`UserSchema`); the gap is `contract.signup.body` plus `prisma.user.create` — two lines, no migration. Until then the field must stay unrendered: the controller runs `contract.signup.body.parse()` and Zod strips unknown keys, so a filled-in value would vanish with no error.
4. **No name format** (found 2026-08-08). `name: z.string().min(1)` — digits pass. Whether to forbid them is a product call; whatever the rule, it belongs in the contract and the form picks it up automatically.
5. **Password rule beyond length** (raised 2026-08-07). `password: z.string().min(8)` checks length only. Worth deciding deliberately rather than by default: a rule enforced only in the browser is not a security control (a direct `POST` bypasses the form), so the real rule has to be server-side. Note that current guidance (NIST SP 800-63B) moved away from composition requirements — mandatory digit/symbol/uppercase pushes people toward predictable shapes — and toward length plus a breached-password check. The frontend ships an advisory strength meter meanwhile (see the hardening record below); it blocks nothing and follows whatever the contract lands on.
6. **httpOnly-cookie auth (D7)** — the reopening condition has fired but nothing is built on either side; see the status check under D7 for what was verified.

### Resolved

- **Password-reset endpoint (D4)** — not being pursued for now (operator, 2026-08-07). OLY-41 is deferred, not blocked; nothing is expected from the backend.
- **`grade` collection point (D10)** — resolved as Grade 5 only (operator, 2026-08-07); `DEFAULT_GRADE = 5` is the intended behaviour while that holds.
- **Demo learning-content language (D1)** — Uzbek (operator, 2026-08-07). UI chrome stays three-locale.

## Stack confirmations

- Team lead, 2026-08-04: «simple SPA React 18 is better for now, we don't need anything from Next or React 19» — DL-16 starter stack stands.

## Post-review hardening record (2026-08-06) — visible justifications

The full decision register lives in `.vibe/work/oly-19/` (local, gitignored by design). This section keeps the justifications a PR reviewer needs **inside** the committed tree:

- **Starter scaffold routes removed** (`home`, `system-status`, S5). OLY-8's DoD evidence was «web consumes `createApiClient`» — that consumption is now load-bearing through `i18n/index.ts`, which derives the locale list from the contract's `LanguageSchema` (same api-client package). The scaffold screens were starter placeholders, not product screens; their deletion is recorded here and in the register (D2/D8/D11).
- **Path-ownership expansion beyond the plan's `owned` list**, all review-driven and listed with reasons: `eslint.config.mjs` (operator rule: machine-checkable standards live in the linter — strict block scoped to `apps/web`), `AGENTS.md` (one pointer line to `docs/code-standards.md`), `.github/workflows/quality.yml` (e2e-web job proving AC1/AC2 in CI, PR-only), `apps/web/index.html` (`lang="uz"` + favicon link), `apps/web/public/favicon.svg` (below). **OLY-40 adds one more** (operator, 2026-08-07): `eslint.config.mjs` again, this time because the boolean naming rule could not be satisfied — `naming-convention` strips the `is`/`has` prefix before checking `format`, so `isSubmitting` was judged as `Submitting`, which is never camelCase, and every correctly-prefixed boolean failed. Two workarounds for it already existed in the tree (the forms avoided destructuring `formState`; `password-strength.ts` avoided naming a boolean). Format is now `PascalCase`; the prefix requirement is untouched and a bare `submitting` still errors.
- **favicon.svg hardcoded colours — recorded exception to the tokens-only rule (D3).** A favicon renders outside the document and cannot consume CSS custom properties, so the brand stops are literals; `apps/web/test/favicon.test.ts` pins them to `brandGradFrom`/`brandGradTo`/`brandMark` so any drift breaks the build.
- **Dead `nav` i18n namespace removed** (2026-08-06): no consumers after the shell became nav-less per the design of record. OLY-40 re-adds exactly the keys it needs.
- **Landing nav on phones: login link hidden and wordmark clipped below 640px** (operator, 2026-08-07). Measured at 375px: the four controls need 366px of the 335px available, so the row wrapped, the brand dropped to its own line and the sticky header grew to 167px — a fifth of the viewport. The design of record offers nothing to copy here: its nav carries no responsive classes and no wrap, so at this width the prototype would overflow sideways rather than stack. (The rest of the landing does carry responsive intent — `sm:grid-cols-3`, `lg:grid-cols-2`, `sm:flex-row` — and all of it was ported; the nav is the one place the design is silent.) Two changes: the nav's login link is hidden — it is duplicated in the hero and `/login` is a first-class route — and the wordmark is clipped rather than removed, because the logo is `aria-hidden` and dropping the text outright would leave the home link with no accessible name (WCAG 2.4.4). Result: 167px → 76px, everything on one row, no horizontal overflow, holds down to 360px and degrades to two rows below that instead of scrolling. The auth-screens nav was measured too (297px of 335px, single row) and needs no change. Guarded by `apps/web/e2e/landing-nav.mobile.spec.ts` in a dedicated `mobile-chrome` Playwright project, because unit tests stub CSS Modules away and the desktop project never crosses the breakpoint.
- **Design deviations from the snapshot are deliberate** (D11-A2, D12-A1): 5 of 7 hero topic chips (explicit `HERO_TOPIC_IDS` list), ToggleGroup instead of Select for the switcher, 10 tokens raised to WCAG AA with a contrast test, no theme-switch animation. The full old→new token list lives in the local design snapshot README («Deviations») — the frontend owner runs the Figma sync from it.
- **`/profile` stub beyond the S6 list** (operator, 2026-08-06): the profile page exists in the design of record (avatar in the post-auth header), so its route was reserved under the same D2 routing-skeleton rule as the other stubs — constant `ROUTES.PROFILE`, shared StubLayout, i18n ×3, unit tests.
- **Advisory password strength meter on signup, beyond the OLY-40 plan** (operator, 2026-08-07). Raised while asking for a stronger password rule: the real rule belongs in the contract (follow-up 5 above), because a browser-only rule is bypassed by any direct `POST`. A meter is the part the frontend does own — it grades weak/fair/strong and **blocks nothing**; a unit test asserts a password it calls weak still signs up, so AC7 holds and `contract.signup.body` remains the only thing deciding what is accepted. Two consequences worth naming: the copy is frontend-authored in three locales, because the design snapshot has no such control (the same footing as the `stubs.*` keys — every other `auth.*` string is verbatim from the snapshot); and the bands are **provisional**, tuned to the current min(8) plus character variety, to be re-tuned in one file once follow-up 5 is answered. Its length floor is the meter's own judgement, deliberately not read from the contract: the two are independent, and the meter only ever describes strength, never claims a password is acceptable.
