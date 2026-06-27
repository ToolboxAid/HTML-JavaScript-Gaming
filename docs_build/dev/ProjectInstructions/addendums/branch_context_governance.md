# Branch Context Governance

Status: Approved
Owner: OWNER

## Purpose

Require Codex and teams to confirm branch context before changing files.

Canonical branch lifecycle reference: `docs_build/dev/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`.

This file owns branch context confirmation and stop conditions; it must not create a competing START / WORK / END lifecycle rule.

## Session Start Context

At the start of work, report or validate:

- current branch
- expected branch
- current commit
- local/origin sync status
- worktree status
- active team
- active assignment
- active PR number/name or explicit `PLAN_ONLY`
- previous PR Closed status unless this is an explicitly documented stacked PR chain

Session start must follow the canonical START phase in `docs_build/dev/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`.

## Stop Conditions

Stop and report before changing files when:

- current branch does not match the expected branch
- local branch is behind or ahead unexpectedly
- worktree has unrelated changes
- active assignment is missing or unclear
- active team does not match the branch or OWNER instruction
- BUILD_PR work has no PR name and active branch/PR identity, unless explicitly marked `PLAN_ONLY`
- the team's previous PR is not Closed and no stacked PR chain is documented
- the requested work would modify files outside the approved scope

## Continuation Rule

After a branch is created, the branch remains the working context.

This is the canonical WORK phase: remain on the PR branch, never checkout `main`, commit only on the PR branch, push only the PR branch, validate from the PR branch, and open/update the PR from the PR branch.

Do not automatically return to `main` after:

- commit
- push
- draft PR creation
- validation
- review updates
- additional commits

Return to `main` only in the canonical END phase after the PR is merged, the branch is retired, or OWNER explicitly says to return to `main`.

Returning to `main` is required before Closed can be recorded.

Closed branch context requires:
- current branch is `main`
- `main` includes the merge commit or recorded final commit
- worktree clean
- local/origin sync is `0/0`
- no untracked files
- source branch disposition recorded as `retained`
- branch, HEAD SHA, and date/time recorded as the new EOD baseline when this is EOD closeout

## GitHub Authority

GitHub is authoritative for open PR state, merged PR state, review state, and remote branch state.

Local git state must be reconciled with GitHub before making OWNER-level cleanup decisions.
