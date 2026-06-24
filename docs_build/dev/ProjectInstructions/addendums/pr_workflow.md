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
6. Make scoped changes only.
7. Validate the change.
8. Commit with a clear OWNER/team message.
9. Push the branch.
10. Open or update the draft PR.
11. Review the PR.
12. OWNER approves merge or intentional close without merge.
13. Merge to main or record the approved no-merge close reason.
14. Pull latest main before starting the next PR.
15. Verify Main Verified and Closed gates.

## PR Lifecycle States

Required state order:

1. PR Open
2. Building
3. Validation
4. Approved
5. Merged
6. Main Verified
7. Closed

Definitions:
- PR Open is the first active lifecycle state.
- PR Open means the branch and PR identity are created and named before implementation begins.
- No BUILD_PR may proceed without a PR name and active branch/PR identity unless explicitly marked `PLAN_ONLY`.
- Building means scoped work is in progress.
- Validation means requested checks, required reports, manual validation notes, and ZIP packaging are underway.
- Approved means OWNER or required reviewer approval exists for merge or intentional close without merge.
- Merged means the PR merged, or the approved no-merge close reason is recorded.
- Main Verified means current branch is `main`, `main` includes the merge or final commit, worktree is clean, local/origin sync is `0/0`, and no untracked files remain.
- Closed is valid only after every Closed gate passes.

Closed gates:
- PR merged or intentionally closed without merge with reason recorded.
- Changes pushed.
- Current branch is `main`.
- `main` includes the merge commit or recorded final commit.
- Worktree clean.
- Local/origin sync is `0/0`.
- No untracked files.
- Branch disposition is recorded as `deleted`, `retained for follow-up`, or `archived`.
- Required reports exist.
- Required repo-structured ZIP under `tmp/` exists.

## Rules

- Direct commits to main are prohibited unless OWNER explicitly approves.
- Draft PRs are preferred until validation is complete.
- Each PR must have a clear scope.
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
