# PR_26175_OWNER_053 - Alfa Stack Resolution Plan

Date: 2026-06-24
Branch: PR_26175_OWNER_053-alfa-stack-resolution-plan
Scope: Report-only Alfa PR stack resolution plan

## Executive Summary

GitHub is authoritative for this review. PRs #96 through #118 are open draft Alfa PRs. GitHub reports each as `CLEAN` / `MERGEABLE` against its current base branch, but the PRs are stacked on non-main bases. None of #96 through #118 should be treated as independently merge-safe to `main` in its current PR configuration.

The stack should be resolved as ordered batches. PR #95, the ALFA_001 base, is already merged. PR #96 can become the first mainline merge candidate only after retargeting or rebasing onto current `main`, followed by validation. PRs #97 through #116 should then be processed in strict chain order, with validation checkpoints at batch boundaries.

PR #118 does not supersede the runtime portions of the stack. It is final closeout evidence. It can supersede portions of the closeout reporting from #117, but it does not replace Game Hub, Game Journey, Idea Board, tests, CSS, or metadata changes from #96 through #116.

PR #117 should remain archive-only and should not be merged as runtime work. It can be closed as superseded by #118 after OWNER accepts #118 as the final closeout evidence.

No PRs were merged. No PRs were closed. No branches were deleted. No runtime code was modified.

## Alfa Dependency Chain Diagram

```text
#95 ALFA_001 idea-board-create-project-api-contract
  status: merged to main
  |
  v
#96 ALFA_002 game-hub-project-intake-display
  |
  v
#97 ALFA_003 game-hub-journey-bootstrap
  |
  v
#98 ALFA_004 game-hub-progress-count-model
  |
  v
#99 ALFA_005 idea-project-validation-polish
  |
  v
#100 ALFA_006 game-hub-empty-and-error-states
  |
  v
#101 ALFA_007 game-journey-count-ui-polish
  |
  v
#102 ALFA_008 alpha-stack-final-validation
  |
  v
#103 ALFA_009 game-hub-parent-child-table-layout
  |
  v
#104 ALFA_010 game-hub-source-idea-child-table-polish
  |
  v
#105 ALFA_011 game-hub-readiness-output-child-table
  |
  v
#106 ALFA_012 game-hub-parent-child-final-validation
  |
  v
#107 ALFA_013 game-hub-game-row-child-rows
  |
  v
#108 ALFA_014 game-hub-parent-columns-center
  |
  v
#109 ALFA_015 game-hub-actions-and-setup-cleanup
  |
  v
#110 ALFA_016 game-hub-row-edit-add-selected-state
  |
  v
#111 ALFA_017 game-hub-guest-save-and-crew-cleanup
  |
  v
#112 ALFA_018 game-selection-button-state
  |
  v
#113 ALFA_019 game-hub-selected-button-and-crew-label
  |
  v
#114 ALFA_020 game-hub-idea-board-cleanup
  |
  v
#115 ALFA_021 idea-board-status-filter-table-polish
  |
  v
#116 ALFA_022 idea-board-status-dropdown-fix
  |
  v
#117 ALFA_EOD workstream-closeout
  |
  v
#118 ALFA_EOD final-closeout
```

## PR Inventory

Age is calendar-day age as of 2026-06-24 using GitHub creation dates.

