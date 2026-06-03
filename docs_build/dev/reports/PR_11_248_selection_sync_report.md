# PR_11_248 — Sync Row Actions With Selection State

## Summary
Wired saved-session row actions (`Use in Library`, `Load`) to also sync Session A/B selections for both Diff and Merge selectors, with A-then-B fill behavior, no overwrite when both set, and no same-session duplication.

## Files Changed
- `toolbox/workspace-v2/index.js`
- `tests/runtime/V2SelectionSyncRowActions.test.mjs`

## Implementation Details
- Added shared selection-sync helpers:
  - `syncSelectionSlotsFromContextId(leftSelectNode, rightSelectNode, candidates, contextId)`
  - `syncDiffAndMergeSelectionSlotsFromContextId(contextId)`
- Behavior applied to both Diff and Merge selectors:
  - fill `Session A` first if empty
  - else fill `Session B` if empty
  - do not overwrite if both selected
  - block same-session duplication across A/B
- Hooked row actions:
  - `useSavedSessionIdInLibraryInput(sessionId)` now syncs A/B after textbox fill.
  - `loadSavedSessionById(sessionId)` now syncs A/B after load.
- Immediately re-runs state wiring:
  - `updateDiffSelectionFeedbackAndState()`
  - `updateMergeSelectionFeedbackAndState()`

## Validation Commands Run
```powershell
node --check toolbox/workspace-v2/index.js
node --check tests/runtime/V2SelectionSyncRowActions.test.mjs
node tests/runtime/V2SelectionSyncRowActions.test.mjs
```

## Validation Results
- `node --check toolbox/workspace-v2/index.js` -> PASS
- `node --check tests/runtime/V2SelectionSyncRowActions.test.mjs` -> PASS
- `node tests/runtime/V2SelectionSyncRowActions.test.mjs` -> PASS
  - output: `tmp/v2-selection-sync-row-actions-results.json`
  - failures: `[]`

## Verified Behaviors
- Use in Library fills textbox and updates A/B -> PASS
- Load updates A/B -> PASS
- First click fills A, second fills B -> PASS
- Third click does not overwrite existing A/B -> PASS
- Same session is not duplicated across A/B -> PASS
- Diff/Merge enable-state updates immediately -> PASS

