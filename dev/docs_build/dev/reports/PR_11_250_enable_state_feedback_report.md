# PR_11_250 — Diff/Merge Enable-State Feedback

## Summary
Added explicit inline enable-state feedback for Diff and Merge actions so users can see when actions are enabled or disabled without relying only on button visuals.

## Files Changed
- `toolbox/workspace-v2/index.html`
- `toolbox/workspace-v2/index.js`
- `tests/runtime/V2EnableStateFeedback.test.mjs`

## Implementation
- Added Diff inline status line:
  - `#workspaceV2DiffEnableState`
  - Disabled text: `Select two different sessions to enable Compute Diff.`
  - Enabled text: `Ready to compute diff.`
- Added Merge inline status line:
  - `#workspaceV2MergeEnableState`
  - Disabled text: `Select two different sessions to enable Preview Merge.`
  - Enabled text: `Ready to preview merge.`
- Status updates are wired inside existing selection handlers:
  - `updateDiffSelectionFeedbackAndState()`
  - `updateMergeSelectionFeedbackAndState()`
- No changes were made to existing enable/disable decision logic.

## Validation Commands Run
```powershell
node --check toolbox/workspace-v2/index.js
node --check tests/runtime/V2EnableStateFeedback.test.mjs
node tests/runtime/V2EnableStateFeedback.test.mjs
```

## Validation Results
- `node --check toolbox/workspace-v2/index.js` -> PASS
- `node --check tests/runtime/V2EnableStateFeedback.test.mjs` -> PASS
- `node tests/runtime/V2EnableStateFeedback.test.mjs` -> PASS
  - output: `tmp/v2-enable-state-feedback-results.json`
  - failures: `[]`

## Verified
- No selection -> disabled status text shown
- One selection -> disabled status text shown
- Same session selected -> disabled status text shown
- Two distinct selections -> enabled status text shown
- Status updates occur immediately on selection change

