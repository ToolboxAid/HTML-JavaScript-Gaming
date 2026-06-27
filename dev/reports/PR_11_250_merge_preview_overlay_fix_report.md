# PR_11_250 — Merge Preview Overlay Blocking Confirm/Apply Fix

## Summary
Updated Workspace V2 Session Merge UI state feedback and preview output containment so preview results remain inside the merge panel and Confirm/Apply readiness is explicit and testable.

## Files Changed
- `toolbox/workspace-v2/index.html`
- `toolbox/workspace-v2/index.js`
- `tests/runtime/V2MergePreviewOverlayFix.test.mjs`

## Changes Implemented
1. Merge preview output containment
- `#workspaceV2MergeOutput` now uses bounded inline styles:
  - `max-height: 18rem`
  - `overflow: auto`
  - `position: relative`
- This keeps preview output visually contained in the Session Merge panel.

2. Merge enable-state/status flow
- Added/updated explicit state messaging in merge selection feedback:
  - before preview (with valid A/B): `Ready to preview merge.`
  - after valid non-conflict preview: `Preview ready. Confirm to enable apply.`
  - after confirmed fresh preview: `Preview confirmed. Ready to apply merge.`
  - conflict preview: `Preview has conflicts. Resolve conflicts before applying.`
- Existing button enable/disable logic remains unchanged and is now reflected by explicit status text.

3. Confirm/Apply guard expectations
- Confirm enabled only when preview exists, is fresh, and has no conflicts.
- Apply remains disabled before confirm.
- Apply enabled immediately after confirm when preview remains fresh and conflict-free.
- Conflict preview keeps Confirm and Apply disabled.

## Validation Commands Run
```powershell
node --check toolbox/workspace-v2/index.js
node --check tests/runtime/V2MergePreviewOverlayFix.test.mjs
node tests/runtime/V2MergePreviewOverlayFix.test.mjs
```

## Validation Results
- `node --check toolbox/workspace-v2/index.js` -> PASS
- `node --check tests/runtime/V2MergePreviewOverlayFix.test.mjs` -> PASS
- `node tests/runtime/V2MergePreviewOverlayFix.test.mjs` -> PASS
  - output: `tmp/v2-merge-preview-overlay-fix-results.json`
  - failures: `[]`

## Verified
- Valid selections enable Preview Merge -> PASS
- Preview output is contained in merge panel -> PASS
- Valid preview enables Confirm Preview (no conflicts) -> PASS
- Apply remains disabled before confirm -> PASS
- Confirm Preview enables Apply when fresh/non-conflict -> PASS
- Conflict preview keeps Confirm/Apply disabled -> PASS
- Status text updates through preview -> confirm -> apply flow -> PASS