| PR | Title | Created | Days Old | Chain Position | Runtime Impact | Status |
| --- | --- | --- | ---: | --- | --- | --- |
| #96 | PR_26174_ALFA_002-game-hub-project-intake-display | 2026-06-22 | 2 | ALFA_002, depends on merged #95 branch/base | Test/report impact only in PR diff; no direct runtime file in GitHub changed file list. | Dependency required |
| #97 | PR_26174_ALFA_003-game-hub-journey-bootstrap | 2026-06-22 | 2 | ALFA_003, depends on #96 | Dev-runtime API/persistence bootstrap via mock DB store, Game Journey mock repository, and local API router. | Dependency required |
| #98 | PR_26174_ALFA_004-game-hub-progress-count-model | 2026-06-22 | 2 | ALFA_004, depends on #97 | Game Journey mock repository count model plus Playwright coverage. | Dependency required |
| #99 | PR_26174_ALFA_005-idea-project-validation-polish | 2026-06-22 | 2 | ALFA_005, depends on #98 | Test/report impact only in PR diff; validates Idea Board project flow. | Dependency required |
| #100 | PR_26174_ALFA_006-game-hub-empty-and-error-states | 2026-06-22 | 2 | ALFA_006, depends on #99 | Game Hub UI empty/error state behavior and Playwright coverage. | Dependency required |
| #101 | PR_26174_ALFA_007-game-journey-count-ui-polish | 2026-06-22 | 2 | ALFA_007, depends on #100 | Game Journey UI count display polish and Playwright coverage. | Dependency required |
| #102 | PR_26174_ALFA_008-alpha-stack-final-validation | 2026-06-22 | 2 | ALFA_008, depends on #101 | Validation/report-only checkpoint for the first Alfa stack segment. | Dependency required |
| #103 | PR_26174_ALFA_009-game-hub-parent-child-table-layout | 2026-06-22 | 2 | ALFA_009, depends on #102 | Game Hub UI parent/child table layout and Playwright coverage. | Dependency required |
| #104 | PR_26174_ALFA_010-game-hub-source-idea-child-table-polish | 2026-06-22 | 2 | ALFA_010, depends on #103 | Game Hub source idea child-table polish plus Idea Board validation coverage. | Dependency required |
| #105 | PR_26174_ALFA_011-game-hub-readiness-output-child-table | 2026-06-22 | 2 | ALFA_011, depends on #104 | Game Hub readiness/output child-table behavior and Playwright coverage. | Dependency required |
| #106 | PR_26174_ALFA_012-game-hub-parent-child-final-validation | 2026-06-22 | 2 | ALFA_012, depends on #105 | Validation/report checkpoint plus Game Hub Playwright coverage. | Dependency required |
| #107 | PR_26174_ALFA_013-game-hub-game-row-child-rows | 2026-06-22 | 2 | ALFA_013, depends on #106 | Game Hub row child rows, Game Hub HTML, table-first UI guidance, and tests. | Dependency required |
| #108 | PR_26174_ALFA_014-game-hub-parent-columns-center | 2026-06-22 | 2 | ALFA_014, depends on #107 | Game Hub table layout/centering across JS, HTML, and tests. | Dependency required |
| #109 | PR_26174_ALFA_015-game-hub-actions-and-setup-cleanup | 2026-06-23 | 1 | ALFA_015, depends on #108 | Game Hub actions/setup UI cleanup plus Theme V2 table CSS and tests. | Dependency required |
| #110 | PR_26174_ALFA_016-game-hub-row-edit-add-selected-state | 2026-06-23 | 1 | ALFA_016, depends on #109 | Game Hub row edit/add selected state plus Theme V2 table CSS and tests. | Dependency required |
| #111 | PR_26174_ALFA_017-game-hub-guest-save-and-crew-cleanup | 2026-06-23 | 1 | ALFA_017, depends on #110 | Game Hub guest save and crew cleanup in JS/HTML plus tests. | Dependency required |
| #112 | PR_26174_ALFA_018-game-selection-button-state | 2026-06-23 | 1 | ALFA_018, depends on #111 | Game selection button state in Game Hub plus Theme V2 table CSS and tests. | Dependency required |
| #113 | PR_26174_ALFA_019-game-hub-selected-button-and-crew-label | 2026-06-23 | 1 | ALFA_019, depends on #112 | Game Hub selected button and crew label behavior plus Theme V2 table CSS and tests. | Dependency required |
| #114 | PR_26174_ALFA_020-game-hub-idea-board-cleanup | 2026-06-23 | 1 | ALFA_020, depends on #113 | Game Hub, Idea Board, metadata inventory, Build Path status, and route/test cleanup. | Dependency required |
| #115 | PR_26174_ALFA_021-idea-board-status-filter-table-polish | 2026-06-23 | 1 | ALFA_021, depends on #114 | Idea Board status filter/table polish plus Theme V2 table CSS and tests. | Dependency required |
| #116 | PR_26174_ALFA_022-idea-board-status-dropdown-fix | 2026-06-23 | 1 | ALFA_022, depends on #115 | Idea Board status dropdown fix and validation coverage. | Dependency required |
| #117 | PR_26174_ALFA_EOD-workstream-closeout | 2026-06-23 | 1 | EOD closeout, depends on #116 | Report-only closeout evidence; no runtime files. | Close as superseded |
| #118 | PR_26174_ALFA_EOD-final-closeout | 2026-06-23 | 1 | Final EOD closeout, depends on #117 | Report-only final closeout evidence; no runtime files. | Hold |

