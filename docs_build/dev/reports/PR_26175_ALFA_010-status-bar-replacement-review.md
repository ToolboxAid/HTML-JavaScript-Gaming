# PR_26175_ALFA_010-status-bar-replacement-review

## Purpose

Determine whether GitHub PR #133 fully supersedes GitHub PR #120 for the shared toolbox selected-game status bar.

This PR is report-only. It does not merge PRs, close PRs, delete branches, or modify runtime code.

## GitHub Authority Snapshot

| PR | Title | State | Draft | Mergeable | Base | Head |
| --- | --- | --- | --- | --- | --- | --- |
| #120 | `[codex] PR_26175_ALFA_003 toolbox status bar single row polish` | open | yes | no | `main` at `6d94477bb0ae9f63dd1466dbb89e4a437b8749b0` | `codex/pr-26175-alfa-003-toolbox-status-bar-single-row-polish` at `8a4ab291b9b948e3fe93a4359376bab7f1886dea` |
| #133 | `PR_26175_ALFA_009-status-bar-single-row-rebuild` | open | yes | yes | `main` at `5415f6675d7a0f10931b83368948a83df98d8021` | `codex/pr-26175-alfa-009-status-bar-single-row-rebuild` at `025aac91acb67565ae92de8fad4def6135ce85b5` |

## Executive Answer

Recommendation: **Close #120 and merge #133**.

#133 should replace #120. It carries the same intended creator-facing status bar behavior from #120, rebuilds it on current `main`, and is mergeable while #120 is stale and not mergeable. No creator-visible behavior appears lost.

Nuance: #133 does not preserve #120's exact fullscreen reserve implementation or exact reserve-equality Playwright assertion. #120 used `margin-block-end: var(--toolbox-status-bar-height)` on `.tool-center-panel` and asserted that reserve equaled the status bar height. #133 instead reserves space through fullscreen workspace and column sizing, including the platform-banner top reserve, and validates the observable behavior that the center panel stops above the fixed status bar. This is an implementation and validation-shape change, not a visible behavior loss.

## 1. Files Changed Comparison

| File | PR #120 | PR #133 | Comparison |
| --- | --- | --- | --- |
| `assets/theme-v2/js/toolbox-status-bar.js` | Changed | Changed | Same behavior: removes visible labels, purpose text, context pill, and action link; leaves selected-game name and status message; keeps non-visible `data-toolbox-status-context-kind`. |
| `assets/theme-v2/css/status.css` | Changed | Changed | Same visible status bar behavior. Difference: #133 replaces #120's center-panel margin reserve with workspace/column height reserves and includes top-reserve handling on columns. |
| `assets/theme-v2/css/layout.css` | Changed | Changed | Same change: shared footer top padding becomes `0px` while bottom padding remains. |
| `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs` | Changed | Changed | Same core coverage for removed labels, no purpose/action/context pill, same-row layout, footer spacing, fullscreen anchoring, Game Hub ownership, missing-game prompt, and Idea Board exclusion. Difference: #120 asserts exact center-panel reserve equals status bar height; #133 asserts the panel bottom is above the status bar. |

Full changed-file set:

| Category | PR #120 | PR #133 |
| --- | --- | --- |
| Runtime/shared UI files | `assets/theme-v2/css/layout.css`, `assets/theme-v2/css/status.css`, `assets/theme-v2/js/toolbox-status-bar.js` | Same three files |
| Test files | `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs` | Same file |
| Build/report files | `docs_build/dev/BUILD_PR.md`, ALFA_003 reports, `codex_changed_files.txt`, `codex_review.diff` | `docs_build/dev/BUILD_PR.md`, ALFA_009 reports, `codex_changed_files.txt`, `codex_review.diff` |

## 2. Feature Comparison

| Feature | PR #120 | PR #133 | Superseded by #133? |
| --- | --- | --- | --- |
| Single visible status bar row | Yes | Yes | PASS |
| Selected game name on left | Yes | Yes | PASS |
| Status message centered | Yes | Yes | PASS |
| Remove visible selected-game labels | Yes | Yes | PASS |
| Remove selected-game purpose from visible bar | Yes | Yes | PASS |
| Remove visible status category pill labels | Yes | Yes | PASS |
| Remove status action link | Yes | Yes | PASS |
| Preserve non-visible context classification data | Yes | Yes | PASS |
| Preserve Game Hub selected-game ownership | Yes | Yes | PASS |
| Preserve Idea Board selected-game filtering exclusion | Yes | Yes | PASS |
| Remove footer/status extra spacing | Yes | Yes | PASS |
| Preserve fullscreen bottom anchoring | Yes | Yes | PASS |
| Prevent center content from being hidden behind fixed status bar | Yes | Yes | PASS |
| Account for platform banner in fullscreen sizing | Partial: workspace top reserve exists, but column sizing does not subtract top reserve | Yes: workspace and column sizing subtract top reserve | PASS, #133 improves this area |

## 3. Validation Comparison

| Validation | PR #120 | PR #133 | Comparison |
| --- | --- | --- | --- |
| Targeted Playwright | PASS: `npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --workers=1`, 6 passed | PASS: same command, 6 passed | Equivalent pass result |
| Inline style/style block scan | PASS: `rg -n "<style|style=" ...`, no matches | PASS: `rg -n "<[s]tyle|[s]tyle=" ...`, no matches | Equivalent intent; #133 uses escaped pattern to avoid matching the command text itself |
| Diff whitespace check | PASS: `git diff --cached --check` | PASS: `git diff --cached --check` | Equivalent |
| Fullscreen reserve assertion | Asserts fixed bar bottom gap, center panel above bar, and exact bottom reserve equals status bar height | Asserts fixed bar bottom gap and center panel above bar | #133 loses the exact reserve-equality assertion, but keeps the user-visible non-overlap assertion |
| Mergeability | Not mergeable | Mergeable | #133 is safer to advance |

