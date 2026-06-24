# Team Start And Release Governance

Status: Approved
Owner: OWNER

## Purpose

Preserve useful historical team-start and release-readiness rules in the current Governance Phase 1 model.

## Team Start Rule

OWNER identifies available teams when starting work.

Before a team starts, validate:

- current branch and expected branch are known
- worktree is clean or unrelated changes are understood
- `main` is current when a new branch is required
- active assignment is selected or confirmed by OWNER
- assigned team uses NATO phonetic naming
- work remains with the assigned team until complete or OWNER reassignment
- the team's previous PR is Closed, unless OWNER documented an explicit stacked PR chain

## Current Four-Team Start Set

The current active delivery teams for backlog start commands are:

- Team Alfa
- Team Bravo
- Team Charlie
- Team Delta

Each team start must confirm the selected backlog item is inside that team's ownership area.

## Current Active Ownership Start Map

OWNER override approved.

The current active ownership start map includes:

- Team Alfa
- Team Bravo
- Team Charlie
- Team Delta
- Team Golf
- Team OWNER

Migration note:
Team Gamma is retired. Team Golf is the replacement active ownership lane.

Clarification:
- The four-team start set remains the backlog ownership start set for Alfa, Bravo, Charlie, and Delta.
- Team Golf is valid for OWNER-assigned, branch-backed, PR-backed, release, review packet, or cleanup work.
- Historical Gamma references and branch names must remain unchanged.
- Golf work must not silently take ownership from Alfa, Bravo, Charlie, or Delta; cross-team work requires OWNER approval.

## Assignment Flow

For backlog-driven work:

1. Read `docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md`.
2. Select only the OWNER-approved backlog item.
3. Use the approved status model from `status_model.md`.
4. Confirm the previous PR for the team is Closed, unless this is an explicitly documented stacked PR chain.
5. Create or use the approved team branch and PR identity.
6. Mark lifecycle state as PR Open before BUILD_PR work begins.
7. Record active work in the active team registry when required.
8. Open or update a draft PR during active work.
9. Merge only through OWNER-approved PR workflow.

## Team Command Examples

Use these as naming examples, not as a permanent roster:

- Start Team Alfa
- Start Team Bravo
- Start Team Charlie
- Start Team Delta
- Start Team Echo
- Start Team Foxtrot

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
- required reports and repo-structured ZIP under `tmp/` exist before Closed

Closed readiness requires:
- PR merged or intentionally closed without merge with reason recorded
- current branch is `main`
- worktree clean
- local/origin sync is `0/0`
- no untracked files
- merge or final commit recorded
- branch disposition recorded as `deleted`, `retained for follow-up`, or `archived`
- required reports exist
- required repo-structured ZIP under `tmp/` exists

## Gate Behavior

Release readiness is a validation gate.
It does not block unrelated development unless OWNER says governance is blocking.
