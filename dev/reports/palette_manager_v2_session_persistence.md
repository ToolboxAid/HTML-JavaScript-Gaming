# Palette Manager V2 Session Persistence

## Scope
- Updated Palette Manager V2 workspace launches to load palette data from the normalized session key `workspace.tools.palette-manager-v2`.
- Palette edits now update `workspace.tools.palette-manager-v2.data.swatches`.
- Palette edits now mark `workspace.tools.palette-manager-v2.dirty` as:
  - `isDirty: true`
  - `reason: "palette-updated"`
  - `changedAt`: current ISO timestamp
  - `changedKeys`: palette field/path list for the edit.
- Updated Workspace Manager V2 hydration so valid existing tool sessions for the same selected game are preserved instead of overwritten with manifest defaults.

## Session Boundary
- Preserved the normalized per-tool shape:
  - `schema`
  - `workspace`
  - `data`
  - `dirty`
- Preserved `workspace.repo.reference` as the repo session reference key.
- Palette Manager V2 reads and writes only session storage for this handoff.
- Workspace Manager V2 hydrates defaults only when a tool session key is missing or invalid for the current selected game/context.

## Persistence Behavior
- Launching Palette Manager V2 from Workspace Manager V2 loads `workspace.tools.palette-manager-v2.data`.
- Adding, updating, removing, pinning, importing, undoing, or redoing palette swatches persists the edited swatch list into session storage.
- Returning to Workspace Manager V2 preserves dirty palette session data.
- Reopening Palette Manager V2 shows the prior unsaved session edits.
- No `game.manifest.json` write path was added.

## Guardrails
- No cross-tool direct communication was added.
- No sample JSON was modified.
- No roadmap content was modified.
- No schema contract changes were made.

## Skipped
- Full samples smoke test was skipped by request. The changed surface is Workspace Manager V2 and Palette Manager V2 session launch/persistence behavior, covered by `npm run test:workspace-v2` and the targeted Palette Manager V2 launch persistence assertions.
