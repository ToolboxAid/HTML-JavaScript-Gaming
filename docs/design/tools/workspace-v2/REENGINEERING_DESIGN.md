# workspace-v2 Reengineering Design

Task: PR_26124_024
Classification: transitional/quarantine tool
Core priority: deferred
Source folder: `tools/workspace-v2`
Publish target: `reference-only shape under tools.workspace-v2`

## Tool Purpose
Reference-only quarantine folder for current workspace-v2 behavior. It is not a core rebuild anchor for tool JSON ownership.

## Folder/Files Inspected
- `tools/workspace-v2/index.html`
- `tools/workspace-v2/index.js`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/workspace-v2/index.html`: `input[text]#workspaceV2ToolStateName` - tool-state-id | Edits the active entry field. | Updates the draft transitional workspace-v2 launch payload field represented by `workspaceV2ToolStateName` before validation. |
| `tools/workspace-v2/index.html`: `input[file]#workspaceV2ImportFile` - workspaceV2ImportFile | Chooses a local file for transitional workspace-v2 launch payload import/load. | Replaces or merges tool-owned transitional workspace-v2 launch payload only after the import validates. |
| `tools/workspace-v2/index.html`: `input[text]#workspaceV2MergedToolStateId` - tool-state-v2-merged-0000000000000 | Edits the active entry field. | Updates the draft transitional workspace-v2 launch payload field represented by `workspaceV2MergedToolStateId` before validation. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2BackButton` - Back to Tools Index | Triggers the current transitional workspace-v2 launch payload UI action for `Back to Tools Index`. | May update draft transitional workspace-v2 launch payload data; tools.workspace-v2 publish must wait for validation. |
| `tools/workspace-v2/index.html`: `select#workspaceV2ToolSelect` - Asset Manager V2 SVG Asset Studio V2 Tilemap Studio V2 Vector Map Editor V2 | Edits the current transitional workspace-v2 launch payload through `workspaceV2ToolSelect`. | Updates draft transitional workspace-v2 launch payload data and requires validation before tools.workspace-v2 publish. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2LoadFixtureButton` - Load Tool State | Starts transitional workspace-v2 launch payload import/load. | Reads incoming JSON into the tool-owned transitional workspace-v2 launch payload only after validation succeeds. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2LaunchButton` - Create & Open Tool State | Creates or resets a draft transitional workspace-v2 launch payload. | Initializes tool-owned transitional workspace-v2 launch payload data; tools.workspace-v2 is unchanged until validation and publish/export. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2CreateDirectToolsEntryButton` - Create Direct Tools Entry | Creates or resets a draft transitional workspace-v2 launch payload. | Initializes tool-owned transitional workspace-v2 launch payload data; tools.workspace-v2 is unchanged until validation and publish/export. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2PromoteActiveToolStateButton` - Promote Active Tool State to Tools | Triggers the current transitional workspace-v2 launch payload UI action for `Promote Active Tool State to Tools`. | May update draft transitional workspace-v2 launch payload data; tools.workspace-v2 publish must wait for validation. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2SaveToolStateButton` - Save Tool State | Exports the validated transitional workspace-v2 launch payload. | Serializes the validated transitional workspace-v2 launch payload as the tools.workspace-v2 output shape. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2OverwriteToolStateButton` - Overwrite Tool State | Triggers the current transitional workspace-v2 launch payload UI action for `Overwrite Tool State`. | May update draft transitional workspace-v2 launch payload data; tools.workspace-v2 publish must wait for validation. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2LoadToolStateButton` - Load Tool State | Starts transitional workspace-v2 launch payload import/load. | Reads incoming JSON into the tool-owned transitional workspace-v2 launch payload only after validation succeeds. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2DeleteToolStateButton` - Delete Saved Tool State | Removes or clears the selected entry. | Deletes that data from the draft transitional workspace-v2 launch payload; publish waits for validation. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2OpenAssetManagerButton` - Open Asset Manager V2 (no tool state) | Starts transitional workspace-v2 launch payload import/load. | Reads incoming JSON into the tool-owned transitional workspace-v2 launch payload only after validation succeeds. |
| `tools/workspace-v2/index.html`: `textarea#workspaceV2ImportJson` - {"documentKind":"workspace-manifest","schema":"html-js-gaming.project","version":1,"id":"workspace-v2-example","name":"Workspace V2 Example","tools":{"palette-browser":{"schema":"html-js-gaming.palette","version":1,"name":"Workspace Active Palette","swatches":[]},"workspace-v2":{"schema":"html-js-gaming.workspace-v2-tool-state/1","game":{"id":"workspace-v2-game","name":"Workspace V2 Game"},"defaultToolId":"asset-manager-v2","activeToolId":"asset-manager-v2","activeHostContextId":"asset-manager-v2-0000000000000-aaaa1111","activeToolState":{"toolId":"asset-manager-v2","version":"v2","payloadJson":{"assetCatalog":{"name":"Workspace Assets","entries":[]}}},"savedToolStates":{}}}} | Edits the active entry field. | Updates the draft transitional workspace-v2 launch payload field represented by `workspaceV2ImportJson` before validation. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2ImportButton` - Import Workspace Tool State JSON | Starts transitional workspace-v2 launch payload import/load. | Reads incoming JSON into the tool-owned transitional workspace-v2 launch payload only after validation succeeds. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2ExportButton` - Export Workspace Tool State JSON | Exports the validated transitional workspace-v2 launch payload. | Serializes the validated transitional workspace-v2 launch payload as the tools.workspace-v2 output shape. |
| `tools/workspace-v2/index.html`: `textarea#workspaceV2ShareUrl` - https://.../tools/workspace-v2/index.html?toolState=... | Edits the active entry field. | Updates the draft transitional workspace-v2 launch payload field represented by `workspaceV2ShareUrl` before validation. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2CreateShareLinkButton` - Create Share Link | Creates or resets a draft transitional workspace-v2 launch payload. | Initializes tool-owned transitional workspace-v2 launch payload data; tools.workspace-v2 is unchanged until validation and publish/export. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2ApplyShareLinkButton` - Apply Share Link | Publishes or applies the validated transitional workspace-v2 launch payload. | Writes the validated output shape to tools.workspace-v2. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2RefreshToolStateHistoryButton` - Refresh Recent Tool States | Triggers the current transitional workspace-v2 launch payload UI action for `Refresh Recent Tool States`. | May update draft transitional workspace-v2 launch payload data; tools.workspace-v2 publish must wait for validation. |
| `tools/workspace-v2/index.html`: `select#workspaceV2DiffLeftSelect` - workspaceV2DiffLeftSelect | Edits the current transitional workspace-v2 launch payload through `workspaceV2DiffLeftSelect`. | Updates draft transitional workspace-v2 launch payload data and requires validation before tools.workspace-v2 publish. |
| `tools/workspace-v2/index.html`: `select#workspaceV2DiffRightSelect` - workspaceV2DiffRightSelect | Edits the current transitional workspace-v2 launch payload through `workspaceV2DiffRightSelect`. | Updates draft transitional workspace-v2 launch payload data and requires validation before tools.workspace-v2 publish. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2ComputeDiffButton` - Compute Diff | Triggers the current transitional workspace-v2 launch payload UI action for `Compute Diff`. | May update draft transitional workspace-v2 launch payload data; tools.workspace-v2 publish must wait for validation. |
| `tools/workspace-v2/index.html`: `select#workspaceV2MergeLeftSelect` - workspaceV2MergeLeftSelect | Edits the current transitional workspace-v2 launch payload through `workspaceV2MergeLeftSelect`. | Updates draft transitional workspace-v2 launch payload data and requires validation before tools.workspace-v2 publish. |
| `tools/workspace-v2/index.html`: `select#workspaceV2MergeRightSelect` - workspaceV2MergeRightSelect | Edits the current transitional workspace-v2 launch payload through `workspaceV2MergeRightSelect`. | Updates draft transitional workspace-v2 launch payload data and requires validation before tools.workspace-v2 publish. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2ComputeMergeButton` - Preview Merge (Dry Run) | Processes the current transitional workspace-v2 launch payload. | Updates tool-owned derived data/report fields that must validate before tools.workspace-v2 publish. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2ConfirmMergeButton` - Confirm Preview | Triggers the current transitional workspace-v2 launch payload UI action for `Confirm Preview`. | May update draft transitional workspace-v2 launch payload data; tools.workspace-v2 publish must wait for validation. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2ApplyMergeButton` - Apply Merge | Publishes or applies the validated transitional workspace-v2 launch payload. | Writes the validated output shape to tools.workspace-v2. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2UndoLastMergeButton` - Undo Last Merge | Triggers the current transitional workspace-v2 launch payload UI action for `Undo Last Merge`. | May update draft transitional workspace-v2 launch payload data; tools.workspace-v2 publish must wait for validation. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2SaveMergedToolStateButton` - Save Merged Tool State | Exports the validated transitional workspace-v2 launch payload. | Serializes the validated transitional workspace-v2 launch payload as the tools.workspace-v2 output shape. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2UseMergedInDiffMergeButton` - Use in Diff/Merge | Publishes or applies the validated transitional workspace-v2 launch payload. | Writes the validated output shape to tools.workspace-v2. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2RefreshErrorLogsButton` - Refresh Error Logs | Triggers the current transitional workspace-v2 launch payload UI action for `Refresh Error Logs`. | May update draft transitional workspace-v2 launch payload data; tools.workspace-v2 publish must wait for validation. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2ClearErrorLogsButton` - Clear Error Logs | Removes or clears the selected entry. | Deletes that data from the draft transitional workspace-v2 launch payload; publish waits for validation. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2RefreshDiagnosticsButton` - Refresh Diagnostics | Triggers the current transitional workspace-v2 launch payload UI action for `Refresh Diagnostics`. | May update draft transitional workspace-v2 launch payload data; tools.workspace-v2 publish must wait for validation. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2ExportSnapshotButton` - Export Runtime Snapshot | Exports the validated transitional workspace-v2 launch payload. | Serializes the validated transitional workspace-v2 launch payload as the tools.workspace-v2 output shape. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2ClearSessionStorageButton` - Clear Session Storage | Removes or clears the selected entry. | Deletes that data from the draft transitional workspace-v2 launch payload; publish waits for validation. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2ClearSavedToolStatesButton` - Clear Saved Tool States | Removes or clears the selected entry. | Deletes that data from the draft transitional workspace-v2 launch payload; publish waits for validation. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2ResetClearErrorLogsButton` - Clear Error Logs | Creates or resets a draft transitional workspace-v2 launch payload. | Initializes tool-owned transitional workspace-v2 launch payload data; tools.workspace-v2 is unchanged until validation and publish/export. |
| `tools/workspace-v2/index.html`: `button[button]#workspaceV2FullResetButton` - Full Reset | Creates or resets a draft transitional workspace-v2 launch payload. | Initializes tool-owned transitional workspace-v2 launch payload data; tools.workspace-v2 is unchanged until validation and publish/export. |

