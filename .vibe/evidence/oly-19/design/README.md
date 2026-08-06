# OLY-19 — design-of-record snapshot

Evidence for PRE-1 of `.vibe/work/oly-19/implementation-plan.json`, in the form
restated by **D11 Amendment 1** (2026-08-05).

## Source

Figma **Make** file `SqHXE7vPridy3ZHWtDLpQV` — «MVP Planning and Prototyping»
<https://www.figma.com/make/SqHXE7vPridy3ZHWtDLpQV/MVP-Planning-and-Prototyping>

This is a Make file, not a Figma design file. Consequences, all verified on
2026-08-05:

- `get_metadata`, `get_screenshot` and `get_variable_defs` are unsupported for
  `/make/` URLs — frame exports cannot be produced.
- The project has **no Figma Variables**. The design tokens exist only as
  `src/theme.ts` inside the Make file.
- Binary assets in the Make file are stored under Git LFS; the MCP resource read
  returns the LFS pointer, not the image bytes. The captures therefore have to
  be exported by hand (see below).

## Contents

| File       | What it is                                                        | Consumed by                          |
| ---------- | ----------------------------------------------------------------- | ------------------------------------ |
| `theme.ts` | 41 fields/mode = 39 semantic colour tokens + 2 runtime functions (`hintBg`/`hintBorder`) × dark/light (count corrected 2026-08-06; earlier said "45") | OLY-39 S3 (tokens), D12 |
| `i18n.ts`  | 150 keys × uz/ru/en — final approved copy, verified equal key sets | OLY-39 S5 (landing), OLY-40 (labels) |
| `App.tsx`  | reference implementation, 1275 lines, six screens                 | OLY-39 S3–S6, OLY-40, OLY-42         |

## Live rendering — the visual reference

**<https://cleat-boil-62436427.figma.site/>** — the Make prototype, published by
the operator on 2026-08-05. Verified reachable and fully interactive: language
switcher (uz/ru/en), theme toggle (dark/light), and navigation into the auth
screens all work.

This replaces the static frame exports D11 originally asked for, and is
strictly better than them: any screen can be rendered on demand, in either
colour mode, in any locale, at any viewport — whereas an export freezes one
combination. Visual verification of S5 compares the implementation against this
URL directly.

The `screencapture-…pdf` / `Screenshot_…png` files inside the Make file's
`src/imports/` are NOT needed and are not copied here: they are older manual
captures of the same prototype, stored under Git LFS (an MCP resource read
returns the LFS pointer, not the image bytes). They carry no information the
live URL does not.

**Fragility to note:** the published URL is a Figma-hosted deployment of a file
that can keep changing, so it is a live view, not a frozen artefact. The frozen
part of this snapshot is the source (`theme.ts` / `i18n.ts` / `App.tsx`); the
URL is how that source looks when running. If the two ever disagree, the source
in this directory is what OLY-39 was built against.

Screen offsets in `App.tsx`: logo 57, theme toggle 77, language switcher 91,
**landing 106–326**, **auth 328–474**, topics 492–613, problem 615–865,
session summary 867–956, profile 1015–1243, root 1245.

### Provenance

`App.tsx` is a byte-exact copy of the MCP resource read. `theme.ts` and
`i18n.ts` were transcribed from MCP resource reads; `i18n.ts` was checked
mechanically — 150 keys in each locale, identical key sets across uz/ru/en, no
duplicates.

## Not the design of record

