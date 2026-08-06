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
| `theme.ts` | 45 semantic colour tokens × dark/light                            | OLY-39 S3 (tokens), D12              |
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

Note that `.vibe/evidence/**` is gitignored (`.gitignore:78`) — this directory
is local to the machine and is not versioned with the repo.
