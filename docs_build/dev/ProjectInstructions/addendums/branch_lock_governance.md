# Branch Lock Governance

Status: Approved
Owner: OWNER

## Purpose

Keep active work attached to the correct assigned team, branch, and OWNER decision.

## Active Work Lock

- Work must occur on the assigned team or OWNER branch.
- An assigned work item keeps its owner of record until complete or OWNER reassignment.
- Work must not move to another team, branch, or PR without OWNER approval.
- A team with no active assignment, active branch, or active PR is inactive.
- A team with a previous PR that is not Closed must not begin another PR unless OWNER documented an explicit stacked PR chain.
- PR Open begins only after the branch and PR identity are named.
- Plan, Build, validation, reports, ZIP packaging, and closeout stay tied to the same PR identity and source branch.
- Closed ends only after the final main-return, clean-worktree, local/origin `0/0`, no-untracked-files, required-report, required-ZIP, backlog, applicable tool-state, and branch-disposition gates pass.
- Project Instructions must not assume a permanent team roster.

## Branch Rules

- Start from current `main`.
- Pull latest `origin/main` before creating a work branch.
- Keep work on the active branch until the PR is merged, the branch is retired, or OWNER says to return to `main`.
- Do not commit directly to `main` unless OWNER explicitly approves.
- Do not merge stale historical branches directly unless they are current, clean, still needed, and OWNER-approved.
- Retain source branches by default after merge and closeout.
- Record branch disposition before Closed as `retained`.

## OWNER Override

OWNER may override a branch lock or team assignment.

When OWNER overrides, the PR or report must document:

- original assigned team or branch
- override decision
- reason for the override
- new assigned team or branch, if any

## Protected Instruction Boundaries

Branch lock work must not silently delete, rewrite, or weaken protected Project Instructions guidance.

Protected guidance includes:

- source-of-truth rules
- approved naming rules
- status model rules
- team assignment rules
- PR workflow rules
- Governance Phase 1 completion guidance

If protected guidance must change, OWNER approval is required.
