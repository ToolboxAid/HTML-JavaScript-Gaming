# PR_26179_CHARLIE_027-sprites-preview-export

Team: CHARLIE
Workflow: stacked feature workflow
Base branch: PR_26179_CHARLIE_026-sprites-palette-panel
Canonical ZIP path: dev/workspace/zip/PR_26179_CHARLIE_027-sprites-preview-export_delta.zip

## Summary

Added live preview and PNG download/export for the unsaved Sprite Creator editor draft. Export uses canvas `toBlob` and browser download behavior. This PR does not save to library, publish, write browser storage, or add API/DB/schema changes.

## Branch Validation

PASS

- Current branch: PR_26179_CHARLIE_027-sprites-preview-export
- Based on: PR_26179_CHARLIE_026-sprites-palette-panel
- No start_of_day files changed
- No DB/API/schema files changed
- No stale PR #219-#228 code copied

## Requirement Checklist

| Requirement | Status | Notes |
| --- | --- | --- |
| Add live preview | PASS | Preview canvas reflects unsaved draft pixels. |
| Add PNG export/download | PASS | Download button exports `sprite-creator-draft.png`. |
| No save-to-library | PASS | No saved sprite library or product persistence added. |
| No publishing | PASS | Export is local download only. |
| Avoid persisted data URLs | PASS | Uses `canvas.toBlob`; no `imageDataUrl` or `toDataURL`. |
| No DB/API/schema changes | PASS | Only UI/JS/CSS/test/report files changed. |

## Validation Lane Report

Commands:

```text
node --check assets/toolbox/sprites/js/index.js
node --check dev/tests/playwright/tools/SpritesToolShell.spec.mjs
git diff --check -- toolbox/sprites/index.html assets/toolbox/sprites/js/index.js assets/theme-v2/css/gamefoundrystudio.css dev/tests/playwright/tools/SpritesToolShell.spec.mjs
rg --pcre2 -n -i "localStorage|sessionStorage|indexedDB|imageDataUrl|toDataURL|<style|style=|<script(?![^>]+src=)|on(click|change|submit|input|load|error)=|local-mem|fake-login|MEM DB" toolbox/sprites/index.html assets/toolbox/sprites/js/index.js dev/tests/playwright/tools/SpritesToolShell.spec.mjs
npx playwright test dev/tests/playwright/tools/SpritesToolShell.spec.mjs --workers=1 --reporter=list --output=<temp>
```

Results:

- Node syntax checks: PASS
- `git diff --check`: PASS
- Guard scan: PASS, no matches
- Targeted Playwright: PASS, 1 test passed

## Manual Validation Notes

1. Open `/toolbox/sprites/index.html` from the stacked branch.
2. Draw or fill pixels.
3. Confirm the preview canvas shows the draft.
4. Click Download PNG and confirm a `sprite-creator-draft.png` download starts.
5. Confirm no save-to-library or publishing controls are present.

## ZIP Path

`dev/workspace/zip/PR_26179_CHARLIE_027-sprites-preview-export_delta.zip`
