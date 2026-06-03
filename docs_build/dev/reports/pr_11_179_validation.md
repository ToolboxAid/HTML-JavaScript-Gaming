# PR 11.179 Validation

## Scope
Implemented the hosted SVG tile writer path from `workspaceShell.js` to Workspace Manager.

## Files changed
- `toolbox/shared/workspaceShell.js`
- `toolbox/SVG Asset Studio/main.js`
- `toolbox/Workspace Manager/main.js`
- `docs_build/dev/reports/pr_11_179_validation.md`

Supporting files validated because they enforce the removed legacy paths:
- `toolbox/shared/platformShell.js`
- `toolbox/shared/assetUsageIntegration.js`

## Data flow
Hosted SVG now follows this path:

```text
SVG Asset Studio hosted iframe
  -> initWorkspaceShell()
  -> payloadJson.vectorAssetDocument
  -> normalized workspace shell state
  -> postMessage tools:workspace-shell-state
  -> Workspace Manager message bridge
  -> SVG tile label/status write
```

## workspaceShell result
`toolbox/shared/workspaceShell.js` now exports `initWorkspaceShell()`.

For hosted `svg-asset-studio`, it normalizes:
- `toolId: "svg-asset-studio"`
- `hostContextId`
- `contractType: "vectorAssetDocument"`
- `loaded: true` only when `payloadJson.vectorAssetDocument.svgText` is non-empty
- `assetLabel: vectorAssetDocument.sourceName || "Inline SVG"` when loaded
- `assetLabel: ""` when not loaded
- `statusLabel: "Loaded"` when loaded
- actionable `statusLabel` plus `errors` when the contract is missing or empty

It logs `[WORKSPACE_SHELL_STATE]` and posts `tools:workspace-shell-state` with `[SVG_POSTMESSAGE_SEND]`.

## SVG Asset Studio entry
Hosted SVG mode logs `[SVG_HOSTED_WORKSPACE_ENTRY]`, dynamically imports `workspaceShell.js`, and calls `initWorkspaceShell(window.location, document)`.

No shared handoff or palette-first logic was restored.

## Workspace Manager tile writer
Workspace Manager already listened for `tools:workspace-shell-state`; this PR keeps that path as the writer and tightens SVG behavior:
- matches by `toolId` and `hostContextId`
- writes loaded SVG tile labels from `assetLabel`
- writes status from `statusLabel`
- logs `[SVG_POSTMESSAGE_RECEIVE]`
- logs `[SVG_TILE_WRITE]`
- no longer formats missing SVG state as `none`
- skips `writeSharedBindingsFromDirectPayload(...)` for `svg-asset-studio`
- removed the old SVG direct-payload handoff priming writer

## Console evidence expected in manual UAT
- `[SVG_HOSTED_WORKSPACE_ENTRY]`
- `[WORKSPACE_SHELL_STATE]`
- `[SVG_POSTMESSAGE_SEND]`
- `[SVG_POSTMESSAGE_RECEIVE]`
- `[SVG_TILE_WRITE]`

Manual console capture was not run in this terminal session.

## Tile label result expected in manual UAT
For sample 1902, the SVG tile should show the actual `vectorAssetDocument.sourceName` such as `sample-0901-ship.svg`, or `Inline SVG` when the SVG text has no source name. It should not show `Asset: none`.

## Validation
- PASS: `node --check toolbox/shared/workspaceShell.js`
- PASS: `node --check "toolbox/SVG Asset Studio/main.js"`
- PASS: `node --check "toolbox/Workspace Manager/main.js"`
- PASS: `node --check toolbox/shared/platformShell.js`
- PASS: `node --check toolbox/shared/assetUsageIntegration.js`

## Full samples smoke
Skipped. Reason: targeted hosted SVG tile write path; full samples smoke takes about 20 minutes and is not required.