`https://olympiad-academy-prototype.netlify.app` — an older wireframe prototype
(plain unstyled forms, English only, "Wireframe prototype · mock data · no
backend"). Predates the Make design and must not be used as a visual reference.
It is named in the `src/imports/` capture filenames, which is what makes it easy
to mistake for the real thing.

## What this snapshot is NOT a source of

**Validation rules.** Per D9 the only source is
`zodResolver(contract.signup.body)`. The prototype's rules are weaker and in one
case contradict the contract: `errorPassword` says «at least 4 characters»,
`contract.signup.body` requires `password: z.string().min(8)`. Error copy is
authored fresh against the real rules — the `error*` keys in `i18n.ts` are NOT
carried over. Everything else (landing, labels, screen copy) is.

**Form fields.** The prototype collects `parent_contact`, which
`contract.signup.body` does not accept (it exists only on `UserSchema`). The
field is not rendered; the gap goes to the team lead, handled exactly as D10
handles `grade`.

## Freezing

This snapshot is frozen at 2026-08-05. The Make file may keep changing; this
directory does not. If it needs to be refreshed, that is a new amendment, not an
in-place edit.

Since 2026-08-06 this directory IS committed to git (operator decision):
design snapshots are team-shared evidence, exempted from the `.vibe/evidence/**`
gitignore rule for `*/design/` paths only.

## Deviations from this snapshot in the shipped tokens (D12 Amendment 1, 2026-08-06)

The snapshot stays frozen; the shipped tokens in `packages/ui/src/tokens/tokens.ts`
deviate from it in exactly these places, all operator-approved, all enforced by
`packages/ui/test/tokens-contrast.test.ts`. **This list is the handoff for
bringing the Figma design file in sync.** Contrast ratios are WCAG relative to
the page background (semi-transparent tokens composited).

### Dark mode

| Token              | Snapshot value                       | Shipped value                        | Why (before → after)                     |
| ------------------ | ------------------------------------ | ------------------------------------ | ---------------------------------------- |
| `textFaint`        | `rgba(247,247,251,0.38)`             | `rgba(247,247,251,0.48)`             | 3.4:1 → 4.7:1 (AA)                       |
| `textSubtle`       | `rgba(247,247,251,0.50)`             | `rgba(247,247,251,0.55)`             | 5.1:1 → 5.9:1 (kept above textFaint)     |
| `langInactiveColor`| `rgba(247,247,251,0.50)`             | `rgba(247,247,251,0.55)`             | tracks textSubtle, as in the snapshot    |
| `primaryGradient`  | `#6366f1 → #a855f7`                  | `#5856e8 → #9333ea`                  | CTA label 4.2→3.7:1 → 5.1:1 both stops   |

### Light mode

| Token              | Snapshot value                       | Shipped value                        | Why (before → after)                     |
| ------------------ | ------------------------------------ | ------------------------------------ | ---------------------------------------- |
| `textFaint`        | `rgba(23,23,34,0.42)`                | `rgba(23,23,34,0.62)`                | 2.6:1 → 4.8:1 (AA)                       |
| `textSubtle`       | `rgba(23,23,34,0.52)`                | `rgba(23,23,34,0.72)`                | 3.5:1 → 6.7:1 (AA)                       |
| `textMuted`        | `rgba(23,23,34,0.68)`                | `rgba(23,23,34,0.80)`                | 5.8:1 → 8.8:1 (kept above textSubtle)    |
| `langInactiveColor`| `rgba(23,23,34,0.50)`                | `rgba(23,23,34,0.72)`                | tracks textSubtle, as in the snapshot    |
| `wrongText`        | `#b45309`                            | `#92400e`                            | 4.2:1 → 5.9:1 on `wrongBg` (AA)          |
| `correctSubText`   | `rgba(4,120,87,0.72)`                | `#065f46`                            | 2.8:1 → 6.3:1 on `correctBg` (AA)        |

### Typography

| Token                | Snapshot                          | Shipped                                                              | Why |
| -------------------- | --------------------------------- | -------------------------------------------------------------------- | --- |
| display font stack   | `'Plus Jakarta Sans', …`          | `'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', 'Nunito Variable', 'Nunito', system-ui, sans-serif` | Plus Jakarta Sans has no basic-cyrillic subset (U+0400–045F) at all; without the Nunito fallback every Russian heading/CTA renders in system-ui. Russian display text sets in Nunito (the brand body face); latin text is unchanged. |

### Behaviour notes (not design-file changes)

- The prototype's hidden scrollbars (`* { scrollbar-width: none }`) were NOT carried over.
- No theme-switch animation ships (the snapshot's equivalent CSS targeted `html` and never fired; the operator chose removal).
- `color-scheme: dark/light` is emitted per mode so native widgets match the theme.
- `hintBg`/`hintBorder` remain functions — resolved via `color-mix()` at the call site (D12), needed by the Practice screen.
