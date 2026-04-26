# BUILD_PR_LEVEL_20_4_TOOL_LAUNCH_SSOT_AND_EXTERNAL_MEMORY_RESET Validation

## Scope Executed

- Updated sample external tool launch routing to use a single launch SSoT helper.
- Updated game workspace launch routing to use the same launch SSoT helper.
- Added external-launch memory reset before navigation for sample and game launch paths.
- Added visible launch validation surfacing for missing tool launch metadata.

## Files Changed

- `tools/shared/toolLaunchSSoT.js`
- `samples/index.render.js`
- `games/index.render.js`

## SSoT Change Summary

- Added `tools/shared/toolLaunchSSoT.js` as the launch SSoT for:
  - sample tool routes: `tools/<tool>/index.html`
  - game workspace route: `tools/Workspace Manager/index.html?game=<gameId>`
- Removed per-page direct route construction for game workspace links.
- Sample launch links now resolve through registry-backed tool lookup and explicit launch validation.

## External Memory Reset Summary

- Added `clearExternalToolWorkspaceMemory()` and `launchWithExternalToolWorkspaceReset()` in the SSoT helper.
- All hub-driven external launches in changed paths now clear `toolboxaid.*` keys from:
  - `localStorage`
  - `sessionStorage`
- Navigation then proceeds to the requested route without fallback routing.

## Validation Run

### Static validation performed

1. `node --check tools/shared/toolLaunchSSoT.js`
2. `node --check samples/index.render.js`
3. `node --check games/index.render.js`

### Anti-pattern checks performed

- No alias variable chains introduced.
- No pass-through variable chains introduced.
- No duplicate event listeners attached inside render loops.
- No fallback tool-routing behavior added.

## Required UAT Path Checklist

1. Open `samples/index.html`.
2. Click at least one tool tile.
3. Confirm browser opens `tools/<tool>/index.html`.
4. Confirm previous tool/workspace launch memory is cleared first.
5. Return to `games/index.html`.
6. Click a game tile.
7. Confirm browser opens `tools/Workspace Manager/index.html`.
8. Confirm previous workspace memory is cleared first.
9. Confirm the requested game/workspace then loads from SSoT data.
10. Confirm no tool silently loads through a default/fallback.

## Manual Browser UAT Execution Status

- Manual browser UAT was not executed in this CLI run.
- This report includes the exact required UAT checklist for manual verification.

## Roadmap

- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` was not modified in this build.
- No directly mapped status marker update was required for this scoped routing/reset recovery change.

