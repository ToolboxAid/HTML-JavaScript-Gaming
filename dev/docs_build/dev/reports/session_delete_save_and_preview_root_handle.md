# Session Delete Save And Preview Root Handle

## Scope
- Added Workspace Manager V2 `Save` and `Close Workspace` controls.
- Restricted Workspace Manager V2 session deletion to the explicit `Close Workspace` path.
- Preserved Session Inspector V2 per-entry Delete and Delete All deletion behavior.
- Updated Session Inspector V2 Delete All to log each removed key before the summary.
- Updated Preview Generator V2 repo handle diagnostics and handle-based write verification.

## Session Deletion Guardrails
- Workspace Manager V2 lifecycle paths no longer delete normalized `workspace.tools.<tool-id>` keys.
- Workspace Manager V2 Close Workspace checks every normalized `workspace.tools.<tool-id>.dirty` object before clearing workspace session data.
- If any dirty session has `isDirty: true`, Close Workspace logs a visible `WARN` and leaves all session data in place.
- If dirty state is clean and known, Close Workspace clears workspace session data and logs each removed key.
- Session Inspector V2 Delete and Delete All remain explicit user actions and continue to log removed keys.

## Save Behavior
- Save refreshes the active workspace context from normalized tool session data.
- Save persists the refreshed context to the current Workspace Manager V2 session context key.
- Save marks dirty enabled tool sessions clean after the refreshed context is persisted.
- Tool tiles refresh dirty status after Save.

## Preview Generator V2 Root Handle
- Workspace launch now logs:
  - repo display label
  - repo root path string
  - repo FileSystemDirectoryHandle presence
  - verified handle root name
  - handle resolution for `games/<game>/assets/images`
- Missing folder failures log:
  - requested relative folder
  - handle root name
  - display repoRoot string
  - session key used
- Preview Generator V2 now requires handle read-back verification before logging `OK WRITE`.
- When absolute path strings and handle-relative paths differ, both are logged and the mismatch is flagged.

## Guardrails
- No hidden fallback paths were added.
- No direct cross-tool communication was added.
- No sample JSON was modified.
- No roadmap content was modified.

## Skipped
- Full samples smoke test was skipped by request. The changed behavior is covered by Workspace V2 targeted and full Playwright validation.
