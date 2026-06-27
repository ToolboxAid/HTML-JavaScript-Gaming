# PR Workflow Governance

Status: Approved  
Owner: OWNER

## Purpose

Define the standard pull request workflow for Game Foundry Studio.

## Standard Flow

1. Start from main.
2. Pull latest origin/main.
3. Verify clean worktree.
4. Create a PR branch and PR identity.
5. Mark lifecycle state as PR Open.
6. Plan on the same PR branch.
7. Build on the same PR branch.
8. Validate the change.
9. Commit with a clear OWNER/team message.
10. Push the branch.
11. Open or update the draft PR.
12. Review the PR.
13. OWNER approves merge.
14. Merge to main.
15. Pull latest main before starting the next unrelated workstream, or before a new PR when the work is not an OWNER-approved stacked/sequential workstream.
16. Verify Main Verified and Closed gates.

## Daily Branch Workflow

Team-neutral daily workflow:

- SOD starts from the latest synchronized `main`.
- SOD creates or updates one active team branch/workstream.
- Work must be committed only to the active team branch.
- PR branches/commits stay on the active team branch/workstream during the day when OWNER assigned a stacked or sequential workstream.
- Do not return to `main` between stacked/sequential PRs in the same active workstream.
- `main` is only the SOD baseline and the EOD return target, unless OWNER explicitly approves an intermediate merge checkpoint.
- EOD merges or closes OWNER-approved work, pushes, returns to `main`, and verifies:
  - current branch is `main`
  - worktree clean
  - local/origin sync is `0 0`
- This rule applies to all teams: OWNER, Team Alfa, Team Bravo, Team Charlie, Team Delta, and any future team.

This section supersedes older active wording that implies returning to `main` between every PR inside an OWNER-approved stacked/sequential workstream.

## Branch Lifecycle (Canonical)

Every PR follows exactly three phases:

```text
START
WORK
END
```

The canonical START, WORK, END, Daily Synchronization, and Mandatory Hard Stops rules live in:

`docs_build/dev/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md`

PR workflow must follow that lifecycle exactly.

Summary:
- START happens on synchronized `main` only and creates the PR branch only after all required gates pass.
- WORK happens only on the PR branch.
- END validates, commits, pushes, opens/updates the PR, merges, returns to synchronized `main`, publishes branch, HEAD SHA, and date/time, then stops all work.
- No commits on `main`.
- No implementation on `main`.
- No validation on `main` except start validation.
- Never checkout `main` during WORK.
- STOP before commit if current branch is `main`.
- STOP if current branch changes unexpectedly.
- STOP if attempting to push `main`.

## PR Lifecycle States

Required state order:

1. PR Open
2. Plan
3. Build
4. Validation
5. Approved
6. Merged
7. Main Verified
8. Closed

Definitions:
- PR Open is the first active lifecycle state.
- PR Open means the tracked PR identity and source branch are created and named before Plan begins.
- Plan happens after PR Open on the same PR branch.
- No BUILD_PR may proceed without a PR name and active branch/PR identity unless explicitly marked `PLAN_ONLY`.
- Build means scoped work is in progress on the same PR branch and PR identity.
- Validation means requested checks, required reports, manual validation notes, and ZIP packaging are underway.
- Approved means OWNER or required reviewer approval exists for merge.
- Merged means the PR merged and changes were pushed.
- Main Verified means current branch is `main`, `main` includes the merge or final commit, worktree is clean, local/origin sync is `0/0`, and no untracked files remain.
- Closed is valid only after every Closed gate passes.

Closed gates:
- PR merged and changes pushed.
- Current branch is `main`.
- `main` includes the merge commit or recorded final commit.
- Worktree clean.
- Local/origin sync is `0/0`.
- No untracked files.
- Branch disposition is recorded as `retained`.
- Required reports exist.
- Required repo-structured ZIP under `tmp/` exists.
- Backlog is updated.
- Tool state is updated when applicable.

