# Branch Lock Governance

Status: Approved
Owner: OWNER

## Purpose

Keep active work attached to the correct assigned team, branch, and OWNER decision.

Canonical branch lifecycle reference: `dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`.

This file owns branch lock enforcement and OWNER override handling; it must not create a competing START / WORK / END lifecycle rule.

## Active Work Lock

- Work must occur on the active team branch.
- This rule applies to all canonical teams: Owner, Alfa, Bravo, Charlie, Delta, and Golf.
- An assigned work item keeps its owner of record until complete or OWNER reassignment.
- Work must not move to another team, branch, or PR without OWNER approval.
- A team with no active assignment, active branch, or active PR is inactive.
- A team with a previous PR that is not Closed must not begin another unrelated PR unless OWNER documented an explicit stacked/sequential workstream.
- PR Open begins only after the branch and PR identity are named.
- Plan, Build, validation, reports, ZIP packaging, and closeout stay tied to the same PR identity and source branch.
- Closed ends only after the final main-return, clean-worktree, local/origin `0/0`, no-untracked-files, required-report, required-ZIP, backlog, applicable tool-state, and branch-disposition gates pass.
- Project Instructions must not assume a permanent team roster.

## Branch Rules

- Identify the PR branching model before creating or continuing a PR branch.
- Independent PRs and new stacked workstreams start from current `main`.
- Dependent Stacked PRs may start from the documented previous PR branch only when a direct dependency and dependency order are documented in `dev/build/ProjectInstructions/addendums/pr_workflow.md`.
- OWNER PRs may start from `main` when marked Independent and no direct dependency exists.
- Non-Owner team PRs use Stacked PR workstreams by default.
- A non-Owner team PR may start from `main` only when OWNER explicitly marks the PR as `standalone/no-dependency`.
- Pull latest `origin/main` before creating an Independent PR branch or the first branch in a new stack.
- Do not create an Independent PR branch unless current branch is `main`, worktree is clean, `main...origin/main` is `0 0`, and `HEAD` SHA matches the published EOD SHA.
- HARD STOP if the current branch does not match the requested PR branching model.
- HARD STOP if a non-Owner team PR starts from `main` without OWNER `standalone/no-dependency` approval.
- Follow the canonical START / WORK / END lifecycle in `dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`.
- Keep work on the active branch until the PR is merged, the branch is retired, EOD closeout begins, or OWNER says to return to `main`.
- For OWNER-approved stacked/sequential workstreams, PR branches/commits stay on the active team branch/workstream during the day and do not return to `main` between PRs.
- Do not commit directly to `main`.
- HARD STOP before committing if current branch is `main`.
- HARD STOP if the branch changes unexpectedly during implementation.
- Commit only to the PR branch.
- Push only the PR branch.
- Do not merge stale historical branches directly unless they are current, clean, still needed, and OWNER-approved.
- Retain source branches by default after merge and closeout.
- Record branch disposition before Closed as `retained`.

## Branch Lifecycle (Canonical)

The canonical branch lifecycle lives in:

```text
dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md
```

Branch lock governance enforces ownership and branch-lock compliance with that canonical lifecycle.

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

## End Of Day Main Lock

End of Day:

```text
git checkout main
git fetch origin
git pull --ff-only origin main
git status
git rev-list --left-right --count main...origin/main
```

Required:

```text
On branch main
nothing to commit, working tree clean
0 0
```

Next Day Start:

```text
git checkout main
git fetch origin
git pull --ff-only origin main
git status
git rev-list --left-right --count main...origin/main
git rev-parse HEAD
```

The next-day `HEAD` SHA must match the published EOD SHA before any team creates a PR branch.
