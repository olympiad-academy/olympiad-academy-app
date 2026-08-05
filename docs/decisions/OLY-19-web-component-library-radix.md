# OLY-19: Web component library — Radix UI Primitives

**Status:** accepted (operator: helgazhizhka, 2026-08-04)
**Context:** OLY-19 discovery, `.vibe/work/oly-19/decision-register.md` (D3)

> **Fact correction, 2026-08-05 (operator: helgazhizhka).** The "Locked MVP
> scope" bullet under Context listed diagnostics and the topic list as in
> scope. The 4 August call deferred both past 8 August (diagnostics: "we don't
> have diagnostics right now"; the topic taxonomy was dropped and what replaces
> the entry screen is still open). This ADR was written earlier the same day,
> before that call. The decision itself is unaffected — neither diagnostics nor
> the topic taxonomy needs a component Radix lacks — but the fact it rests on
> is corrected so the scope list is not read later as something that was agreed.

## Decision

Web UI builds on **Radix UI Primitives + CSS Modules**, with design tokens from
`packages/ui/tokens` as the single source of truth (exported as CSS custom
properties). Only the primitives actually used are added as dependencies
(per-component packages). No Tailwind, no shadcn/ui, no React Aria at this step.

## Context (facts)

- Milestones: working demo 8 August 2026; full internal demo 12 September 2026
  (`.vibe/project/CONTEXT.md`).
- Locked MVP scope: auth, guided practice with 3-tier hints then the full
  walkthrough, one Ask Why per attempt, profile with statistics. No tables,
  date pickers, RTL, drag-and-drop. Diagnostics and the topic taxonomy were
  deferred past 8 August on the 4 August call.
- Ready-made Figma designs require full styling control; a foreign visual
  language (MUI/Mantine-style suites) conflicts.
- Starter architecture (DL-16): `packages/ui` holds cross-platform tokens with
  separate web/native entrypoints.
- Prior decisions: react-hook-form + zodResolver over contract schemas (D9),
  react-i18next (D1), Vite + React 18 SPA (team lead, 2026-08-04).

## Why not shadcn/ui

- shadcn/ui = Radix + Tailwind. Its components are markup built from Tailwind
  utility classes; without Tailwind they do not work, so rejecting Tailwind
  rejects shadcn.
- Tailwind was rejected: the utility approach mixes styling into JSX, reads
  worse in review, and adds a framework concept; CSS Modules gives isolation
  with plain CSS and zero new dependencies.
- The shadcn bridge stays open: since shadcn's foundation is the same Radix,
  adopting it later is a local change, not a screen rewrite.

## Why not React Aria (at this step)

- **Inventory coverage:** everything the locked MVP needs (forms, cards,
  tabs/accordion for hint tiers, dialogs, progress, language select) exists in
  Radix. React Aria's extra power — collections/tables, date pickers,
  calendars, drag-and-drop, RTL — lies entirely outside the locked scope; per
  DL-17 (anti-overdesign) no foundation is built for hypothetical features.
- **Cognitive cost:** React Aria is a "form framework" (contexts, render
  props, react-stately underneath); Radix is "HTML + behavior". With a single
  frontend owner-reviewer and the 8 August deadline, the simpler model means
  faster reviews and fewer edge-case bugs (focus, keyboard).
- **RHF integration (D9):** Radix primitives wrap native elements and work via
  `register` directly. React Aria needs a `Controller` bridge on almost every
  field — an extra layer in every form in the product.
- **i18n argument does not apply:** `@react-aria/i18n` packages are formatters
  (numbers, dates, RTL), not a translation system. Real needs (uz/ru/en
  pluralization, UI strings) are covered by react-i18next (D1) + native
  `Intl`. RTL is unneeded — all three languages are LTR.
- **Reversibility:** Radix and React Aria coexist. If a future screen
  justifies React Aria (e.g. a teacher-facing table), it can be added
  point-wise. The decision is not a lock-in.

## What Radix provides (evidence base)

- Accessibility is its core design principle: primitives implement WAI-ARIA
  Authoring Practices — keyboard navigation, focus trap/return in dialogs,
  correct ARIA attributes, dismiss layers.
- Unstyled: zero conflict with Figma; our CSS Modules; tokens from
  `packages/ui/tokens` as CSS custom properties — preserving DL-16 and future
  React Native reuse.
- Mature, industry-standard, per-component packages with a stable API.

## Boundaries

- Visual accessibility (contrast, visible focus ring) remains our CSS
  responsibility; the library does not provide it.
- Statistics charts need a separate library (e.g. Recharts) under any choice.
- Reopening condition: a future screen needs collection/date/dnd widgets that
  justify React Aria, or the team lead mandates a different base.
