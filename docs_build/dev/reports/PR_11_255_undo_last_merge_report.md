# PR_11_255 — Undo Last Merge (Recent Only)

## Summary
Added `Undo Last Merge` for Workspace V2 merge runtime flow. It removes only the most recent merged runtime session from Recent Sessions and `sessionStorage`, without changing Session Library entries.

## Files Changed
- `tools/workspace-v2/index.html`
- `tools/workspace-v2/index.js`
- `tests/runtime/V2UndoLastMerge.test.mjs`

## Implementation Details
1. Last merged tracking
- Added key:
  - `v2-last-merged` (sessionStorage)
- Added state:
  - `lastMergedHostContextId`
- On startup:
  - reads `lastMergedHostContextId` from `v2-last-merged`
- After successful Apply Merge:
  - stores merged host context id via `writeLastMergedHostContextId(hostContextId)`

2. Merge panel UI
- Added button under merge panel:
  - `Undo Last Merge` (`#workspaceV2UndoLastMergeButton`)

3. Enable-state
- Added `updateUndoLastMergeState()`:
  - enabled only when `lastMergedHostContextId` exists and is present in Recent Sessions
  - disabled otherwise
- Called during recent-session rendering and reset paths.

4. Undo behavior
- Added `undoLastMerge()`:
  - if no tracked merge exists:
    - status: `No recent merge to undo.`
  - if tracked merge exists:
    - removes matching entry from recent history
    - removes its `sessionStorage` payload
    - clears `lastMergedHostContextId` + `v2-last-merged`
    - clears Diff/Merge selections if they referenced that session
    - refreshes recent list and selector state
    - status: `Last merged session removed.`

5. Scope guarantees
- Does not remove Session Library entries.
- Does not undo older merges; only tracked last merge.
- Does not modify source sessions.

## Validation Commands Run
```powershell
node --check tools/workspace-v2/index.js
node --check tests/runtime/V2UndoLastMerge.test.mjs
node tests/runtime/V2UndoLastMerge.test.mjs
```

## Validation Results
- `node --check tools/workspace-v2/index.js` -> PASS
- `node --check tests/runtime/V2UndoLastMerge.test.mjs` -> PASS
- `node tests/runtime/V2UndoLastMerge.test.mjs` -> PASS
  - output: `tmp/v2-undo-last-merge-results.json`
  - failures: `[]`

## Verified
- merge creates trackable recent merged session context -> PASS
- Undo Last Merge removes that recent merged session -> PASS
- Undo clears A/B selection references to that merged session -> PASS
- Undo disables itself after execution -> PASS
- Undo does not affect Session Library -> PASS
- Undo shows `No recent merge to undo.` when nothing is available -> PASS

