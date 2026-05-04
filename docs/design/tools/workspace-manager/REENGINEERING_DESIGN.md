# Workspace Manager Reengineering Design

Task: PR_26124_024
Classification: transitional/quarantine tool
Core priority: deferred
Source folder: `tools/Workspace Manager`
Publish target: `reference-only shape under tools.workspace-manager`

## Tool Purpose
Reference-only quarantine folder for current Workspace Manager behavior. It is not a core rebuild anchor for tool JSON ownership.

## Folder/Files Inspected
- `tools/Workspace Manager/how_to_use.html`
- `tools/Workspace Manager/index.html`
- `tools/Workspace Manager/main.js`
- `tools/Workspace Manager/README.md`
- `tools/Workspace Manager/toolHost.css`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/Workspace Manager`: no HTML input/button/select/textarea/table controls found | No current control action found in this folder. | No transitional workspace-manager launch payload JSON effect is currently exposed by HTML controls. |

## Panels And Surfaces Found
- `tools/Workspace Manager/how_to_use.html`: `.tools-platform-surface`

## Current Component/Class/Function Inventory
- `tools/Workspace Manager/main.js`: applyToolsUsedFilterForGame; applyWorkspaceShellStateToMountedTool; bindEvents; bindPagerDelegatedEvents; bindPagerMessageBridge; bindWorkspaceShellStateBridge; bindWorkspaceToolTileClickHandlers; classifyWorkspaceManifestTools; deriveGameAssetCatalogPath; extractWorkspaceManifestExplicitLaunchInputs; getSelectedToolIndex; inferAssetTypeFromDirectPayload; init; isPlainObject; isWorkspaceManifestSource; keyMatchesPropertyNameSchema; launchWorkspaceToolFromClickedTile; logWorkspaceManifestToolDiagnostics; logWorkspaceToolLaunch; mountGameFrame; mountSelectedTool; normalizeGameAssetCatalogEntries; normalizeGameHref; normalizeLocalHrefParam; normalizeTextParam; normalizeToken; normalizeToolsUsedList; normalizeWorkspaceShellMessageState; observeWorkspaceToolTiles; onMounted; onStatus; onUnmounted; parseGameAssetCatalogPayload; readDirectPayloadDocument; readGameAssetCatalog; readGameEntryById; readInitialGameId; readInitialToolId; readLaunchUrlProof; readRawToolIdFromQuery; readRegistryEntryUrl; readRequestedToolIdFromQuery; readSamplePresetPathFromQuery; readSelectedToolId; readWorkspaceDirectCardLabel; readWorkspaceManifestToolDiagnosticsFromSamplePreset; readWorkspaceSchemaContract; refreshPagerRefs; renderMountDiagnostic; resolveJsonPointer; selectToolByOffset; setCurrentLabel; shouldBlockLoadedSvgWorkspaceTileOverwrite; shouldMountGameFrameFromQuery; summarizeDirectToolPayloadLabel; syncControlState; syncSelectedToolState; traceSvgTileWrite; traceWorkspaceRegistryResolve; traceWorkspaceToolClick; traceWorkspaceToolTileRender; unmountGameFrame; updateStandaloneHref; updateSwitchMeta; validateBranchSchema; validateJsonValueAgainstSchema; validateNode; writeQueryToolId; writeSelectedToolId; writeSharedBindingsFromDirectPayload; writeStatus; writeSwitchMeta

## Target Controls
Keep:
- current visible controls only as reference for later cleanup

Remove or rename:
- do not carry this folder into the core rebuild lane

Add:
- no core rebuild controls in this PR

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for transitional workspace-manager launch payload. No core schema contract is assigned to this transitional/reference folder.
Required keys: none assigned for this reference folder.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: treat transitional workspace-manager launch payload behavior as reference-only evidence from this exact folder
- validate: do not assign a core schema contract to Workspace Manager in this PR
- edit/process: do not define new rebuild-owned JSON fields from Workspace Manager
- export/save: no core export/save contract is assigned to tools.workspace-manager
- publish: tools.workspace-manager remains a reference-only null published-output shape
- copy/create payload: no core payload copy/create behavior is assigned until a later cleanup PR

## Valid JSON Behavior
- accepted only as the current transitional reference behavior found in this exact folder

## Invalid JSON Rejection Behavior
- any attempt to use this folder as the core rebuild contract
- any behavior that conflicts with the rebuilt core tool contract when cleanup occurs later

## Published Output
Published Output:
```jsonc
tools.workspace-manager = {
  "publishedOutput": null,
  "status": "transitional-reference-only"
}
```

## Playwright Expectations
- load tools/Workspace Manager/index.html only if later cleanup needs a reference screenshot
- do not use this folder for core publish-contract verification

## Manual Test Expectations
- Inspect tools/Workspace Manager only as a deferred reference surface.
- Do not rebuild from this folder unless a later cleanup PR explicitly scopes it.

## Known Gaps
- Deferred cleanup after core tool contracts are rebuilt and stable.

## Rebuild Order Priority
Deferred transitional/reference cleanup. Do not place this folder in the core rebuild lane.
