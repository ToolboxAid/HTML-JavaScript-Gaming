# PR_26128_012 Session Inspector V2 Deep Rename

## Summary
Session Inspector was deep-renamed to Session Inspector V2 and moved to `toolbox/session-inspector-v2/**`.

## Runtime Changes
- Removed the old `toolbox/session-inspector/**` tool path.
- Added `toolbox/session-inspector-v2/**` with V2 class names, file names, CSS classes, data attributes, DOM ids, runtime contract, and page labels.
- Updated `toolbox/toolRegistry.js` to register only `session-inspector-v2`.
- Updated tools index grouping and shared platform shell references from `session-inspector` to `session-inspector-v2`.
- Added Session Inspector V2 to Workspace Manager V2 launchable tool tiles.
- Added Workspace Manager V2 index metadata for the Session Inspector V2 tool surface.
- Added per-entry Delete controls and a Delete All control.
- Delete actions refresh the displayed storage list immediately and log `OK`, `WARN`, or `FAIL` status entries.

## Boundaries
- No cross-tool communication was added.
- Preview Generator V2 session repo load behavior was not changed.
- No sample JSON was modified.
- Roadmap content was not modified.

## Validation
- `npm run test:workspace-v2`: PASS, 14 tests passed.
- Verified `toolbox/session-inspector-v2/**` exists.
- Verified `toolbox/session-inspector/**` is removed.
- Verified old `session-inspector` registry/navigation ids are absent from active registry/index/shell/workspace-manager files.
- Verified Session Inspector V2 appears in tools index and Workspace Manager V2 tool UI.
- Verified Session Inspector V2 accordions open and close.
- Verified Session Inspector V2 theme uses shared V2 theme tokens.
- Verified per-entry Delete removes the session entry and updates UI immediately.
- Verified Delete All clears displayed session entries.
- Verified delete actions log `OK`, `WARN`, and `FAIL` entries.

## Skipped
Full samples smoke test was skipped as requested. This PR is scoped to Session Inspector V2 rename, Workspace Manager V2 registration, and storage deletion behavior; the targeted workspace V2 suite covers those affected launch/UI paths.
