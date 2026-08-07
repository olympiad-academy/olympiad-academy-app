# Design snapshot request (SOP)

How to capture design data for a task that has no snapshot yet (e.g. a new
screen). Snapshots live **locally** under `.vibe/evidence/<work-id>/design/`
(gitignored — see `.vibe/evidence/README.md`); this document is the standard
order to give the Figma-capable agent (Claude Code + Figma MCP).

Replace the placeholders and hand this exact order to the agent:

> Capture a design snapshot for task `<OLY-NN>` into
> `.vibe/evidence/<oly-nn>/design/`, following the shape of
> `.vibe/evidence/oly-19/design/README.md`:
>
> 1. Extract DATA, not pictures: tokens (theme), copy for every locale
>    (i18n), the reference implementation of the screens related to the task
>    (note the line ranges in the README).
> 2. Write a README: source + date, a "file → what it is → who consumes it"
>    table, provenance (byte-exact copy or transcription + how it was
>    verified), and the live prototype URL if one exists.
> 3. Mandatory README sections: "What this snapshot is NOT a source of"
>    (validation comes from contracts only; fields missing from the contract
>    are flagged to the team lead) and "Freezing" (the snapshot is frozen;
>    an update is a new amendment, never an in-place edit).
> 4. Decide nothing: prototype-vs-contract mismatches are recorded as flags
>    in the README; decisions are made by the operator in the decision
>    register.

The snapshot is evidence, not a decision carrier: any design fact that
changes scope (new component, new mode, new screen) must be locked as a
decision in `.vibe/work/<work-id>/decision-register.md` by the operator
before build consumes it (as D12 and D11-A1 were for OLY-19).
