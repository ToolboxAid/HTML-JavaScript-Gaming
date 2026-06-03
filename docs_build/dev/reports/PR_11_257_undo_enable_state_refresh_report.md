# PR_11_257 — Refresh Undo Last Merge Enable State Immediately After Apply

## Summary
Fixed merge post-apply state refresh ordering so `Undo Last Merge` enables immediately after successful apply/registration, without requiring a second run or page reload.

## Files Changed
- `toolbox/workspace-v2/index.js`
- `tests/runtime/V2UndoEnableStateRefresh.test.mjs`

## Implementation Details
1. Immediate undo-state refresh after apply
- In `applySelectedSessionMerge()`:
  - persist last merged id first: `writeLastMergedHostContextId(hostContextId)`
  - register merged recent entry
  - validate registration exists in history
  - force immediate UI refresh:
    - recent sessions
    - diff/merge inventories
    - merge enable-state
    - undo enable-state

2. Registration failure path
- If merged recent registration check fails:
  - clear last merged id
  - keep undo disabled
  - status:
    - `Merge apply failed to register merged session in Recent Sessions. Undo remains disabled.`

3. Undo post-state
- Existing undo flow still:
  - removes recent merged entry
  - removes payload from sessionStorage
  - clears last merged id
  - refreshes lists/selectors
  - disables undo immediately

## Validation Commands Run
```powershell
node --check toolbox/workspace-v2/index.js
node --check tests/runtime/V2UndoEnableStateRefresh.test.mjs
node --check tests/runtime/V2UndoLastMerge.test.mjs
node tests/runtime/V2UndoEnableStateRefresh.test.mjs
node tests/runtime/V2UndoLastMerge.test.mjs
```

## Validation Results
- `node --check toolbox/workspace-v2/index.js` -> PASS
- `node --check tests/runtime/V2UndoEnableStateRefresh.test.mjs` -> PASS
- `node --check tests/runtime/V2UndoLastMerge.test.mjs` -> PASS
- `node tests/runtime/V2UndoEnableStateRefresh.test.mjs` -> PASS
  - output: `tmp/v2-undo-enable-state-refresh-results.json`
  - failures: `[]`
- `node tests/runtime/V2UndoLastMerge.test.mjs` -> PASS
  - output: `tmp/v2-undo-last-merge-results.json`
  - failures: `[]`

## Verified
- Undo disabled initially -> PASS
- successful Apply Merge enables Undo immediately -> PASS
- no second run required -> PASS
- Undo removes merged session -> PASS
- Undo disables immediately after use -> PASS
- recent + selector state refreshes after apply and undo -> PASS

