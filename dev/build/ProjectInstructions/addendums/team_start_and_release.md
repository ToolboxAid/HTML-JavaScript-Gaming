# Team Start And Release Governance

Status: Approved
Owner: OWNER

## Purpose

Preserve useful historical team-start and release-readiness rules in the current Governance Phase 1 model.

## Team Start Rule

OWNER identifies available teams when starting work.

Before a team starts, validate:

- canonical START phase is complete
- current branch is `main`
- worktree is clean
- `main...origin/main` is `0 0`
- `HEAD` SHA matches published EOD SHA
- active assignment is selected or confirmed by OWNER
- assigned team uses the canonical Owner plus military team-name set
- work remains with the assigned team until complete or OWNER reassignment
- the team's previous PR is Closed, unless OWNER documented an explicit stacked PR chain

Before implementation begins, ChatGPT/Codex must provide the SOD briefing defined in `dev/build/ProjectInstructions/addendums/team_backlog_sod_eod_standard.md`.

## Current Four-Team Start Set

The current active delivery teams for backlog start commands are:

- Alfa
- Bravo
- Charlie
- Delta

Each team start must confirm the selected backlog item is inside that team's ownership area.

## Current Active Ownership Start Map

OWNER override approved.

The current active ownership start map includes:

- Alfa
- Bravo
- Charlie
- Delta
- Golf
- Owner

Migration note:
Golf is the only active replacement for the retired prior lane.

Clarification:
- The four-team start set remains the backlog ownership start set for Alfa, Bravo, Charlie, and Delta.
- Golf is valid for OWNER-assigned, branch-backed, PR-backed, release, review packet, or cleanup work.
- Historical branch and PR references for retired non-canonical lanes must remain unchanged.
- Golf work must not silently take ownership from Alfa, Bravo, Charlie, or Delta; cross-team work requires OWNER approval.

## Assignment Flow

For backlog-driven work:

1. Read `dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md`.
2. Select only the OWNER-approved backlog item.
3. Use the approved status model from `status_model.md`.
4. Confirm the previous PR for the team is Closed, unless this is an explicitly documented stacked PR chain.
5. Follow the canonical START phase in `project_instructions_single_source_eod_lock.md`.
6. Create or use the approved team branch and PR identity only after START passes.
7. Mark lifecycle state as PR Open.
8. Plan on the same PR branch.
9. Build on the same PR branch.
10. Record active work in the active team registry when required.
11. Open or update a draft PR during active WORK.
12. Merge only through OWNER-approved PR workflow and canonical END.

## Team Command Examples

Use these as naming examples, not as a permanent roster:

- Start Alfa
- Start Bravo
- Start Charlie
- Start Delta
- Start Golf

## Release Readiness

A team or OWNER PR is release-ready when:

- scope matches the OWNER request
- validation passes
- no application code changed unless explicitly scoped
- no protected Project Instructions guidance was deleted
- branch context is correct
- active assignment or OWNER ownership is clear
- PR summary states the validation result
- lifecycle state is at least Validation
- required reports and repo-structured ZIP under `dev/workspace/zips/` exist before Closed
- canonical END publishes branch, HEAD SHA, and date/time when the PR merges

Closed readiness requires:
- PR merged and pushed
- current branch is `main`
- worktree clean
- local/origin sync is `0/0`
- no untracked files
- merge or final commit recorded
- branch disposition recorded as `retained`
- required reports exist
- required repo-structured ZIP under `dev/workspace/zips/` exists
- backlog updated
- tool state updated when applicable

At EOD, ChatGPT/Codex must provide the team summary defined in `dev/build/ProjectInstructions/addendums/team_backlog_sod_eod_standard.md`.

## Gate Behavior

Release readiness is a validation gate.
It does not block unrelated development unless OWNER says governance is blocking.
