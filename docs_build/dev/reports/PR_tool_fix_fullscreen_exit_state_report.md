# PR Tool Fix Fullscreen Exit State Report

- Generated: 2026-04-28T18:35:50.242Z
- PASS/FAIL: PASS

## Changed Files
- tools/shared/platformShell.js
- tmp/pr_tool_fix_fullscreen_exit_state_validation.json
- docs_build/dev/reports/PR_tool_fix_fullscreen_exit_state_report.md

## Root Cause
- Fullscreen exit handling only re-rendered summary text and did not explicitly clear fullscreen shell state or force the header/details accordion back to collapsed non-fullscreen state.
- This allowed stale fullscreen UI state to persist after exiting fullscreen (especially via Escape), leaving the summary/details in an inconsistent state.

## State/Classes Fixed
- Added explicit fullscreen shell state application and clearing on `fullscreenchange`:
  - `body.tools-platform-fullscreen-active` class
  - `data-tools-platform-fullscreen="1"` attribute
- On fullscreen exit (`document.fullscreenElement` false):
  - clear fullscreen class/attribute
  - collapse header/details (`details.open = false`)
  - persist collapsed header state
  - prevent stale auto-reentry using one-cycle suppression guard
- Summary label now reflects non-fullscreen state after exit and retains tool-specific wording.

## Validation Commands/Results
- `node --check tools/shared/platformShell.js` -> PASS
- Targeted browser validation script (Parallax Scene Studio) -> PASS
- Evidence: `tmp/pr_tool_fix_fullscreen_exit_state_validation.json`

## Acceptance Checks
- Enter fullscreen works: PASS
- Exit fullscreen via UI clears fullscreen state: PASS
- Exit fullscreen via Escape clears fullscreen state: PASS
- Header/details collapsed after UI exit: PASS
- Header/details collapsed after Escape exit: PASS
- Non-fullscreen toggle label after exit: PASS
- No visible generic labels: PASS

## Remaining Issues
- None identified in this scoped fix/validation.

## Scope Confirmation
- No KOTI files modified.
- No sample games modified.
- No runtime engine files modified.
- No start_of_day folders modified.
