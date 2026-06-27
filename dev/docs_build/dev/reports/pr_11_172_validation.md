# PR 11.172 Validation

## Scope
Implemented the decisive hosted SVG badge source-of-truth fix without schema or sample JSON changes.

## Runtime wiring
- `toolbox/SVG Asset Studio/index.html` now gates hosted SVG mode on all three required URL params: `hosted=1`, `hostToolId=svg-asset-studio`, and a non-empty `hostContextId`.
- Hosted SVG mode imports `toolbox/shared/workspaceShell.js` directly and does not import `toolbox/shared/platformShell.js` for that hosted iframe instance.
- Standalone/non-hosted SVG Asset Studio still imports `toolbox/shared/platformShell.js`.

## Workspace shell state
- `toolbox/shared/workspaceShell.js` reads hosted context with `readToolHostSharedContextFromLocation(window.location)`.
- SVG hosted contract reads `payloadJson.vectorAssetDocument`.
- `loaded` is true only when `vectorAssetDocument.svgText` is non-empty.
- `assetLabel` is `sourceName`, else `Inline SVG` when SVG text exists, else `none` when not loaded.
- Posted message remains `type: tools:workspace-shell-state` with normalized state payload.

## Workspace Manager protection
- `toolbox/Workspace Manager/main.js` continues to receive `tools:workspace-shell-state`, match by `toolId` and `hostContextId`, and update the mounted SVG tile from `assetLabel` when loaded.
- After a loaded SVG workspace-shell state is applied, generic legacy label writes that would replace the protected loaded SVG label are skipped and logged with `[SVG_TILE_WRITE_BLOCKED_LEGACY]`.

## Proof logs
- `[WORKSPACE_SHELL_STATE]`
- `[SVG_POSTMESSAGE_SEND]`
- `[SVG_POSTMESSAGE_RECEIVE]`
- `[SVG_TILE_WRITE]`
- `[SVG_TILE_WRITE_BLOCKED_LEGACY]`

## Validation
- PASS: `node --check toolbox/shared/workspaceShell.js`
- PASS: `node --check toolbox/shared/platformShell.js`
- PASS: `node --check "toolbox/Workspace Manager/main.js"`
- PASS: `node --check "toolbox/SVG Asset Studio/main.js"`

## Manual UAT
Not run in this terminal session. Required browser UAT remains:
- Open sample 1902.
- Launch Workspace Manager.
- Mount SVG Asset Studio.
- Confirm badge shows the actual `sourceName`, not `Asset: none`.
- Confirm Vector Map Editor still works.
- Confirm no console errors.

## Full samples smoke
Skipped. Reason: targeted hosted SVG shell/tile source-of-truth fix; full samples smoke takes about 20 minutes and is not required.