## Panels And Surfaces Found
- `tools/workspace-v2/index.html`: `.hub-panel`

## Current Component/Class/Function Inventory
- `tools/workspace-v2/index.js`: WorkspaceV2ToolStateProducer; activateWorkspaceToolState; activePaletteHostContextId; activeToolStatePublishStatusText; addRecentToolStateEntry; applyColors; applyDefaultWorkspaceToolSelection; applySelectedToolStateMerge; applyShareLink; applyToolStatePayload; buildMergeSelectionKey; buildRecentToolStateInventory; buildToolLaunchUrl; buildToolStateMergeCandidates; buildWorkspaceSchemaDocument; cleanupStaleInvalidSavedEntries; clearDiffOutputForStateChange; clearErrorLogs; clearMergeOutputForSelectionChange; clearMergePanelTransientState; clearPersistedToolStateSelection; clearSavedToolStates; clearToolStateStorage; cloneToolStateValue; computeMergePreviewChanges; computeNextWorkspaceTransitionState; computeSelectedToolStateDiff; computeSelectedToolStateMerge; computeToolStateDiff; computeWorkspaceToolStateUiStateModel; computeWorkspaceTransitionStateFromModel; confirmSelectedToolStateMergePreview; conflictValuePreview; copyPublishedToolToToolState; copySavedToolStateIdToClipboard; copyToolStateIdToClipboard; createDirectToolsEntry; createHostContextToolStateId; createMergedHostContextId; createProducerPayloadForTool; createShareLink; createToolStateAndLaunch; currentDiffSelectionKey; currentMergeSelectionKey; decodeToolStateParamFromUrl; decodeToolStatePayload; defaultMergedToolStateId; deleteNamedToolState; deleteRecentToolStateEntry; deleteSavedToolStateById; encodeToolStatePayload; ensureSelectedToolStateProducerToolId; ensureWorkspaceActivePaletteBaseline; exportWorkspaceToolStateJson; findToolStateEntryByContextId; findToolStateEntryById; firstToolStateProducerToolId; fixturePathForTool; formatSelectionLabel; fullReset; generatedToolStateIdForTool; groupErrorLogsByTool; handleDiffSelectionChange; handleImportFileDialogFocus; handleImportWorkspaceToolStateJsonClick; handleMergeSelectionChange; hasActiveWorkspaceToolStateForSave; hasFreshMergePreviewContext; hasWorkspaceActivePalette; importWorkspaceToolStateJson; initializeHiddenImportFileInput; initializeImportExportSectionStatusNode; initializeWorkspaceProducerToolState; initializeWorkspaceToolsSummaryNode; isBlockedAlternatePaletteToolState; isComparableObject; isPaletteManagerToolId; isPaletteToolStatePayload; isToolStateProducerToolId; isValidErrorLogEntry; isValidNewToolStateId; isValidToolStateHistoryEntry; isValidToolStatePayload; isWorkspaceTransitionAllowed; loadNamedToolState; loadSavedToolStateById; loadSelectedToolState; looksLikeWorkspaceHostContextId; mergeToolStatePayloads; mergeValues; normalizeFixtureToolStateContext; normalizePaletteFixtureSwatches; openAssetManagerFromWorkspace; overwriteSavedToolStateById; promoteActiveToolStateToWorkspaceTools; promoteSavedToolStateById; promoteToolStatePayloadToWorkspaceTools; pruneCompetingPaletteRecentToolStates; readActiveToolStatePayloadForLibraryActions; readErrorLogs; readImportFile; readInvalidPaletteSavedToolStateId; readLastMergedHostContextId; readPersistedToolStateSelection; readToolStateHistory; readToolStateLibrary; readToolStatePayloadForLibraryWrite; readToolStatePayloadForSaveAction; readToolStatePayloadFromRecentToolStateId; readWorkspaceToolsFromTextarea; recordMergeAuditEntry; refreshPaletteOwnershipStateAndUi; refreshPaletteOwnershipUiState; refreshWorkspaceToolStateUiStateModel; registerScrollTextColorRule; removeDiagnosticsPanelUi; removePaletteManagerProducerOption; renderActiveToolStatePublishStatus; renderErrorLogsViewer; renderMergeConflictSummary; renderToolStateDiffInputs; renderToolStateHistory; renderToolStateLibrary; renderToolStateMergeInputs; renderWorkspaceToolStateUiStateModel; renderWorkspaceToolsSummary; renderedPublishedTools; reopenToolStateHistoryEntry; requestWorkspaceTransition; resetUrlState; resolveActivePaletteForWorkspaceExport; resolveActiveToolStatePayloadForWorkspaceManifest; resolveAuthoritativeLastMergedHostContextId; resolvePersistedSelectionIds; resolveToolStatePayloadFromContextId; resolveWorkspaceToolStateInventory; restoreActiveToolStateFromHostContextIdUrl; safeParseJson; saveAndActivateProducerToolState; saveMergedToolStateResult; saveNamedToolState; savedToolStateIdExists; scheduleUpdate; seedToolStateIdForSelectedTool; selectedMergedToolStateId; selectedToolId; selectedToolStateIdForProducerAction; selectedToolStateName; setCurrentToolStatePayload; setDiffSummaryFromCounts; setImportExportStatus; setLastMergedToolStateResult; setLibraryStatus; setMergeApplySummary; setMergePreviewSummary; setMergeResultSummary; setMergedToolStateStatus; setWorkspaceHostContextIdUrl; singleActivePaletteBlockedMessage; singleActivePaletteLibraryMessage; syncDiffAndMergeSelectionSlotsFromToolStateId; syncSelectionSlotsFromContextId; syncWorkspaceManifestTextarea; toolStatePayloadMetrics; truncatePreview; undoLastMerge; updateColors; updateDiffSelectionFeedbackAndState; updateMergeSelectionFeedbackAndState; updateToolStateLibraryActionState; updateUndoLastMergeState; updateWorkspaceActivePaletteFromCurrentToolState; updateWorkspaceActivePaletteFromManifest; useMergedToolStateInDiffMerge; useSavedToolStateIdInLibraryInput; useToolStateIdInLibraryInput; validatePaletteSwatchesForWorkspaceExport; validateToolStatePayloadSize; validateToolStatePromotionPayload; validateWorkspaceSchemaDocument; validateWorkspaceToolStatePayload; walk; withToolStateVersion; workspaceToolSummaryEntries; writeLastMergedHostContextId; writePersistedToolStateSelection; writeToolStateHistory; writeToolStateLibrary

