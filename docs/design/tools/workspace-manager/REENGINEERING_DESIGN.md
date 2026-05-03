# Workspace Manager Reengineering Design (workspace-manager)

## Purpose
- See tool runtime file for current behavior.

## Current V1 Capability
- Not part of V1 active registry.
- Runtime entry point: `Workspace Manager/index.html`.
- Runtime implementation file: `tools/Workspace Manager/main.js`.

## Current V2 / Workspace Status
- Status not fully audited in current Workspace V2 lane.
- Workspace integration classification:
  - global tool: yes
  - toolState-capable tool: no
  - published `tools.*` output candidate: no
- Readiness: Needs additional schema/contract alignment

## Expected JSON Schema/Input
- Schema contract is not yet explicitly defined in `tools/schemas/tools` for this tool id.

## Valid JSON Load Behavior (Target)
- Parse incoming tool payload once.
- Validate against the tool schema/contract before rendering.
- Render the fully valid state and expose clear contract readout text.

## Invalid JSON Rejection Behavior (Target)
- Reject before rendering domain state.
- Show one clear actionable invalid message.
- Avoid fallback/default injections and avoid mutating inbound payload structure.

## Current Components/Functions
- Top-level functions: `deriveGameAssetCatalogPath()`, `normalizeGameAssetCatalogEntries()`, `parseGameAssetCatalogPayload()`, `refreshPagerRefs()`, `normalizeTextParam()`, `normalizeToken()`, `readRegistryEntryUrl()`, `traceWorkspaceRegistryResolve()`, `traceWorkspaceToolTileRender()`, `traceWorkspaceToolClick()`, `launchWorkspaceToolFromClickedTile()`, `bindWorkspaceToolTileClickHandlers()`, `observeWorkspaceToolTiles()`, `normalizeToolsUsedList()`, `normalizeLocalHrefParam()`, `isPlainObject()`, `readDirectPayloadDocument()`, `inferAssetTypeFromDirectPayload()`, `summarizeDirectToolPayloadLabel()`, `readWorkspaceDirectCardLabel()`, `writeSharedBindingsFromDirectPayload()`, `readLaunchUrlProof()`, `logWorkspaceToolLaunch()`, `resolveJsonPointer()`, `validateJsonValueAgainstSchema()`, `validateNode()`, `readSamplePresetPathFromQuery()`, `isWorkspaceManifestSource()`, `classifyWorkspaceManifestTools()`, `extractWorkspaceManifestExplicitLaunchInputs()`, `logWorkspaceManifestToolDiagnostics()`, `readSelectedToolId()`, `writeSelectedToolId()`, `traceSvgTileWrite()`, `shouldBlockLoadedSvgWorkspaceTileOverwrite()`, `writeStatus()`, `renderMountDiagnostic()`, `setCurrentLabel()`, `writeSwitchMeta()`, `getSelectedToolIndex()`, `updateSwitchMeta()`, `selectToolByOffset()`, `updateStandaloneHref()`, `writeQueryToolId()`, `readInitialToolId()`, `readRequestedToolIdFromQuery()`, `readRawToolIdFromQuery()`, `readInitialGameId()`, `shouldMountGameFrameFromQuery()`, `normalizeGameHref()`, `unmountGameFrame()`, `syncControlState()`, `syncSelectedToolState()`, `applyToolsUsedFilterForGame()`, `bindPagerDelegatedEvents()`, `bindPagerMessageBridge()`, `normalizeWorkspaceShellMessageState()`, `applyWorkspaceShellStateToMountedTool()`, `bindWorkspaceShellStateBridge()`, `mountSelectedTool()`, `bindEvents()`.

## Target Components/Functions
- Separate explicit JSON contract functions (`import`, `validate`, `load`, `export`) from view-only rendering methods.
- Keep tool-specific logic inside the tool runtime; avoid Workspace V2 owning tool-specific compare/merge/edit behavior.
- Keep one visible invalid-state path that blocks render before any partial state draws.

## Tool-Owned JSON Functions
- Import: `parseGameAssetCatalogPayload()`, `readRegistryEntryUrl()`, `readDirectPayloadDocument()`, `inferAssetTypeFromDirectPayload()`, `summarizeDirectToolPayloadLabel()`, `readWorkspaceDirectCardLabel()`, `writeSharedBindingsFromDirectPayload()`, `readLaunchUrlProof()`, `readSamplePresetPathFromQuery()`, `readSelectedToolId()`, `shouldBlockLoadedSvgWorkspaceTileOverwrite()`, `readInitialToolId()`, `readRequestedToolIdFromQuery()`, `readRawToolIdFromQuery()`, `readInitialGameId()`
- Validate: `normalizeGameAssetCatalogEntries()`, `normalizeTextParam()`, `normalizeToken()`, `normalizeToolsUsedList()`, `normalizeLocalHrefParam()`, `validateJsonValueAgainstSchema()`, `validateNode()`, `normalizeGameHref()`, `normalizeWorkspaceShellMessageState()`
- Edit/process: `traceWorkspaceToolTileRender()`, `readDirectPayloadDocument()`, `renderMountDiagnostic()`, `updateSwitchMeta()`, `updateStandaloneHref()`, `applyToolsUsedFilterForGame()`, `applyWorkspaceShellStateToMountedTool()`
- Export: `writeSharedBindingsFromDirectPayload()`
- Add/copy to Workspace toolState: `writeSharedBindingsFromDirectPayload()`, `writeSelectedToolId()`, `traceSvgTileWrite()`, `shouldBlockLoadedSvgWorkspaceTileOverwrite()`, `writeStatus()`, `writeSwitchMeta()`, `writeQueryToolId()`
- Publish to `tools.workspace-manager`: Not currently a published tools.* ownership target.
- Compare/merge for own schema: Not currently tool-local; Workspace V2 has cross-toolState compare/merge UI today.

## Workspace Integration Contract
- Workspace launch path exists via tools index/workspace-manager registry entry points.
- Explicit Workspace V2 toolState contract is not yet completed for this tool.

## Playwright Expectations
- Valid payload path should show visible valid-state surface.
- Invalid payload path should show visible invalid-state surface and hide valid state.
- Workspace launch handoff should open the tool with hostContext/toolState payload when applicable.

## Manual Test Expectations
- Launch from `tools/index.html` and confirm baseline UI renders.
- Launch from Workspace V2 when applicable and confirm payload handoff path.
- Provide an invalid JSON contract and confirm the tool blocks render with explicit error.

## Known Gaps
- No dedicated tool schema reference found under `tools/schemas/tools` for this tool id.