## 4. Missing Behavior Analysis

No required creator-facing behavior from #120 appears missing in #133.

The only behavior-adjacent difference is fullscreen reserve implementation:

- #120 adds `margin-block-end: var(--toolbox-status-bar-height)` to `.tool-center-panel` and tests that the bottom reserve equals the status bar height.
- #133 removes that exact margin approach and instead constrains `.tool-workspace` and `.tool-column` heights by the status bar and platform-banner reserves, while keeping `scroll-padding-block-end`.
- #133's targeted test verifies the practical behavior: the center panel bottom is above the fixed status bar.

Conclusion: #133 keeps the intended runtime outcome and improves current-main compatibility. Nothing material was lost for creators. The only loss is a stricter implementation-specific test assertion from #120.

## 5. Regression Risk Analysis

| Risk | PR #120 | PR #133 | Assessment |
| --- | --- | --- | --- |
| Stale base conflicts | High | Low | #120 is not mergeable and was based on old `main`; #133 is based on current `main` and mergeable. |
| Duplicate application of same status bar changes | High if both merge | Low if #120 closes | Merging #120 first would reintroduce stale branch conflict/reconciliation risk. |
| Fullscreen layout overlap | Mitigated by explicit margin reserve and exact test | Mitigated by workspace/column sizing and non-overlap test | #133 has the better current-main shape because it includes platform-banner reserve in column sizing. |
| Test coverage regression | Lower for exact reserve-equality check | Slightly higher for implementation-specific reserve equality | Not blocker because #133 still tests observable non-overlap. |
| Runtime behavior change outside status bar | None indicated in target files | None indicated in target files | Both are scoped to shared UI/CSS/test behavior. |

## Required Answers

| Question | Answer |
| --- | --- |
| Does #133 contain all behavior from #120? | Yes for creator-visible and functional behavior. #133 is not a byte-for-byte replacement of #120's fullscreen reserve implementation, but it preserves the intended non-overlap behavior. |
| Was anything lost? | No material runtime behavior appears lost. The exact #120 Playwright assertion that the center-panel bottom reserve equals the status bar height was not carried forward. |
| Should #120 merge first? | No. #120 is stale, not mergeable, and would add conflict/reconciliation risk. |
| Should #120 close as superseded? | Yes, after explicit OWNER approval to close the PR. |
| Should #133 replace #120? | Yes. #133 should be the replacement PR for this status bar work. |

## Recommendation

**Close #120 and merge #133**.

Owner action should be:

1. Close #120 as superseded after explicit OWNER approval.
2. Review #133 as the active replacement.
3. Merge #133 when OWNER approves normal merge readiness.

Do not merge #120 first.

## Requirement Checklist

| Requirement | Status | Notes |
| --- | --- | --- |
| Start from `main` | PASS | Checked out `main` before branch creation. |
| Worktree clean before branch | PASS | Hard-stop gate passed before branch creation. |
| Local/origin sync `0 0` before branch | PASS | `main...origin/main` was `0 0`. |
| Read all Project Instructions | PASS | Read files under `docs_build/dev/ProjectInstructions/` before writing report. |
| Review PR #120 | PASS | Fetched from GitHub authority. |
| Review PR #133 | PASS | Fetched from GitHub authority. |
| Compare required files | PASS | Compared all four requested code/test paths. |
| Produce files changed comparison | PASS | Included above. |
| Produce feature comparison | PASS | Included above. |
| Produce validation comparison | PASS | Included above. |
| Produce missing behavior analysis | PASS | Included above. |
| Produce regression risk analysis | PASS | Included above. |
| Use allowed recommendation wording | PASS | Recommendation is `Close #120 and merge #133`. |
| Do not merge PRs | PASS | No merge action performed. |
| Do not close PRs | PASS | No PR close action performed. |
| Do not delete branches | PASS | No branch deletion performed. |
| Do not modify runtime code | PASS | Report-only changes under `docs_build/dev/reports/`. |

## Validation Lane Report

- PASS: GitHub PR #120 metadata and changed file list fetched.
- PASS: GitHub PR #133 metadata and changed file list fetched.
- PASS: Per-file patches fetched for:
  - `assets/theme-v2/js/toolbox-status-bar.js`
  - `assets/theme-v2/css/status.css`
  - `assets/theme-v2/css/layout.css`
  - `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs`
- PASS: GitHub compare confirmed #120 and #133 branch histories diverged; #133 is not a direct continuation of #120.
- PASS: Local report scope stayed under `docs_build/dev/reports/`.
- PASS: Runtime tests were not run locally because this task is audit/report only and no runtime code changed.

## Manual Validation Notes

- Confirmed #120 and #133 both remove status bar labels, purpose text, context pill, and action link.
- Confirmed #120 and #133 both preserve selected game name and status message as the visible status bar content.
- Confirmed #133 is based on current `main`, while #120 is based on an older base and is not mergeable.
- Confirmed #133 should be treated as the active replacement PR.
- Confirmed #120 should not be merged before #133.
- Confirmed no GitHub state was modified during this review.

## Artifacts

- `docs_build/dev/reports/PR_26175_ALFA_010-status-bar-replacement-review.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `tmp/PR_26175_ALFA_010-status-bar-replacement-review_delta.zip`
