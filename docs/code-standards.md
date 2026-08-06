# Code standards — working digest

**Source:** `mentor-resources/clean-code` (Check-List, React, TypeScript, CSS, Fundamentals 1–6) — the team's clean-code base. This file is the operational digest we build and review against; the full texts stay the reference. Established 2026-08-06 after the OLY-39 independent review.

## Naming

- No single-letter variables (except `i`, `j` in loops), no abbreviations outside universally known ones
- Booleans start with `is`/`has`/`should`; functions are verbs; classes/components are nouns
- Names must read without a comment

## Functions & files

- One action per function; ~20–30 lines is the norm, more needs an evident reason
- ≤3 parameters, or a params object; early return over nesting; nesting ≤3
- **Files ≤ 400 lines**
- No dead code, no commented-out code, no stale comments; comments explain _why_; TODO/FIXME carry a date

## TypeScript

- No `any` (use `unknown` + narrowing); no `{}`/`object` types; explicit return types
- `as const` objects over enums; `interface` for object shapes that may extend, `type` for unions/computed
- **No `as` to silence the compiler** — a cast must be justified in a comment
- `?.` for nullable access; `??` when `0`/`''`/`false` are meaningful

## React

- **Alias imports** (`@/…`), never `../../` climbing; grouped import order (libs → absolute → relative → styles)
- **Split big components**: a screen composing many sections is a composition root, each section its own component + own CSS Module (guide §2.4)
- Data structures get their own named interfaces — no `Omit<Step, "x">` reuse for a different concept (data clump)
- `useCallback`/`useMemo`/`memo` only with a measured or evident reason — no cargo cult
- Event handlers: `handleX` naming; forms carry `autoComplete`

## CSS (with our D3 token rule)

- **Colours come from `packages/ui` tokens only** — no literal hex/rgba in components or CSS Modules; runtime accent values (topic colours) are set inline as custom properties and derived via `color-mix()` (D12), and the palette values themselves live in `tokens.ts`
- Dynamic styling via classes, not JS; nesting ≤2; consistent units
- Component CSS Module lives next to its component

## Repo conventions we formalize (deviations from the guide's defaults)

Locked as decision D13 (2026-08-06): component files are **`folder/folder-name.tsx`** (not `index.tsx`), and components are **`export function` declarations** (not arrow consts) — matching the repo's starter layout. The guide's `index.tsx` + arrow-const style is the one we deliberately do not follow; everything else in the guide applies.

## WCAG floor

- AA 4.5:1 for text — enforced by `packages/ui/test/tokens-contrast.test.ts`
- **Label in Name (2.5.3):** accessible names must contain the visible label text
- `prefers-reduced-motion` respected for any animation
