# PR_26179_CHARLIE_029-sprites-clear-reset-controls

Team: CHARLIE
Workflow: stacked feature workflow
Base branch: PR_26179_CHARLIE_028-sprites-editor-polish
Canonical ZIP path for this batch: dev/workspace/zip/PR_26179_CHARLIE_029-sprites-clear-reset-controls_delta.zip

## Summary

Added Clear Canvas and Reset to 16x16 controls. Both operate only on unsaved page-session editor state and do not persist product data.

## Product Owner Testable Outcome

The Product Owner can fill or draw on the Sprite Creator canvas, clear the draft, and reset back to the 16x16 display mode.

## Branch Validation

PASS

- Current branch: PR_26179_CHARLIE_029-sprites-clear-reset-controls
- Based on: PR_26179_CHARLIE_028-sprites-editor-polish
- No start_of_day files changed
- No DB/API/schema files changed
- No stale PR #219-#228 code copied

## Requirement Checklist

| Requirement | Status | Notes |
| --- | --- | --- |
| Add Clear Canvas | PASS | Clears painted draft pixels. |
| Add Reset to 16x16 | PASS | Resets grid to default display and clears draft. |
| State remains unsaved page-session editor state | PASS | Module memory only; no browser storage. |
| No DB/API/schema changes | PASS | None changed. |

## Validation Lane Report

Commands:

```text
node --check assets/toolbox/sprites/js/index.js
node --check dev/tests/playwright/tools/SpritesToolShell.spec.mjs
git diff --check -- toolbox/sprites/index.html assets/toolbox/sprites/js/index.js dev/tests/playwright/tools/SpritesToolShell.spec.mjs
rg --pcre2 -n -i "localStorage|sessionStorage|indexedDB|imageDataUrl|toDataURL|<style|style=|<script(?![^>]+src=)|on(click|change|submit|input|load|error)=|local-mem|fake-login|MEM DB" toolbox/sprites/index.html assets/toolbox/sprites/js/index.js dev/tests/playwright/tools/SpritesToolShell.spec.mjs
npx playwright test dev/tests/playwright/tools/SpritesToolShell.spec.mjs --workers=1 --reporter=list --output=<temp>
```

Results:

- Node syntax checks: PASS
- `git diff --check`: PASS
- Guard scan: PASS, no matches
- Targeted Playwright: PASS, 1 test passed

## Manual Validation Notes

1. Open `/toolbox/sprites/index.html`.
2. Use Fill, then click Clear Canvas and confirm the grid clears.
3. Switch to 32x32, draw or fill, then click Reset to 16x16.
4. Confirm the grid is 16x16 and the draft is empty.

## Previous PR Dependency

PR_26179_CHARLIE_028-sprites-editor-polish

## Next PR Dependency

PR_26179_CHARLIE_030-sprites-undo-redo

## ZIP Path

`dev/workspace/zip/PR_26179_CHARLIE_029-sprites-clear-reset-controls_delta.zip`