## Rules

- Direct commits to main are prohibited unless OWNER explicitly approves.
- Draft PRs are preferred until validation is complete.
- Each PR must have a clear scope.
- Plan, Build, validation, reports, ZIP packaging, and closeout must stay tied to the same PR identity and source branch.
- Source branches are retained by default after merge and closeout.
- Do not mix unrelated scopes.
- Do not start dependent PRs until the required base PR is merged.
- Return to `main` before starting an unrelated PR or new workstream.
- Do not return to `main` between PRs in the same OWNER-approved stacked/sequential workstream unless OWNER approves an EOD or intermediate merge checkpoint.
- A team must not begin another PR if its previous PR is not Closed.
- Exception is allowed only for explicitly documented stacked PR chains.
- If validation fails, stop and report.
- If conflict occurs, stop and report.
- If OWNER decision is required, stop and report.
- Every completed Codex PR run must produce a repo-structured ZIP under `tmp/`.
- The ZIP rule applies to implementation, audit, report-only, validation-only, governance, and cleanup PRs.
- The ZIP must include all changed or preserved repo files from the run and must not replace required reports under `docs_build/dev/reports/`.
- If no repo files changed, Codex must still create a ZIP containing the PR report that proves the no-change result, unless the run hard-stopped before producing outputs.

## Batch Governance Mode

For governance, documentation, and administrative work, use Batch Governance Mode by default.

Use stacked sequential PRs only when dependency order requires it.

## Tool MVP Stacked PRs

Tool MVP work must follow:

`docs_build/dev/ProjectInstructions/addendums/tool_mvp_stacked_pr_standard.md`

For tool MVPs, use one large Codex command, multiple focused stacked PRs, and one testable Creator outcome per PR.

Do not create one giant PR.

Do not stop after every small PR unless blocked by branch state, failed validation, missing source files, Project Instructions conflict, or an unresolved dependency from a prior PR.

Each tool MVP PR plan or template must include:
- Creator-testable outcome
- What Playwright tests
- What Mr. Q should manually test
- Whether the PR is part of a stacked MVP sequence
- Previous PR dependency
- Next PR dependency

Visible acceptance must be Creator-facing first. Architecture can be handled under the covers, but the PR purpose must be user-testable.

## Product Owner Testable Definition

A request to complete a page, tool, or testable MVP means Product Owner testable.

Not acceptable as a completed/testable page or tool:

- shell-only page
- `Not implemented yet`
- placeholder-only workspace, inspector, or output sections
- planned-only tile
- template-only page
- route that loads but cannot be used

Required for Product Owner testable completion:

- visible working controls
- API-backed data where required
- validation and error states
- empty states
- save/load behavior where applicable
- manual validation steps for Product Owner
- targeted Playwright coverage where impacted.

## OWNER Shortcut: PRs

Keyword:
PRs

Meaning:
Generate the complete stacked sequential Codex PR chain required to finish the current workstream.

Applies to:
- OWNER
- Team Alfa
- Team Bravo
- Team Charlie
- Team Delta
- Team Golf
- Any future NATO-named team

Behavior:
- Determine completed work.
- Determine open work.
- Determine remaining work.
- Batch related work where practical.
- Generate the complete PR chain.
- Include start gates.
- Include validation.
- Include commit messages.
- Include PR names.
- Include merge dependencies.

Default assumptions:
- Batch Governance Mode
- Throughput-first execution
- Minimal conversational checkpoints

Stop only for:
- Start gate failure
- Merge conflict
- Validation failure
- OWNER decision

## EOD Main Lock

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

## Next Day Start

```text
git checkout main
git fetch origin
git pull --ff-only origin main
git status
git rev-list --left-right --count main...origin/main
git rev-parse HEAD
```

No team creates a PR branch until:
- Current branch: `main`
- Worktree: clean
- `main...origin/main`: `0 0`
- `HEAD` SHA matches published EOD SHA
