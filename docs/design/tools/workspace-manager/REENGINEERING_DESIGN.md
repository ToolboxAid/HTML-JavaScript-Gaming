# Workspace Manager Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `workspace-manager`
Source folder: `tools/Workspace Manager`

## 1. Tool Purpose
Launch and coordinate workspace-level tool sessions while leaving JSON import, validation, edit, and export behavior inside each tool.

## 2. Folder/Files Inspected
- `tools/Workspace Manager/how_to_use.html`
- `tools/Workspace Manager/index.html`
- `tools/Workspace Manager/main.js`
- `tools/Workspace Manager/README.md`
- `tools/Workspace Manager/toolHost.css`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 0, inputs 0, selects 0, textareas 0, tables 0, inferred DOM controls/panels 0.
- No buttons, inputs, selects, textareas, tables, or direct control lookups were found in the inspected files.
- Panels/surfaces found:
  - `tools/Workspace Manager/index.html`: .tool-host-workspace
  - `tools/Workspace Manager/index.html`: .tool-host-workspace__mount

## 4. Current Component/Class/Function Inventory
- `tools/Workspace Manager/main.js`: function applyToolsUsedFilterForGame; function applyWorkspaceShellStateToMountedTool; function bindEvents; function bindPagerDelegatedEvents; function bindPagerMessageBridge; function bindWorkspaceShellStateBridge; function bindWorkspaceToolTileClickHandlers; function classifyWorkspaceManifestTools; function deriveGameAssetCatalogPath; function extractWorkspaceManifestExplicitLaunchInputs; function getSelectedToolIndex; function inferAssetTypeFromDirectPayload; function init; function isPlainObject; function isWorkspaceManifestSource; function keyMatchesPropertyNameSchema; function launchWorkspaceToolFromClickedTile; function logWorkspaceManifestToolDiagnostics; function logWorkspaceToolLaunch; function mountGameFrame; function mountSelectedTool; function normalizeGameAssetCatalogEntries; function normalizeGameHref; function normalizeLocalHrefParam; function normalizeTextParam; function normalizeToken; function normalizeToolsUsedList; function normalizeWorkspaceShellMessageState; function observeWorkspaceToolTiles; function parseGameAssetCatalogPayload; function readDirectPayloadDocument; function readGameAssetCatalog; function readGameEntryById; function readInitialGameId; function readInitialToolId; function readLaunchUrlProof; function readRawToolIdFromQuery; function readRegistryEntryUrl; function readRequestedToolIdFromQuery; function readSamplePresetPathFromQuery; function readSelectedToolId; function readWorkspaceDirectCardLabel; function readWorkspaceManifestToolDiagnosticsFromSamplePreset; function readWorkspaceSchemaContract; function refreshPagerRefs; function renderMountDiagnostic; function resolveJsonPointer; function selectToolByOffset; function setCurrentLabel; function shouldBlockLoadedSvgWorkspaceTileOverwrite; function shouldMountGameFrameFromQuery; function summarizeDirectToolPayloadLabel; function syncControlState; function syncSelectedToolState; function traceSvgTileWrite; function traceWorkspaceRegistryResolve; function traceWorkspaceToolClick; function traceWorkspaceToolTileRender; function unmountGameFrame; function updateStandaloneHref; ... 12 more

## 5. JSON Schema/Input Contract Currently Expected
Workspace Manager launches and coordinates sessions. It does not own a publishable tool payload and should not validate or rewrite another tool JSON contract.

JSON handling signals found: download/export, hostContextId, JSON.stringify, schema, tools.*, validate.

## 6. Valid JSON Behavior
Valid JSON is only accepted when a consuming tool or support script explicitly calls this folder. There is no standalone publish/import flow owned by this folder.

## 7. Invalid JSON Rejection Behavior
Invalid JSON is rejected by the consuming helper/script path. This folder should not silently repair or publish malformed tool payloads.

## 8. Tool-Owned JSON Responsibilities
- import/load: support-only; no standalone tool import flow unless a consuming script invokes it.
- validate: support-only validation helpers where present.
- edit/process: support modules may process values for callers; no workspace editing of internals.
- export/save: support-only unless a maintenance script writes its own artifact.
- publish to `tools.workspace-manager` if applicable: no standalone published output in this folder.
- copy/create toolState if applicable: no.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
No `tools.*` game/sample output is owned by this folder in the reset design. Consuming tools may use helpers from this folder, but persisted game/sample payloads must come from the owning launchable tool.

## 11. Playwright Expectations
Open `tools/Workspace Manager/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/Workspace Manager/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Keep this folder support-only unless a future BUILD explicitly promotes a launchable/publishable contract.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P23: Workspace Manager. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
