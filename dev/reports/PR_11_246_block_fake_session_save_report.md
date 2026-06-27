# PR_11_246 — Block Fake Session IDs From Creating Saved Library Entries

## Summary
Updated Workspace V2 Session Library Save/Overwrite to require exact session ID resolution from `sessionStorage` by entered `hostContextId`. This blocks fake/arbitrary IDs from creating or overwriting saved library entries.

## Files Changed
- `toolbox/workspace-v2/index.js`
- `tests/runtime/V2BlockFakeSessionSave.test.mjs`

## Implementation Details
- Save/Overwrite source resolution is now strict:
  - `readSessionPayloadForLibraryWrite(sessionId)` reads only `sessionStorage[sessionId]` and validates parsed JSON payload.
  - Removed active-payload fallback path for Save/Overwrite when entered ID does not resolve exactly.
- Save behavior:
  - existing library ID -> `Saved session already exists. Use Overwrite Session.`
  - non-existing ID with valid `sessionStorage` payload -> `Saved session created.`
  - unknown/fake ID -> `Session ID does not resolve to a valid Workspace V2 session.`
- Overwrite behavior:
  - unknown/fake ID -> `Session ID does not resolve to a valid Workspace V2 session.`
  - valid resolvable ID but no saved entry -> `Saved session not found. Use Save Session to create it first.`
  - valid resolvable ID with saved entry -> `Saved session overwritten.`
- Added stale invalid fake-entry cleanup helper:
  - `cleanupStaleInvalidSavedEntries(library)`
  - removes only high-confidence stale fake host-like IDs that:
    - do not resolve to matching `sessionStorage` payload, and
    - do not match payload host context metadata or tool metadata.
  - preserves valid saved entries, including custom user labels.

## Validation Commands Run
```powershell
node --check toolbox/workspace-v2/index.js
node --check tests/runtime/V2BlockFakeSessionSave.test.mjs
node --check tests/runtime/V2SaveLibraryFromRecentSession.test.mjs
node tests/runtime/V2BlockFakeSessionSave.test.mjs
node tests/runtime/V2SaveLibraryFromRecentSession.test.mjs
node tests/runtime/V2SavedSessionDeleteFeedback.test.mjs
```

## Validation Results
- `node --check toolbox/workspace-v2/index.js` -> PASS
- `node --check tests/runtime/V2BlockFakeSessionSave.test.mjs` -> PASS
- `node --check tests/runtime/V2SaveLibraryFromRecentSession.test.mjs` -> PASS
- `node tests/runtime/V2BlockFakeSessionSave.test.mjs` -> PASS
  - output: `tmp/v2-block-fake-session-save-results.json`
  - failures: `[]`
- `node tests/runtime/V2SaveLibraryFromRecentSession.test.mjs` -> PASS
  - output: `tmp/v2-save-library-from-recent-session-results.json`
  - failures: `[]`
- `node tests/runtime/V2SavedSessionDeleteFeedback.test.mjs` -> PASS
  - output: `tmp/v2-saved-session-delete-feedback-results.json`
  - failures: `[]`

## Requirement Coverage
- Fake unknown ID cannot create saved entry -> PASS
- Fake unknown ID cannot overwrite saved entry -> PASS
- Valid recent/sessionStorage ID can be saved -> PASS
- Duplicate save is blocked -> PASS
- Overwrite valid existing saved ID succeeds -> PASS
- Active payload is not saved under unrelated input ID -> PASS
- Stale invalid fake-entry cleanup preserves valid saved entries -> PASS

## Full Samples Smoke
Skipped.

Reason: scope is limited to Workspace V2 Session Library Save/Overwrite behavior and targeted runtime tests; no schemas/samples/games/shared sample infrastructure changed.

