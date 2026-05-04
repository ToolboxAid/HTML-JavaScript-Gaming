# Workspace Manager Transitional Reference

Task: PR_26124_023-finalize-tool-design-docs
Classification: transitional/quarantine tool
Core priority: none
Source folder: `tools/Workspace Manager`

## Purpose
Transitional/global launcher reference. It may mount tools and pass launch payloads; it must not define core tool JSON contracts.

This folder is not a core rebuild anchor. Keep it as a deferred reference until a later cleanup PR explicitly chooses to migrate, retain, or delete it.

## Exact Folder/Files Inspected
- `tools/Workspace Manager/how_to_use.html`
- `tools/Workspace Manager/index.html`
- `tools/Workspace Manager/main.js`
- `tools/Workspace Manager/README.md`
- `tools/Workspace Manager/toolHost.css`

## Current Controls Found
- none found

## Current Functions And Classes
- `tools/Workspace Manager/main.js`: function applyToolsUsedFilterForGame; function applyWorkspaceShellStateToMountedTool; function bindEvents; function bindPagerDelegatedEvents; function bindPagerMessageBridge; function bindWorkspaceShellStateBridge; function bindWorkspaceToolTileClickHandlers; function classifyWorkspaceManifestTools; function deriveGameAssetCatalogPath; function extractWorkspaceManifestExplicitLaunchInputs; function getSelectedToolIndex; function inferAssetTypeFromDirectPayload; function init; function isPlainObject; function isWorkspaceManifestSource; function keyMatchesPropertyNameSchema; function launchWorkspaceToolFromClickedTile; function logWorkspaceManifestToolDiagnostics; function logWorkspaceToolLaunch; function mountGameFrame; function mountSelectedTool; function normalizeGameAssetCatalogEntries; function normalizeGameHref; function normalizeLocalHrefParam; function normalizeTextParam; function normalizeToken; function normalizeToolsUsedList; function normalizeWorkspaceShellMessageState; function observeWorkspaceToolTiles; function parseGameAssetCatalogPayload; function readDirectPayloadDocument; function readGameAssetCatalog; function readGameEntryById; function readInitialGameId; function readInitialToolId; function readLaunchUrlProof; function readRawToolIdFromQuery; function readRegistryEntryUrl; function readRequestedToolIdFromQuery; function readSamplePresetPathFromQuery; function readSelectedToolId; function readWorkspaceDirectCardLabel; function readWorkspaceManifestToolDiagnosticsFromSamplePreset; function readWorkspaceSchemaContract; function refreshPagerRefs; function renderMountDiagnostic; function resolveJsonPointer; function selectToolByOffset; function setCurrentLabel; function shouldBlockLoadedSvgWorkspaceTileOverwrite; function shouldMountGameFrameFromQuery; function summarizeDirectToolPayloadLabel; function syncControlState; function syncSelectedToolState; function traceSvgTileWrite; function traceWorkspaceRegistryResolve; function traceWorkspaceToolClick; function traceWorkspaceToolTileRender; function unmountGameFrame; function updateStandaloneHref; function updateSwitchMeta; function validateBranchSchema; function validateJsonValueAgainstSchema; function validateNode; function writeQueryToolId; function writeSelectedToolId; function writeSharedBindingsFromDirectPayload; function writeStatus; function writeSwitchMeta; method onMounted; method onStatus; method onUnmounted

## Quarantine Rules
- Do not use this folder as the JSON contract source for a core rebuild.
- Hosted payload or toolState behavior documented here is transitional reference behavior only.
- Browser storage details are reference-only and must not become a rebuilt core tool contract.
- Core tool docs must not import V2 behavior from this folder.