## Target Controls
Keep:
- current visible controls only as reference for later cleanup

Remove or rename:
- do not carry this folder into the core rebuild lane

Add:
- no core rebuild controls in this PR

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for transitional workspace-v2 launch payload. No core schema contract is assigned to this transitional/reference folder.
Required keys: none assigned for this reference folder.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: treat transitional workspace-v2 launch payload behavior as reference-only evidence from this exact folder
- validate: do not assign a core schema contract to workspace-v2 in this PR
- edit/process: do not define new rebuild-owned JSON fields from workspace-v2
- export/save: no core export/save contract is assigned to tools.workspace-v2
- publish: tools.workspace-v2 remains a reference-only null published-output shape
- copy/create payload: no core payload copy/create behavior is assigned until a later cleanup PR

## Valid JSON Behavior
- accepted only as the current transitional reference behavior found in this exact folder

## Invalid JSON Rejection Behavior
- any attempt to use this folder as the core rebuild contract
- any behavior that conflicts with the rebuilt core tool contract when cleanup occurs later

## Published Output
Published Output:
```jsonc
tools.workspace-v2 = {
  "publishedOutput": null,
  "status": "transitional-reference-only"
}
```

## Playwright Expectations
- load tools/workspace-v2/index.html only if later cleanup needs a reference screenshot
- do not use this folder for core publish-contract verification

## Manual Test Expectations
- Inspect tools/workspace-v2 only as a deferred reference surface.
- Do not rebuild from this folder unless a later cleanup PR explicitly scopes it.

## Known Gaps
- Deferred cleanup after core tool contracts are rebuilt and stable.

## Rebuild Order Priority
Deferred transitional/reference cleanup. Do not place this folder in the core rebuild lane.
