# PR_11_254 — Auto-Register Merged Result In Recent Sessions

## Summary
Updated Workspace V2 merge post-apply flow so successful merged results are immediately registered as runtime sessions and added to Recent Sessions, without auto-saving to Session Library.

## Files Changed
- `tools/workspace-v2/index.js`
- `tests/runtime/V2MergedRecentSessionRegistration.test.mjs`

## Implementation Details
1. Merged hostContextId generation
- Added:
  - `createMergedHostContextId(toolId)`
- Format:
  - `<toolId>-merged-<timestamp>-<shortId>`

2. Post-apply merged registration
- In `applySelectedSessionMerge()` after successful apply verification:
  - create merged hostContextId using merged format
  - persist merged payload to `sessionStorage`
  - merged payload includes:
    - `version: "v2"`
    - `toolId`
    - `mergeResultMeta` with:
      - `isMergedResult: true`
      - source/target context ids
      - merge timestamp
  - register into Recent Sessions via `addRecentSessionEntry(...)`

3. Recent Sessions label clarity
- Recent row title now shows:
  - `<toolId> (merged)` for merged-result entries
  - using `payload.mergeResultMeta.isMergedResult === true`

4. Behavior guarantees
- No auto-save into Session Library.
- Source sessions are not overwritten.
- Existing Recent Session actions remain unchanged and available:
  - Reopen
  - Copy ID
  - Use in Library
  - Delete
- Diff/Merge selectors refresh through existing recent/session inventory refresh flow.

## Validation Commands Run
```powershell
node --check tools/workspace-v2/index.js
node --check tests/runtime/V2MergedRecentSessionRegistration.test.mjs
node tests/runtime/V2MergedRecentSessionRegistration.test.mjs
```

## Validation Results
- `node --check tools/workspace-v2/index.js` -> PASS
- `node --check tests/runtime/V2MergedRecentSessionRegistration.test.mjs` -> PASS
- `node tests/runtime/V2MergedRecentSessionRegistration.test.mjs` -> PASS
  - output: `tmp/v2-merged-recent-session-registration-results.json`
  - failures: `[]`

## Verified
- Apply Merge creates new merged recent entry -> PASS
- merged session appears at top of Recent Sessions -> PASS
- merged session payload stored in sessionStorage with merged metadata -> PASS
- merged session is reopenable -> PASS
- merged session is available for Diff/Merge selection inventory -> PASS
- deleting merged recent session removes it correctly -> PASS
- Session Library remains unchanged unless explicitly saved -> PASS

