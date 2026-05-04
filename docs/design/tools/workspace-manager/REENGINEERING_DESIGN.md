# Workspace Manager Transitional Reference

Task: PR_26124_022-tighten-tool-design-docs
Classification: global tool
Core priority: none
Source folder: `tools/Workspace Manager`

## Purpose
global launch coordinator retained as a reference. It must launch tools and pass launch payloads only.

This folder is not a normal rebuild target in the core tool roadmap. Keep it quarantined as a reference until a later PR explicitly asks to migrate, delete, or rebuild it.

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

## Boundary Rules
- Do not use this folder as the contract source for the rebuilt non-transitional tool.
- Use hosted payload or toolState wording for launch data.
- The only allowed browser storage wording is `sessionStorage` when referring to the API currently used by this transitional folder.
- Workspace and global launchers validate launch envelopes only; nested tool JSON remains owned by the rebuilt tool.

## Cleanup Trigger
Revisit this folder only after the corresponding core tool contract is rebuilt and validated. Cleanup choices should be explicit: migrate behavior, keep as reference, or delete in a deletion-scoped PR.
