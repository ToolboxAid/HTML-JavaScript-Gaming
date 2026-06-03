# PR_11_253 — Merge Target Naming And Output Handling

## Summary
Added post-merge output handling so successful merge results can be explicitly named and saved into Session Library, without auto-saving or overwriting source sessions.

## Files Changed
- `toolbox/workspace-v2/index.html`
- `toolbox/workspace-v2/index.js`
- `tests/runtime/V2MergeOutputPersistence.test.mjs`

## Implementation Details
1. Merge output naming UI (merge panel)
- Added under Session Merge:
  - label: `Merged Session ID`
  - input: `#workspaceV2MergedSessionId`
  - button: `Save Merged Session`
  - button: `Use in Diff/Merge`
  - status line: `#workspaceV2MergedSessionStatus`

2. Post-apply capture (runtime only unless saved)
- After successful `Apply Merge`, merged payload is captured via:
  - `setLastMergedSessionResult(appliedPayload, selectedToolId)`
- Default merged ID format:
  - `<toolId>-merged-<timestamp>`
- No auto-save to library.

3. Save Merged Session behavior
- `saveMergedSessionResult()` enforces:
  - non-empty ID
  - duplicate block when ID already exists in `v2-session-library`
- On success:
  - saves merged payload into `v2-session-library`
  - refreshes Session Library view
  - recomputes Diff/Merge inventory through existing library write flow
  - status: `Merged session saved.`
- Duplicate status:
  - `Session ID already exists. Choose a different ID.`

4. Reuse merged result quickly
- `useMergedSessionInDiffMerge()`:
  - keeps merged result runtime-only
  - writes merged payload to `sessionStorage` under entered merged ID
  - adds recent entry
  - syncs Session A/B selection flow for Diff/Merge

## Validation Commands Run
```powershell
node --check toolbox/workspace-v2/index.js
node --check tests/runtime/V2MergeOutputPersistence.test.mjs
node tests/runtime/V2MergeOutputPersistence.test.mjs
```

## Validation Results
- `node --check toolbox/workspace-v2/index.js` -> PASS
- `node --check tests/runtime/V2MergeOutputPersistence.test.mjs` -> PASS
- `node tests/runtime/V2MergeOutputPersistence.test.mjs` -> PASS
  - output: `tmp/v2-merge-output-persistence-results.json`
  - failures: `[]`

## Verified
- merge apply produces capture-ready merged payload -> PASS
- merged payload can be saved with new ID -> PASS
- duplicate ID is blocked -> PASS
- saved merged session appears in Session Library -> PASS
- merged session can be reused in Diff/Merge -> PASS
- not saving leaves library unchanged -> PASS

