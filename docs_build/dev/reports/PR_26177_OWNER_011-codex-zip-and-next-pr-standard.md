# PR_26177_OWNER_011-codex-zip-and-next-pr-standard

Date: 2026-06-27
Team: OWNER
Branch: PR_26177_OWNER_011-codex-zip-and-next-pr-standard

## Purpose

Add governance that every Codex execution produces reports and a repo-structured ZIP, and that completed PR ZIP review automatically drives the next logical PRs.

## Scope

Documentation and governance only.

No runtime code, UI code, API code, database code, `start_of_day` files, history snapshots, or unrelated cleanup were changed.

## Changes

- Strengthened the Codex artifact standard so every Codex execution produces required reports and a repo-structured ZIP.
- Made the ZIP/report rule apply to success, completion, partial completion, hard stop, blocked, validation failure, new information, no-change, review, and governance results.
- Removed the previous exception that allowed hard stops before outputs to skip ZIP/report delivery.
- Required Codex responses to return ZIP path, reports, changed file list, validation results, and branch/worktree/sync status when relevant.
- Added completed PR ZIP review governance:
  - review completed work
  - identify completed and remaining scope
  - update team backlog and completion percentages
  - determine the next logical PRs
  - recommend execution order
  - generate each recommended PR with summary, Codex command, commit comment, Playwright scope, and manual validation steps
- Confirmed the backlog drives next recommended PRs automatically.
- Preserved the existing SOD, active team branch, sequential workstream, EOD, Product Owner testable, and page-level Playwright workflow rules.

## Validation

- PASS: `git diff --cached --check -- . :(exclude)docs_build/dev/reports/codex_review.diff`
- PASS: documentation/governance-only changed-file check.
- PASS: ZIP-on-every-result rule exists.
- PASS: hard stops require ZIP/report output.
- PASS: `next logical PRs` plural wording exists.
- PASS: automatic next PR planning is tied to completed PR ZIP review.
- PASS: SOD starts from latest synchronized `main`.
- PASS: SOD creates or uses the active team branch.
- PASS: all commits go to the active team branch, not `main`.
- PASS: sequential PRs stay on the active team branch/workstream during the day.
- PASS: EOD returns to `main` and verifies clean sync `0 0`.
- PASS: Product Owner testable completion rule remains present.
- PASS: page-level Playwright completion gate remains present.
- PASS: no runtime files changed.

## Artifact

- `tmp/PR_26177_OWNER_011-codex-zip-and-next-pr-standard_delta.zip`

## Manual Validation Notes

Reviewers should confirm the active governance now makes ZIP/report delivery mandatory for every Codex result and makes completed PR ZIP review produce the next logical PRs without requiring the Product Owner to ask for continuation.
