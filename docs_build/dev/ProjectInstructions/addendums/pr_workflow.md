# PR Workflow Governance

Status: Approved  
Owner: OWNER

## Purpose

Define the standard pull request workflow for Game Foundry Studio.

## Standard Flow

1. Start from main.
2. Pull latest origin/main.
3. Verify clean worktree.
4. Create a PR branch.
5. Make scoped changes only.
6. Validate the change.
7. Commit with a clear OWNER/team message.
8. Push the branch.
9. Open a draft PR.
10. Review the PR.
11. OWNER approves merge.
12. Merge to main.
13. Pull latest main before starting the next PR.

## Rules

- Direct commits to main are prohibited unless OWNER explicitly approves.
- Draft PRs are preferred until validation is complete.
- Each PR must have a clear scope.
- Do not mix unrelated scopes.
- Do not start dependent PRs until the required base PR is merged.
- Always return to main before starting the next PR.
- If validation fails, stop and report.
- If conflict occurs, stop and report.
- If OWNER decision is required, stop and report.

## Batch Governance Mode

For governance, documentation, and administrative work, use Batch Governance Mode by default.

Use stacked sequential PRs only when dependency order requires it.
