# OLY-19: Discovery decisions — Sign Up / Login screen

**Status:** proposed for team review (operator: helgazhizhka, locked 2026-08-04)
**Scope:** OLY-19 ([3.1] Sign Up / Login screen) and its sub-issues OLY-39, OLY-40, OLY-42, OLY-41.
**Source:** full decision register with alternatives and reopening conditions lives in the local workflow memory (`.vibe/work/oly-19/`, gitignored by starter convention). This document is the team-visible summary for review and challenge.

Related ADR: [OLY-19-web-component-library-radix.md](./OLY-19-web-component-library-radix.md) (D3 in full).

## Delivery shape (D2)

OLY-19 ships as four Linear sub-issues, each its own branch + PR, strictly sequential:

| Order | Issue | Content | Target |
|---|---|---|---|
| 1 | **OLY-39** | i18n infrastructure + landing `/` + language switcher + routing skeleton (`/signup`, `/login`, `/topics` stubs) | 8 Aug |
| 2 | **OLY-40** | Signup/login forms, realtime validation, API mocks, session, redirect, back-navigation guard, logout | 8 Aug |
| 3 | **OLY-42** | Error states: duplicate account / invalid format / network failure | 8 Aug |
| 4 | **OLY-41** | Forgot password | **deferred**, blocked by contract |

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

### D11 — Landing scope: static blocks + CTA, placeholder copy
Landing `/` = static multi-block page per the Figma Make draft (several simple content blocks, no forms, CTA buttons → `/signup`, `/login`) + language switcher. Copy is placeholder in 3 locales until the design approval call; approved-design PNG exports are mandatory build-time evidence before OLY-39 visual steps. **Reopening condition:** if the approval call changes the landing concept materially, a forward-only amendment lands before OLY-39 build.

## Team-lead follow-ups (blocking nothing in OLY-39/40/42)

1. Contract error schemas for signup/login (D6)
2. Password-reset endpoint → unblocks OLY-41 (D4)
3. `grade` collection point: signup vs onboarding (D10)
4. httpOnly-cookie auth when the real backend lands (D7)

## Stack confirmations

- Team lead, 2026-08-04: «simple SPA React 18 is better for now, we don't need anything from Next or React 19» — DL-16 starter stack stands.
