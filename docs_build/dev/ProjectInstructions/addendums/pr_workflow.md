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
