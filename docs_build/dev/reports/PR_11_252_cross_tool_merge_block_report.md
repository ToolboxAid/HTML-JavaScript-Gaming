# PR_11_252 — Cross-Tool Merge Block (Early Validation)

## Summary
Added an early cross-tool validation gate in Workspace V2 Session Merge preview. If selected Session A/B payload `toolId` values differ, preview is blocked immediately with a clear message and both selected tool IDs, before deep merge/conflict preview runs.

## Files Changed
- `toolbox/workspace-v2/index.js`
- `tests/runtime/V2CrossToolMergeBlock.test.mjs`

## Implementation Details
- Added early check in `computeSelectedSessionMerge()`:
  - read `left.payload.toolId` and `right.payload.toolId`
  - if both exist and differ:
    - block preview
    - clear pending preview state (`this.pendingMergePreview = null`)
    - keep Preview button available (selection-based enable logic unchanged)
    - disable Confirm/Apply via existing state model
    - render clear message in merge output:
      - `Cross-tool merge is not supported. Select two sessions with the same toolId.`
      - `Session A toolId: <...>`
      - `Session B toolId: <...>`
    - do not render raw merge JSON preview

- Same-tool flow remains unchanged:
  - deep merge preview still runs
  - conflict summary still works
  - conflict-free fresh preview can enable Confirm

## Validation Commands Run
```powershell
node --check toolbox/workspace-v2/index.js
node --check tests/runtime/V2CrossToolMergeBlock.test.mjs
node --check tests/runtime/V2MergeConflictSummary.test.mjs
node --check tests/runtime/V2ConfirmPreviewEnableState.test.mjs
node tests/runtime/V2CrossToolMergeBlock.test.mjs
node tests/runtime/V2MergeConflictSummary.test.mjs
node tests/runtime/V2ConfirmPreviewEnableState.test.mjs
```

## Validation Results
- `node --check toolbox/workspace-v2/index.js` -> PASS
- `node --check tests/runtime/V2CrossToolMergeBlock.test.mjs` -> PASS
- `node --check tests/runtime/V2MergeConflictSummary.test.mjs` -> PASS
- `node --check tests/runtime/V2ConfirmPreviewEnableState.test.mjs` -> PASS
- `node tests/runtime/V2CrossToolMergeBlock.test.mjs` -> PASS
  - output: `tmp/v2-cross-tool-merge-block-results.json`
  - failures: `[]`
- `node tests/runtime/V2MergeConflictSummary.test.mjs` -> PASS
  - output: `tmp/v2-merge-conflict-summary-results.json`
  - failures: `[]`
- `node tests/runtime/V2ConfirmPreviewEnableState.test.mjs` -> PASS
  - output: `tmp/v2-confirm-preview-enable-state-results.json`
  - failures: `[]`

## Verified
- cross-tool selections block preview with clear message -> PASS
- cross-tool preview does not render raw merge JSON -> PASS
- cross-tool message includes both toolIds -> PASS
- Confirm/Apply remain disabled after cross-tool block -> PASS
- same-tool selections still run preview -> PASS
- same-tool conflict preview still shows conflict summary -> PASS
- same-tool conflict-free preview still enables Confirm Preview -> PASS

