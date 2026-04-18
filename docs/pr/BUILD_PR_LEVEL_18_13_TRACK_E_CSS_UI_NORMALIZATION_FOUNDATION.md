# BUILD_PR_LEVEL_18_13_TRACK_E_CSS_UI_NORMALIZATION_FOUNDATION

## Purpose
Advance Roadmap 18 Track E with the smallest executable UI/CSS normalization slice that is testable and does not widen scope.

## Scope
Normalize the shared UI chrome layer used by debug/platform and tool-shell style surfaces only.

Included work:
- flatten duplicated CSS layer usage within the targeted shared UI chrome cluster
- enforce shared UI class usage for the same targeted cluster
- remove redundant styles only when replaced by the normalized shared class path
- update roadmap status markers only if execution is validation-backed

Excluded work:
- no repo-wide CSS sweep
- no visual redesign
- no game-specific art/styling changes
- no sample-only cosmetic cleanup unless directly required by the targeted shared class migration
- no HTML structure churn beyond what is required to consume normalized shared classes
- no docs reorganization

## Targeting Rules
Codex must first identify the narrowest existing shared UI chrome cluster that is already reused by more than one surface, then normalize only that cluster and its direct consumers.

Examples of acceptable target clusters:
- shared debug panel chrome
- shared tool-shell header/panel/button chrome
- shared overlay container + panel framing

Choose one cluster only.

## Required Deliverables
- implementation edits limited to the chosen shared UI chrome cluster and direct consumers
- validation-backed roadmap status update in `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`
- reports under `docs/dev/reports/`
- packaged ZIP at `<project folder>/tmp/BUILD_PR_LEVEL_18_13_TRACK_E_CSS_UI_NORMALIZATION_FOUNDATION.zip`

## Execution Requirements
- one PR purpose only
- one-pass executable
- smallest scoped valid change
- no repo-wide scanning unless required to validate the chosen cluster boundaries
- preserve existing behavior while reducing CSS/UI duplication
- prefer PowerShell where it reduces token usage

## Roadmap Status Rules
Only update status markers after execution-backed validation.
Allowed transitions only:
- `18 Track E - CSS & UI Normalization`: `[ ] -> [.]` when this foundation slice is complete
- targeted sub-bullets may move `[ ] -> [.]` or `[x]` only if the work is fully execution-backed
- do not rewrite roadmap text
- do not delete roadmap text

## Acceptance
- exactly one shared UI chrome cluster normalized
- duplicated/redundant styles reduced inside that cluster
- direct consumers use the normalized shared class path
- no functional regression in affected UI surfaces
- roadmap updated with status-only transitions only when backed by execution
- ZIP artifact produced at the required repo tmp path
