# Workspace V2 Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `workspace-v2`
Source folder: `tools/workspace-v2`

## 1. Tool Purpose
Validate and launch tool state sessions, manage saved tool state copies, and export workspace manifests without owning tool JSON internals.

## 2. Folder/Files Inspected
- `tools/workspace-v2/index.html`
- `tools/workspace-v2/index.js`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 30, inputs 3, selects 5, textareas 2, tables 0, inferred DOM controls/panels 53.
- `tools/workspace-v2/index.html`: button[button] #workspaceV2BackButton - Back to Tools Index
- `tools/workspace-v2/index.html`: select #workspaceV2ToolSelect - Asset Manager V2 SVG Asset Studio V2 Tilemap Studio V2 Vector Map Editor V2
- `tools/workspace-v2/index.html`: button[button] #workspaceV2LoadFixtureButton - Load Tool State
- `tools/workspace-v2/index.html`: button[button] #workspaceV2LaunchButton - Create & Open Tool State
- `tools/workspace-v2/index.html`: button[button] #workspaceV2CreateDirectToolsEntryButton - Create Direct Tools Entry
- `tools/workspace-v2/index.html`: button[button] #workspaceV2PromoteActiveToolStateButton - Promote Active Tool State to Tools
- `tools/workspace-v2/index.html`: input[text] #workspaceV2ToolStateName - tool-state-id
- `tools/workspace-v2/index.html`: button[button] #workspaceV2SaveToolStateButton - Save Tool State
- `tools/workspace-v2/index.html`: button[button] #workspaceV2OverwriteToolStateButton - Overwrite Tool State
- `tools/workspace-v2/index.html`: button[button] #workspaceV2LoadToolStateButton - Load Tool State
- `tools/workspace-v2/index.html`: button[button] #workspaceV2DeleteToolStateButton - Delete Saved Tool State
- `tools/workspace-v2/index.html`: button[button] #workspaceV2OpenAssetManagerButton - Open Asset Manager V2 (no tool state)
- `tools/workspace-v2/index.html`: textarea #workspaceV2ImportJson - {
- `tools/workspace-v2/index.html`: input[file] #workspaceV2ImportFile - workspaceV2ImportFile
- `tools/workspace-v2/index.html`: button[button] #workspaceV2ImportButton - Import Workspace Tool State JSON
- `tools/workspace-v2/index.html`: button[button] #workspaceV2ExportButton - Export Workspace Tool State JSON
- `tools/workspace-v2/index.html`: textarea #workspaceV2ShareUrl - https://.../tools/workspace-v2/index.html?toolState=...
- `tools/workspace-v2/index.html`: button[button] #workspaceV2CreateShareLinkButton - Create Share Link
- `tools/workspace-v2/index.html`: button[button] #workspaceV2ApplyShareLinkButton - Apply Share Link
- `tools/workspace-v2/index.html`: button[button] #workspaceV2RefreshToolStateHistoryButton - Refresh Recent Tool States
- `tools/workspace-v2/index.html`: select #workspaceV2DiffLeftSelect - workspaceV2DiffLeftSelect
- `tools/workspace-v2/index.html`: select #workspaceV2DiffRightSelect - workspaceV2DiffRightSelect
- `tools/workspace-v2/index.html`: button[button] #workspaceV2ComputeDiffButton - Compute Diff
- `tools/workspace-v2/index.html`: select #workspaceV2MergeLeftSelect - workspaceV2MergeLeftSelect
- `tools/workspace-v2/index.html`: select #workspaceV2MergeRightSelect - workspaceV2MergeRightSelect
- `tools/workspace-v2/index.html`: button[button] #workspaceV2ComputeMergeButton - Preview Merge (Dry Run)
- `tools/workspace-v2/index.html`: button[button] #workspaceV2ConfirmMergeButton - Confirm Preview
- `tools/workspace-v2/index.html`: button[button] #workspaceV2ApplyMergeButton - Apply Merge
- `tools/workspace-v2/index.html`: button[button] #workspaceV2UndoLastMergeButton - Undo Last Merge
- `tools/workspace-v2/index.html`: input[text] #workspaceV2MergedToolStateId - tool-state-v2-merged-0000000000000
- `tools/workspace-v2/index.html`: button[button] #workspaceV2SaveMergedToolStateButton - Save Merged Tool State
- `tools/workspace-v2/index.html`: button[button] #workspaceV2UseMergedInDiffMergeButton - Use in Diff/Merge
- `tools/workspace-v2/index.html`: button[button] #workspaceV2RefreshErrorLogsButton - Refresh Error Logs
- `tools/workspace-v2/index.html`: button[button] #workspaceV2ClearErrorLogsButton - Clear Error Logs
- `tools/workspace-v2/index.html`: button[button] #workspaceV2RefreshDiagnosticsButton - Refresh Diagnostics
- `tools/workspace-v2/index.html`: button[button] #workspaceV2ExportSnapshotButton - Export Runtime Snapshot
- `tools/workspace-v2/index.html`: button[button] #workspaceV2ClearSessionStorageButton - Clear Session Storage
- `tools/workspace-v2/index.html`: button[button] #workspaceV2ClearSavedToolStatesButton - Clear Saved Tool States
- `tools/workspace-v2/index.html`: button[button] #workspaceV2ResetClearErrorLogsButton - Clear Error Logs
- `tools/workspace-v2/index.html`: button[button] #workspaceV2FullResetButton - Full Reset
- `tools/workspace-v2/index.js`: select #workspaceV2ToolSelect - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2BackButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2LoadFixtureButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2LaunchButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2CreateDirectToolsEntryButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2PromoteActiveToolStateButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2OpenAssetManagerButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2ImportButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2ExportButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2CreateShareLinkButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2ApplyShareLinkButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2SaveToolStateButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2OverwriteToolStateButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2LoadToolStateButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2DeleteToolStateButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2LibraryStatus - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2LibraryEmptyState - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2ToolStateList - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2RefreshToolStateHistoryButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2ToolStateHistoryEmptyState - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2ToolStateHistoryList - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: select #workspaceV2DiffLeftSelect - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: select #workspaceV2DiffRightSelect - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2DiffSelectionState - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2ComputeDiffButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2DiffEnableState - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2DiffEmptyState - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2DiffOutput - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: select #workspaceV2MergeLeftSelect - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: select #workspaceV2MergeRightSelect - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2MergeSelectionState - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2ComputeMergeButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2ConfirmMergeButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2ApplyMergeButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2MergeEnableState - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2MergeEmptyState - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2SaveMergedToolStateButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2UseMergedInDiffMergeButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2UndoLastMergeButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2MergedToolStateStatus - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2MergeOutput - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2RefreshErrorLogsButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2ClearErrorLogsButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2ErrorLogsEmptyState - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2ErrorLogsList - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2ClearSessionStorageButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2ClearSavedToolStatesButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2ResetClearErrorLogsButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: button #workspaceV2FullResetButton - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2ActiveToolStatePublishStatus - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2Status - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2PublishedToolsList - inferred from JS DOM lookup
- `tools/workspace-v2/index.js`: panel #workspaceV2ImportExportStatus - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/workspace-v2/index.html`: .hub-panel

