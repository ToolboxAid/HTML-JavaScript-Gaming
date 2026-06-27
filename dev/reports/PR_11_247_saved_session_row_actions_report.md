# PR_11_247 — Saved Session Row Actions + Clear Labels

## Summary
Implemented row-level Session Library actions so saved sessions are usable without copy/paste. Added explicit saved-vs-recent helper text and direct row controls for Copy ID, Use in Library, Load, and Delete Saved.

## Files Changed
- `toolbox/workspace-v2/index.html`
- `toolbox/workspace-v2/index.js`
- `tests/runtime/V2SavedSessionRowActions.test.mjs`

## Implemented UI/Behavior
- Updated helper text to:
  - `Saved sessions are stored in Session Library. Recent sessions are temporary.`
- Each saved library row now shows:
  - readable label (`toolId` when available)
  - full session ID
  - `Copy ID`
  - `Use in Library`
  - `Load`
  - `Delete Saved`
- Row actions:
  - `Use in Library` populates Session ID textbox.
  - `Copy ID` copies exact saved session ID to clipboard.
  - `Load` loads saved session directly and refreshes Session Library display.
  - `Delete Saved` deletes only the saved library entry (no recent/sessionStorage deletion path).
- Existing textbox actions are preserved:
  - `Save Session`
  - `Overwrite Session`
  - `Load Session`
  - `Delete Saved Session`
- Existing library mutation path still recomputes Diff/Merge inventory via `writeSessionLibrary(...)`.

## Validation Commands Run
```powershell
node --check toolbox/workspace-v2/index.js
node --check tests/runtime/V2SavedSessionRowActions.test.mjs
node tests/runtime/V2SavedSessionRowActions.test.mjs
```

## Validation Results
- `node --check toolbox/workspace-v2/index.js` -> PASS
- `node --check tests/runtime/V2SavedSessionRowActions.test.mjs` -> PASS
- `node tests/runtime/V2SavedSessionRowActions.test.mjs` -> PASS
  - output: `tmp/v2-saved-session-row-actions-results.json`
  - failures: `[]`

## Coverage Confirmed
- saved rows expose Copy ID / Use in Library / Load / Delete Saved -> PASS
- row Copy ID copies exact saved ID -> PASS
- row Use in Library populates textbox -> PASS
- row Load executes saved-session load path -> PASS
- row Delete Saved removes saved entry only -> PASS
- Recent Sessions unaffected by row Delete Saved -> PASS
- textbox action methods remain present and wired -> PASS

## Full Samples Smoke
Skipped.

Reason: PR scope is limited to Workspace V2 Session Library UI/action surface and targeted runtime validation. No schemas/samples/games/shared sample infrastructure changed.

