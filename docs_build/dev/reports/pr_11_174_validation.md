# PR 11.174 Validation

## Scope
Implemented the final hosted SVG entry wiring so `tools/SVG Asset Studio/main.js` owns entry into `tools/shared/workspaceShell.js` for Workspace Manager-hosted SVG launches.

## Files changed
- `tools/SVG Asset Studio/main.js`
- `tools/SVG Asset Studio/index.html`
- `tools/shared/platformShell.js`
- `docs_build/dev/reports/pr_11_174_validation.md`

Existing required paths verified in the current working tree:
- `tools/shared/workspaceShell.js`
- `tools/Workspace Manager/main.js`

## Hosted SVG entry detection
`tools/SVG Asset Studio/main.js` now detects hosted SVG Workspace mode with:
- `hosted=1`
- `hostToolId=svg-asset-studio`
- non-empty `hostContextId`

When true, it logs `[SVG_HOSTED_WORKSPACE_ENTRY]`, marks the document with `data-workspace-shell-active="svg-asset-studio"`, and imports `../shared/workspaceShell.js` directly.

## Platform shell badge behavior
`tools/SVG Asset Studio/index.html` no longer imports `platformShell.js` for the hosted SVG iframe path. It imports `platformShell.js` only for non-hosted SVG launches.

`tools/shared/platformShell.js` also has a hosted SVG badge guard. If the deprecated path is reached for hosted SVG, `renderToolAssetBadge("svg-asset-studio")` logs `[PLATFORM_SHELL_DEPRECATED_HOSTED_BLOCK]` and returns no badge instead of writing `Asset: none`.

## Workspace shell contract
Verified current `tools/shared/workspaceShell.js` behavior:
- Reads hosted session context via `readToolHostSharedContextFromLocation(window.location)`.
- Reads `payloadJson.vectorAssetDocument`.
- Sets `loaded=true` only when `vectorAssetDocument.svgText` is non-empty.
- Sets `assetLabel` to `sourceName`, else `Inline SVG` when loaded, else `none`.
- Logs `[WORKSPACE_SHELL_STATE]`.
- Posts `type: tools:workspace-shell-state` and logs `[SVG_POSTMESSAGE_SEND]`.

## Workspace Manager receive path
Verified current `tools/Workspace Manager/main.js` behavior:
- Listens for `tools:workspace-shell-state`.
- Logs `[SVG_POSTMESSAGE_RECEIVE]`.
- Matches the mounted iframe by `toolId` and `hostContextId`.
- Updates the SVG tile from normalized workspace shell state and logs `[SVG_TILE_WRITE]`.

## Console proof logs expected in manual UAT
- `[SVG_HOSTED_WORKSPACE_ENTRY]`
- `[WORKSPACE_SHELL_STATE]`
- `[SVG_POSTMESSAGE_SEND]`
- `[SVG_POSTMESSAGE_RECEIVE]`
- `[SVG_TILE_WRITE]`
- `[PLATFORM_SHELL_DEPRECATED_HOSTED_BLOCK]` only if the deprecated platformShell hosted SVG badge path is attempted

## Validation
- PASS: `node --check "tools/SVG Asset Studio/main.js"`
- PASS: `node --check tools/shared/workspaceShell.js`
- PASS: `node --check tools/shared/platformShell.js`
- PASS: `node --check "tools/Workspace Manager/main.js"`

## Manual UAT
Not run in this terminal session. Required browser UAT remains:
- Open sample 1902.
- Launch Workspace Manager.
- Mount SVG Asset Studio.
- Confirm console includes the required proof logs.
- Confirm badge shows the actual SVG `sourceName`, not `Asset: none`.

## Full samples smoke
Skipped. Reason: targeted SVG hosted-entry wiring; full samples smoke takes about 20 minutes and is not required.
