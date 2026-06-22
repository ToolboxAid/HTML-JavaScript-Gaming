# Branch Context Governance

Status: Approved
Owner: OWNER

## Purpose

Require Codex and teams to confirm branch context before changing files.

## Session Start Context

At the start of work, report or validate:

- current branch
- expected branch
- current commit
- local/origin sync status
- worktree status
- active team
- active assignment

## Stop Conditions

Stop and report before changing files when:

- current branch does not match the expected branch
- local branch is behind or ahead unexpectedly
- worktree has unrelated changes
- active assignment is missing or unclear
- active team does not match the branch or OWNER instruction
- the requested work would modify files outside the approved scope

## Continuation Rule

After a branch is created, the branch remains the working context.

Do not automatically return to `main` after:

- commit
- push
- draft PR creation
- validation
- review updates
- additional commits

Return to `main` only after the PR is merged, the branch is retired, or OWNER explicitly says to return to `main`.

## GitHub Authority

GitHub is authoritative for open PR state, merged PR state, review state, and remote branch state.

Local git state must be reconciled with GitHub before making OWNER-level cleanup decisions.
