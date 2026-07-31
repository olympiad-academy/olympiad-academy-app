---
name: project
description: "Talk about your project: recall what has been established, explore and calibrate ideas, and lock updates into durable project knowledge."
disable-model-invocation: true
vibe-protocol: project-atlas
runtimeExecutionClaim: pending-live
---

# project

Talk with the operator about their project. One skill, four conversational
branches, inferred from ordinary language — the operator never selects a mode.

## What this skill owns

The durable project knowledge under `.vibe/project/` (the Project Atlas):
why the project exists, who it serves, the experiences it aims for, its areas,
principles, roadmap outcomes, insights, decisions, and language — in the
operator's own words, across hundreds of sessions.

It is NOT a task workflow. A concrete task request ("build X", "fix Y")
routes to task discovery (brainstorm / grill-me / task); this skill hands over
rather than absorbing the task.

## Branches

### Retrieval (default — read-only)

Until the operator explicitly asks to change or lock project knowledge, every
question is answered read-only:

1. Run the entry freshness check; repair derived navigation data only.
2. Read the root overview pair first; descend folder by folder, reading each
   folder's overview pair before its topics; load the smallest relevant set.
3. Answer in plain language, always distinguishing: settled (current), the
   preferred direction (likely), early ideas (exploring), retired knowledge,
   and honest unknowns. Never fill a gap from model memory.
4. Mention source locations only if the operator asks.
5. Read-only means read-only: zero canonical changes, ever.

### Steward (explore, enrich, calibrate)

When the operator wants to introduce, refine, reorganize, or retire vision:

- listen and reflect before structuring;
- connect the new statement to existing project knowledge;
- surface contradictions and relevant prior decisions with a recommendation;
- ask at most ONE question at a time, always in product language;
- vary challenge with the conversation — supportive by default;
- stage candidate changes into bounded session state ONLY. Canonical files
  stay untouched while ideas are being explored.

### Initialization (no foundation yet)

When the project knowledge is absent or only the bootstrap placeholder exists:

- inspect minimally; ask the operator to describe the project in their words;
- capture only what they said or directly entailed — a short idea stays
  sparse; never invent users, features, integrations, or a roadmap;
- record everything else as visibly unexplored coverage;
- recommend the most valuable next conversation. The project does not need to
  be documented in one session.

### Lock (the only write doorway)

Phrases like "lock it in" or "update the project" authorize a scoped update:

1. Present a concise plain-language summary: what will be added, changed,
   clarified, or retired; contradictions resolved; what stays uncertain.
2. The lock phrase approves exactly that summarized change set — the approval
   binds to its digest; if anything drifts afterwards the lock is void and a
   fresh summary is required.
3. If the update would unexpectedly reverse confirmed vision or expand scope
   beyond this conversation, ask one focused product-language question first.
4. Apply through the atomic writer: staged validation, independent fidelity
   review, one commit-or-unchanged transaction, then report the result in
   plain language. The operator never reads or edits files.

## Session durability

Long conversations checkpoint into bounded session state under
`.vibe/work/project-sessions/` before context pressure degrades quality.
Session state is never canonical truth and is excluded from retrieval; a fresh
session resumes from it explicitly.

## Recovery language

Every recoverable problem continues forward in this session (reconcile,
re-stage, re-summarize, resume). Never instruct the operator to re-run an
earlier phase or skill as recovery.
