# OLY-19: Discovery decisions — Sign Up / Login screen

**Status:** locked by operator 2026-08-04, last updated 2026-08-08.
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

The 8 August dates are the original milestone, kept as a record of what was planned. It passed without a demo; development continues.

## Acceptance criteria (OLY-19)

From the locked work brief, copied here so reviewers can check the work against them.

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

### D4 — Forgot password deferred

The contract has no password-reset endpoint. No «Forgot password?» affordance on the login screen, and OLY-41 is deferred — implementation comes later (operator, 2026-08-07). Nothing is expected from the backend meanwhile.

### D5 — API mocks via a seam, no MSW

A narrow `AuthApi` interface in `apps/web` with two implementations: `HttpAuthApi` (real, via `api-client`) and `MockAuthApi` (in-memory accounts; success / duplicate / invalid credentials / simulated network failure). Selected by `VITE_API_MOCK` env flag (default mock in dev and E2E). Mock fixtures are validated against contract Zod schemas in unit tests — no silent mock/contract drift.

### D6 — Error taxonomy lives on the frontend seam; contract untouched

The OLY-8 contract defines only 200 responses for signup/login, but the DoD requires distinguishing duplicate account / invalid format / network failure. Decision: a discriminated `AuthResult` union on the `AuthApi` seam (`duplicate_account` / `invalid_credentials` / `validation` / `network`). The contract is **not** modified inside a frontend ticket; contract error schemas are a **team-lead/backend follow-up**. When the backend lands, HTTP→AuthResult mapping lives in `HttpAuthApi` only.

### D7 — Token in localStorage; replace-navigation

`authSession` module (localStorage get/set/clear); `ProtectedRoutes` in `app.tsx` wired via the existing schematic markers; API client sends `Authorization: Bearer`. All post-auth navigation uses `replace: true` — browser Back never returns to auth screens (31 July call requirement).

**Extended in OLY-40 (operator, 2026-08-07) — the landing is a pre-auth screen too.** D7 sends an authenticated user forward from `/signup` and `/login`; `/` was not covered, because no working auth existed when D7 was decided. The landing's nav and hero offer exactly the two actions D7 says such a user should not be offered, and the brand link in the post-auth header points straight at it — one click from `/topics`. The index route now sits behind the same guard. Consequence, accepted deliberately: Back out of `/topics` is a no-op for an authenticated user, and the landing is unreachable while signed in. **This narrows what OLY-39 delivered**, so read AC2 («`/` … render») as holding for an unauthenticated visitor, which is the case its e2e proof exercises.

### D8 — Redirect target: stub `/topics`

