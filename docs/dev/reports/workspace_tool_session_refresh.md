# Workspace Tool Session Refresh

## Scope
- Added Workspace Manager V2 refresh-from-session behavior after tool session hydration.
- Workspace Manager V2 now refreshes active tool display data from normalized `workspace.tools.<tool-id>` session objects.
- Palette Manager V2 return refresh updates the Palette Manager V2 tile from `workspace.tools.palette-manager-v2.data.swatches`.
- Tool tiles expose normalized dirty status from each tool session.
- Asset Manager V2 now reads both its asset payload and the active palette from normalized session keys on launch.
- Asset Manager V2 writes asset changes back to `workspace.tools.asset-manager-v2`.

## Session Rules
- Workspace Manager V2 hydrates manifest defaults only when a normalized tool session is missing or invalid for the current game/context.
- Valid dirty sessions are preserved when returning from a tool.
- Workspace Manager V2 refreshes its active context from normalized session `data` before rendering tool counts and before later launches/exports.
- Asset Manager V2 reads:
  - `workspace.tools.asset-manager-v2.data.assets`
  - `workspace.tools.palette-manager-v2.data.swatches`
- Asset Manager V2 writes:
  - `workspace.tools.asset-manager-v2.data.assets`
  - `workspace.tools.asset-manager-v2.dirty`

## Dirty Tracking
- Palette Manager V2 dirty data continues to use `reason: "palette-updated"`.
- Asset Manager V2 dirty data now uses `reason: "asset-updated"` when asset data changes.
- Asset Manager V2 dirty updates include:
  - `isDirty: true`
  - `changedAt`: current ISO timestamp
  - `changedKeys`: changed asset data paths.
- Returning to Workspace Manager V2 without asset data changes does not create a new dirty timestamp.

## Validation Notes
- Palette edits update session data and dirty tracking.
- Returning to Workspace Manager V2 updates the Palette Manager V2 tile from 11 to 12 swatches.
- Workspace Manager V2 reflects Palette Manager V2 dirty status from the normalized session.
- Reopening Palette Manager V2 reloads the edited swatch from session.
- Asset Manager V2 loads the edited palette swatch from `workspace.tools.palette-manager-v2.data`.
- Asset Manager V2 writes a new color asset to `workspace.tools.asset-manager-v2.data` and marks its dirty object.
- Returning to Workspace Manager V2 updates Asset Manager V2 from 14 to 15 managed assets.

## Guardrails
- No `game.manifest.json` write path was added.
- No direct cross-tool communication was added.
- Session storage remains the integration boundary.
- No sample JSON was modified.
- No roadmap content was modified.

## Skipped
- Full samples smoke test was skipped by request. The affected Workspace Manager V2, Palette Manager V2, Asset Manager V2, Preview Generator V2, and Session Inspector V2 session paths are covered by `npm run test:workspace-v2`.
