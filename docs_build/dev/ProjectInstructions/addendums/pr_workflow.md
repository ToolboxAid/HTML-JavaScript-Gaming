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
15. Pull latest main before starting the next PR.
16. Verify Main Verified and Closed gates.

## Branch Lifecycle Governance

### START RULE

- Every team starts on `main`.
- `main` must be clean.
- `main...origin/main` must be `0 0`.
- `HEAD` SHA must match published EOD SHA.
- Only then create or switch to the PR branch.
- No commits are allowed on `main`.

### WORK RULE

- Codex must remain on the PR branch during implementation.
- Codex commits only to the PR branch.
- Codex pushes only the PR branch.
- HARD STOP if branch changes unexpectedly.
- HARD STOP before committing if current branch is `main`.

### END RULE

- After PR validation, push the PR branch.
- Merge PR into `main` only when approved.
- Checkout `main`.
- Run `git fetch origin`.
- Run `git pull --ff-only origin main`.
- Confirm current branch is `main`.
- Confirm worktree is clean.
- Confirm `main...origin/main` is `0 0`.
- Record `HEAD` SHA as new EOD baseline.

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
- Always return to main before starting the next PR.
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