OLY-19 requires redirect to Topic List, which does not exist yet. Decision: routing skeleton includes a `/topics` stub (i18n'ed, styled in the spirit of the existing Topic List Figma design). The real Topic List screen is a separate future task. Logout is in OLY-40 scope (trivial via `authSession.clear()`).

### D9 — Validation: react-hook-form + zodResolver over contract schemas

The contract Zod schema is the **only** source of validation rules (`zodResolver(contract.signup.body)`) — zero duplicated rules in the frontend. `mode: "onTouched"`, `reValidateMode: "onChange"` (realtime per the 31 July call, without scolding before first blur). Error texts via i18n keys. The identity control is a **single «phone or email» field** (per Figma): the frontend detects the kind (`@` → email, else phone) and maps into the contract's `phone`/`email` fields.

### D10 — `grade` gap flagged

**Resolved: Grade 5 only (operator, 2026-08-07).** `UserSchema` requires `grade` (5–11), the signup contract does not collect it, and auth merged with a hardcoded `DEFAULT_GRADE = 5`. That default is confirmed as intended: the pilot serves Grade 5 and nothing else — no contract change, no onboarding step, no field on the form. A working answer, valid only while that holds; reopens if scope widens past Grade 5.

### D11 — Landing scope: static blocks + CTA

Landing `/` = static multi-block page per the Figma Make draft (several simple content blocks, no forms, CTA buttons → `/signup`, `/login`) + language switcher.

**D11 Amendment 1 (2026-08-06):** the design of record is a Figma **Make** file, not a design file — so frame exports are impossible and the published prototype (<https://cleat-boil-62436427.figma.site/>) is the rendering reference. Its copy is final, not placeholder, and is used verbatim. The snapshot lives on the frontend owner's machine and is not committed (sole frontend developer + design owner).

### D12 — Two colour modes with a switcher

The design of record defines two complete colour modes and a theme toggle on every screen. Decision (2026-08-05): **ship both**, toggle next to the language switcher, choice persisted and applied before first paint, dark by default. Every OLY-39/40/42 screen is verified in both modes.

## Team-lead follow-ups (blocking nothing in OLY-39/40/42)

### Open — needs a change in `packages/contracts` / `apps/api`

1. **No phone format, and no normalisation.** `PhoneOrEmailIdentitySchema` types phone as `z.string().min(1)`, so any non-empty string without an `@` passes — `helhagsrffff` creates an account. And `auth.service.ts` only trims phone (it lower-cases email), so one number in three spellings makes three accounts and `@unique` never fires. One schema change closes both: trim, strip separators, then a format check — normalising inside the schema gives every client the same behaviour. The frontend cannot do this without breaking AC7. **Highest priority: this is already putting unusable rows in the database.**
2. **Error schemas for signup/login (D6).** The implementation returns 409 / 401 / 400, but the contract declares only `responses: { 200 }`, so no response body has a defined shape. The frontend maps status codes to its `AuthResult` union against observed behaviour, which is what D6 prescribes as the interim. Needed before OLY-42, which is entirely about telling those cases apart.
3. **`parent_contact`.** The design collects it; `contract.signup.body` and `prisma.user.create` do not have it, though the column and the entity field exist — two lines, no migration. Until then the field stays unrendered: the controller parses with the contract and Zod strips unknown keys, so a filled-in value would vanish with no error.
4. **No name format.** `name: z.string().min(1)` — digits pass. Whether to forbid them is a product call; wherever it lands, the form picks it up from the contract automatically.
5. **Password rule is length-only.** `password: z.string().min(8)`. Worth deciding deliberately: a rule enforced only in the browser is not a security control, since a direct `POST` bypasses the form. Note that current guidance (NIST SP 800-63B) moved away from composition requirements — mandatory digit/symbol/uppercase pushes people toward predictable shapes — toward length plus a breached-password check.

### Open — repo hygiene, no product decision needed

6. **`prefers-reduced-motion` misses two hover transforms.** The only animation — the tutor chat's typing dots — is already guarded (OLY-39). Unguarded: `scale(1.02)` on hover and `scale(0.98)` on press for the landing CTAs. Everything else is a colour or opacity transition, which is not motion. A bounded two-rule gap, not an unmet standard.

### Resolved

- **Password-reset endpoint (D4)** — not being pursued for now (operator, 2026-08-07). OLY-41 is deferred, not blocked; nothing is expected from the backend.
- **`grade` collection point (D10)** — resolved as Grade 5 only (operator, 2026-08-07); `DEFAULT_GRADE = 5` is the intended behaviour while that holds.
- **Demo learning-content language (D1)** — Uzbek (operator, 2026-08-07). UI chrome stays three-locale.

## Stack confirmations

- Team lead, 2026-08-04: «simple SPA React 18 is better for now, we don't need anything from Next or React 19» — DL-16 starter stack stands.

## Things in the diff the plan does not explain

- **Starter scaffold routes removed** (`home`, `system-status`). They were starter placeholders, not product screens. OLY-8's DoD evidence — «web consumes `createApiClient`» — is now carried by `i18n/index.ts`, which derives the locale list from the contract's `LanguageSchema`.
- **Advisory password strength meter on signup** (operator, 2026-08-07), beyond the OLY-40 plan. The real password rule belongs in the contract (follow-up 5); a meter is the part the frontend owns. It grades weak/fair/strong and **blocks nothing** — a unit test asserts a password it calls weak still signs up, so `contract.signup.body` remains the only thing deciding what is accepted (AC7).