## Merge Candidates

No PR in #96 through #118 is merge-safe independently in its current GitHub configuration because every PR targets a non-main base branch.

Conditional merge candidates after dependency handling:
- #96 through #102: foundation and first validation batch. #96 can start after retargeting/rebasing onto current `main` because #95 is already merged.
- #103 through #106: Game Hub parent/child table batch.
- #107 through #114: Game Hub child-row, table layout, actions, selected state, crew label, Idea Board cleanup, and metadata batch.
- #115 through #116: Idea Board status filter/dropdown batch.

Each batch should preserve internal PR order. Within a batch, merge sequentially and run a validation checkpoint after the batch lands on `main`.

## Superseded Candidates

#117 is the superseded candidate.

Reason:
- #117 is report-only EOD workstream closeout evidence.
- #118 is the later final closeout evidence.
- #118 can supersede the reporting purpose of #117, but it does not supersede runtime or test changes from #96 through #116.

Recommendation:
- Keep #117 as archive-only evidence in GitHub history.
- Close #117 as superseded after OWNER confirms #118 is the accepted final closeout record.

## Hold Candidates

#118 should be held.

Reason:
- #118 is final closeout evidence, not runtime implementation.
- It depends on #117, which should remain archive-only and is not recommended for merge.
- #118 is useful for owner review and audit context, but should not be merged before the runtime stack decision is complete.

Recommendation:
- Hold #118 until #96 through #116 have been resolved.
- After runtime stack resolution, either recreate final closeout evidence from current `main` or close #118 as historical closeout evidence.

## Final Recommended Merge Order

1. Confirm #95 remains merged to `main`.
2. Retarget or rebase #96 onto current `main`; validate; merge #96 if clean.
3. Process Batch 1 in order: #97, #98, #99, #100, #101, #102.
4. Run a validation checkpoint for Game Hub intake, Game Journey bootstrap/count model, Idea Board validation, and first-stack reports.
5. Process Batch 2 in order: #103, #104, #105, #106.
6. Run a validation checkpoint for Game Hub parent/child table behavior.
7. Process Batch 3 in order: #107, #108, #109, #110, #111, #112, #113, #114.
8. Run a validation checkpoint for Game Hub child rows, table layout, action cleanup, selected-state behavior, crew labels, Idea Board cleanup, and route coverage.
9. Process Batch 4 in order: #115, #116.
10. Run a validation checkpoint for Idea Board status filter/dropdown behavior.
11. Do not merge #117; keep it archive-only and close as superseded after OWNER approval.
12. Hold #118 until the runtime stack has landed or been rejected; then recreate or close final closeout evidence based on current `main`.

## Required Decisions

| Decision | Result |
| --- | --- |
| Does #118 supersede portions of the stack? | Yes, but only report/closeout portions. It does not supersede runtime implementation PRs #96 through #116. |
| Should #117 remain archive-only? | Yes. Treat #117 as archive-only closeout evidence and close as superseded after OWNER approval. |
| Are any PRs merge-safe independently? | No. All #96 through #118 PRs currently target non-main base branches. |
| Should the stack merge as grouped batches? | Yes. Use ordered batches with strict internal order and validation checkpoints after each batch. |

## Validation Lane Report

Commands used:
- `git branch --show-current`
- `git status --short`
- `git rev-list --left-right --count main...origin/main`
- `git pull --ff-only`
- `gh pr view 95 --repo ToolboxAid/HTML-JavaScript-Gaming --json ...`
- `gh pr view 96..118 --repo ToolboxAid/HTML-JavaScript-Gaming --json ...`
- `git diff --check`
- `git diff --cached --check`
- `tar -tf tmp/PR_26175_OWNER_053-alfa-stack-resolution-plan_delta.zip`

Validation result:
- PASS: Started from clean, synchronized `main`.
- PASS: Read all Project Instructions.
- PASS: Used GitHub PR metadata for all reviewed Alfa PRs.
- PASS: Produced report-only artifacts.
- PASS: No runtime code changed.

## Manual Validation Notes

- GitHub reports #96 through #118 as open draft PRs.
- GitHub reports #96 through #118 as `CLEAN` / `MERGEABLE` against their current branch bases.
- The current branch bases are stacked branches, not `main`.
- #95 is already merged and is the upstream base before #96.
- No PR merge, PR closure, or branch deletion was performed by this report.
