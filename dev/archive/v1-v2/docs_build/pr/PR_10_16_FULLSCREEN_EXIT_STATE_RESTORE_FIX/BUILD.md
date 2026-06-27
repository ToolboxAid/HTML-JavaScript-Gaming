# BUILD_PR_10_16_FULLSCREEN_EXIT_STATE_RESTORE_FIX

## Required Codex Work

### 1. Unify exit path
Find the shared platform fullscreen exit handler and ensure:
- button click exit
- Escape key/browser fullscreenchange exit
both call one cleanup/restore routine.

### 2. Clear fullscreen state
On exit, remove all fullscreen markers including any relevant:
- body classes
- html classes
- data attributes
- tool root fullscreen markers
- summary active/collapsed fullscreen state markers
- cached/stored fullscreen flags

### 3. Restore normal layout
After fullscreen exit:
- normal header/details are visible according to normal-mode rules
- compact fullscreen summary is not active
- tool does not remain constrained/styled as fullscreen
- scroll/layout sizing returns to normal browser window behavior

### 4. Validation report
Create:
docs_build/dev/reports/PR_10_16_FULLSCREEN_EXIT_STATE_RESTORE_FIX_report.md

Report must include:
- files changed
- exact fullscreen markers cleared
- validation for Exit Fullscreen button
- validation for Escape/browser fullscreen exit
- confirmation no data/schema/start_of_day changes

## Constraints
- Smallest scoped valid change.
- No unrelated fullscreen polish.
- No tool-specific fixes.
- No data changes.