## 4. Current Component/Class/Function Inventory
- `tools/workspace-v2/index.js`: class WorkspaceV2ToolStateProducer; function applyColors; function mergeValues; function scheduleUpdate; function updateColors; function walk; method activateWorkspaceToolState; method activePaletteHostContextId; method activeToolStatePublishStatusText; method addRecentToolStateEntry; method applyDefaultWorkspaceToolSelection; method applySelectedToolStateMerge; method applyShareLink; method applyToolStatePayload; method buildMergeSelectionKey; method buildRecentToolStateInventory; method buildToolLaunchUrl; method buildToolStateMergeCandidates; method buildWorkspaceSchemaDocument; method cleanupStaleInvalidSavedEntries; method clearDiffOutputForStateChange; method clearErrorLogs; method clearMergeOutputForSelectionChange; method clearMergePanelTransientState; method clearPersistedToolStateSelection; method clearSavedToolStates; method clearToolStateStorage; method cloneToolStateValue; method computeMergePreviewChanges; method computeNextWorkspaceTransitionState; method computeSelectedToolStateDiff; method computeSelectedToolStateMerge; method computeToolStateDiff; method computeWorkspaceToolStateUiStateModel; method computeWorkspaceTransitionStateFromModel; method confirmSelectedToolStateMergePreview; method conflictValuePreview; method copyPublishedToolToToolState; method copySavedToolStateIdToClipboard; method copyToolStateIdToClipboard; method createDirectToolsEntry; method createHostContextToolStateId; method createMergedHostContextId; method createProducerPayloadForTool; method createShareLink; method createToolStateAndLaunch; method currentDiffSelectionKey; method currentMergeSelectionKey; method decodeToolStateParamFromUrl; method decodeToolStatePayload; method defaultMergedToolStateId; method deleteNamedToolState; method deleteRecentToolStateEntry; method deleteSavedToolStateById; method encodeToolStatePayload; method ensureSelectedToolStateProducerToolId; method ensureWorkspaceActivePaletteBaseline; method exportWorkspaceToolStateJson; method findToolStateEntryByContextId; method findToolStateEntryById; ... 128 more

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/workspace.manifest.schema.json`. Required top-level fields: documentKind, schema, version, id, name, tools. Allowed top-level fields: $schema, documentKind, schema, version, id, name, tools. Workspace V2 also validates the nested `tools.workspace-v2` tool state contract in its own folder code.

JSON handling signals found: Blob/object URL, download/export, FileReader, hostContextId, JSON.parse, JSON.stringify, localStorage, safeParseJson, schema, sessionStorage, tools.*, toolState, validate.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the hosted session or workspace manifest contract, stay under the current size limits where enforced, and render or persist only after the tool-owned validation path succeeds.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing session data, wrong `toolId`, unsupported keys, wrong nested payload shape, and oversized payloads must produce an error state and block workspace writes or launches.

## 8. Tool-Owned JSON Responsibilities
- import/load: support-only; no standalone tool import flow unless a consuming script invokes it.
- validate: support-only validation helpers where present.
- edit/process: support modules may process values for callers; no workspace editing of internals.
- export/save: support-only unless a maintenance script writes its own artifact.
- publish to `tools.workspace-v2` if applicable: no standalone published output in this folder.
- copy/create toolState if applicable: yes where applicable: copy/create hosted `toolState` payloads using `version`, `toolId`, and `payloadJson` only.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
No `tools.*` game/sample output is owned by this folder in the reset design. Consuming tools may use helpers from this folder, but persisted game/sample payloads must come from the owning launchable tool.

## 11. Playwright Expectations
Open `tools/workspace-v2/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/workspace-v2/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Keep this folder support-only unless a future BUILD explicitly promotes a launchable/publishable contract.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P24: Workspace V2. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
