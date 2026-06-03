# PR_11_256 — Render And Wire Undo Last Merge Control

## Summary
Fixed Undo Last Merge visibility/placement by rendering the button directly in the Session Merge action group (Preview / Confirm / Apply / Undo), with initial disabled state and existing PR_11_255 undo wiring.

## Files Changed
- `tools/workspace-v2/index.html`
- `tests/runtime/V2UndoButtonRender.test.mjs`

## Implementation Details
1. Merge panel UI render fix
- Moved `Undo Last Merge` into the same action button group as:
  - `Preview Merge (Dry Run)`
  - `Confirm Preview`
  - `Apply Merge`
- Set initial disabled state in markup:
  - `<button id="workspaceV2UndoLastMergeButton" ... disabled>`

2. Wiring usage
- Reused existing PR_11_255 logic in `tools/workspace-v2/index.js`:
  - `updateUndoLastMergeState()`
  - `undoLastMerge()`
  - refreshes recent list and selector state
  - removes runtime recent/sessionStorage only
  - leaves Session Library unchanged

## Validation Commands Run
```powershell
node --check tools/workspace-v2/index.js
node --check tests/runtime/V2UndoButtonRender.test.mjs
node --check tests/runtime/V2UndoLastMerge.test.mjs
node tests/runtime/V2UndoButtonRender.test.mjs
node tests/runtime/V2UndoLastMerge.test.mjs
```

## Validation Results
- `node --check tools/workspace-v2/index.js` -> PASS
- `node --check tests/runtime/V2UndoButtonRender.test.mjs` -> PASS
- `node --check tests/runtime/V2UndoLastMerge.test.mjs` -> PASS
- `node tests/runtime/V2UndoButtonRender.test.mjs` -> PASS
  - output: `tmp/v2-undo-button-render-results.json`
  - failures: `[]`
- `node tests/runtime/V2UndoLastMerge.test.mjs` -> PASS
  - output: `tmp/v2-undo-last-merge-results.json`
  - failures: `[]`

## Verified
- Undo button is rendered in Session Merge action group -> PASS
- Button is disabled initially -> PASS
- Existing merge-tracking logic enables it when last merged session exists -> PASS
- Clicking undo removes merged recent session + sessionStorage payload -> PASS
- Button disables after undo -> PASS
- Clicking with no merge reports `No recent merge to undo.` -> PASS
- Session Library unaffected -> PASS

