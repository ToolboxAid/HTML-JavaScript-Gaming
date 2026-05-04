# Workspace V2 Transitional Reference

Task: PR_26124_023-finalize-tool-design-docs
Classification: transitional/quarantine tool
Core priority: none
Source folder: `tools/workspace-v2`

## Purpose
Transitional toolState launcher/reference. It may validate launch envelopes and use browser `sessionStorage`; it must not define core tool JSON contracts.

This folder is not a core rebuild anchor. Keep it as a deferred reference until a later cleanup PR explicitly chooses to migrate, retain, or delete it.

## Exact Folder/Files Inspected
- `tools/workspace-v2/index.html`
- `tools/workspace-v2/index.js`

## Current Controls Found
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2BackButton` - Back to Tools Index
- `tools/workspace-v2/index.html`: `select#workspaceV2ToolSelect` - Asset Manager V2 SVG Asset Studio V2 Tilemap Studio V2 Vector Map Editor V2
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2LoadFixtureButton` - Load Tool State
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2LaunchButton` - Create & Open Tool State
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2CreateDirectToolsEntryButton` - Create Direct Tools Entry
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2PromoteActiveToolStateButton` - Promote Active Tool State to Tools
- `tools/workspace-v2/index.html`: `input[text]#workspaceV2ToolStateName` - tool-state-id
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2SaveToolStateButton` - Save Tool State
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2OverwriteToolStateButton` - Overwrite Tool State
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2LoadToolStateButton` - Load Tool State
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2DeleteToolStateButton` - Delete Saved Tool State
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2OpenAssetManagerButton` - Open Asset Manager V2 (no tool state)
- `tools/workspace-v2/index.html`: `textarea#workspaceV2ImportJson` - {
- `tools/workspace-v2/index.html`: `input[file]#workspaceV2ImportFile` - workspaceV2ImportFile
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2ImportButton` - Import Workspace Tool State JSON
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2ExportButton` - Export Workspace Tool State JSON
- `tools/workspace-v2/index.html`: `textarea#workspaceV2ShareUrl` - https://.../tools/workspace-v2/index.html?toolState=...
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2CreateShareLinkButton` - Create Share Link
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2ApplyShareLinkButton` - Apply Share Link
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2RefreshToolStateHistoryButton` - Refresh Recent Tool States
- `tools/workspace-v2/index.html`: `select#workspaceV2DiffLeftSelect` - workspaceV2DiffLeftSelect
- `tools/workspace-v2/index.html`: `select#workspaceV2DiffRightSelect` - workspaceV2DiffRightSelect
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2ComputeDiffButton` - Compute Diff
- `tools/workspace-v2/index.html`: `select#workspaceV2MergeLeftSelect` - workspaceV2MergeLeftSelect
- `tools/workspace-v2/index.html`: `select#workspaceV2MergeRightSelect` - workspaceV2MergeRightSelect
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2ComputeMergeButton` - Preview Merge (Dry Run)
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2ConfirmMergeButton` - Confirm Preview
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2ApplyMergeButton` - Apply Merge
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2UndoLastMergeButton` - Undo Last Merge
- `tools/workspace-v2/index.html`: `input[text]#workspaceV2MergedToolStateId` - tool-state-v2-merged-0000000000000
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2SaveMergedToolStateButton` - Save Merged Tool State
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2UseMergedInDiffMergeButton` - Use in Diff/Merge
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2RefreshErrorLogsButton` - Refresh Error Logs
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2ClearErrorLogsButton` - Clear Error Logs
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2RefreshDiagnosticsButton` - Refresh Diagnostics
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2ExportSnapshotButton` - Export Runtime Snapshot
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2ClearSessionStorageButton` - Clear Session Storage
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2ClearSavedToolStatesButton` - Clear Saved Tool States
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2ResetClearErrorLogsButton` - Clear Error Logs
- `tools/workspace-v2/index.html`: `button[button]#workspaceV2FullResetButton` - Full Reset
- `tools/workspace-v2/index.js`: `workspaceV2ToolSelect` via toolSelect
- `tools/workspace-v2/index.js`: `workspaceV2BackButton` via backButton
- `tools/workspace-v2/index.js`: `workspaceV2LoadFixtureButton` via loadFixtureButton
- `tools/workspace-v2/index.js`: `workspaceV2LaunchButton` via launchButton
- `tools/workspace-v2/index.js`: `workspaceV2CreateDirectToolsEntryButton` via createDirectToolsEntryButton
- `tools/workspace-v2/index.js`: `workspaceV2PromoteActiveToolStateButton` via promoteActiveToolStateButton
- `tools/workspace-v2/index.js`: `workspaceV2OpenAssetManagerButton` via openAssetManagerButton
- `tools/workspace-v2/index.js`: `workspaceV2ImportJson` via importJsonNode
- `tools/workspace-v2/index.js`: `workspaceV2ImportFile` via importFileNode
- `tools/workspace-v2/index.js`: `workspaceV2ImportButton` via importButton
- `tools/workspace-v2/index.js`: `workspaceV2ExportButton` via exportButton
- `tools/workspace-v2/index.js`: `workspaceV2ShareUrl` via shareUrlNode
- `tools/workspace-v2/index.js`: `workspaceV2CreateShareLinkButton` via createShareLinkButton
- `tools/workspace-v2/index.js`: `workspaceV2ApplyShareLinkButton` via applyShareLinkButton
- `tools/workspace-v2/index.js`: `workspaceV2ToolStateName` via toolStateNameNode
- `tools/workspace-v2/index.js`: `workspaceV2SaveToolStateButton` via saveToolStateButton
- `tools/workspace-v2/index.js`: `workspaceV2OverwriteToolStateButton` via overwriteToolStateButton
- `tools/workspace-v2/index.js`: `workspaceV2LoadToolStateButton` via loadToolStateButton
- `tools/workspace-v2/index.js`: `workspaceV2DeleteToolStateButton` via deleteToolStateButton
- `tools/workspace-v2/index.js`: `workspaceV2LibraryStatus` via libraryStatusNode
- `tools/workspace-v2/index.js`: `workspaceV2LibraryEmptyState` via libraryEmptyState
- `tools/workspace-v2/index.js`: `workspaceV2ToolStateList` via toolStateListNode
- `tools/workspace-v2/index.js`: `workspaceV2RefreshToolStateHistoryButton` via refreshToolStateHistoryButton
- `tools/workspace-v2/index.js`: `workspaceV2ToolStateHistoryEmptyState` via toolStateHistoryEmptyState
- `tools/workspace-v2/index.js`: `workspaceV2ToolStateHistoryList` via toolStateHistoryListNode
- `tools/workspace-v2/index.js`: `workspaceV2DiffLeftSelect` via diffLeftSelect
- `tools/workspace-v2/index.js`: `workspaceV2DiffRightSelect` via diffRightSelect
- `tools/workspace-v2/index.js`: `workspaceV2DiffLeftSelectedLabel` via diffLeftSelectedLabelNode
- `tools/workspace-v2/index.js`: `workspaceV2DiffRightSelectedLabel` via diffRightSelectedLabelNode
- `tools/workspace-v2/index.js`: `workspaceV2DiffSelectionState` via diffSelectionStateNode
- `tools/workspace-v2/index.js`: `workspaceV2ComputeDiffButton` via computeDiffButton
- `tools/workspace-v2/index.js`: `workspaceV2DiffEnableState` via diffEnableStateNode
- `tools/workspace-v2/index.js`: `workspaceV2DiffEmptyState` via diffEmptyState
- `tools/workspace-v2/index.js`: `workspaceV2DiffSummary` via diffSummaryNode
- `tools/workspace-v2/index.js`: `workspaceV2DiffOutput` via diffOutputNode
- `tools/workspace-v2/index.js`: `workspaceV2MergeLeftSelect` via mergeLeftSelect
- `tools/workspace-v2/index.js`: `workspaceV2MergeRightSelect` via mergeRightSelect
- `tools/workspace-v2/index.js`: `workspaceV2MergeLeftSelectedLabel` via mergeLeftSelectedLabelNode
- `tools/workspace-v2/index.js`: `workspaceV2MergeRightSelectedLabel` via mergeRightSelectedLabelNode
- `tools/workspace-v2/index.js`: `workspaceV2MergeSelectionState` via mergeSelectionStateNode
- `tools/workspace-v2/index.js`: `workspaceV2ComputeMergeButton` via computeMergeButton
- `tools/workspace-v2/index.js`: `workspaceV2ConfirmMergeButton` via confirmMergeButton
- `tools/workspace-v2/index.js`: `workspaceV2ApplyMergeButton` via applyMergeButton
- `tools/workspace-v2/index.js`: `workspaceV2MergeEnableState` via mergeEnableStateNode
- `tools/workspace-v2/index.js`: `workspaceV2MergeResultSummary` via mergeResultSummaryNode
- `tools/workspace-v2/index.js`: `workspaceV2MergeEmptyState` via mergeEmptyState
- `tools/workspace-v2/index.js`: `workspaceV2MergedToolStateId` via mergedToolStateIdNode
- `tools/workspace-v2/index.js`: `workspaceV2SaveMergedToolStateButton` via saveMergedToolStateButton
- `tools/workspace-v2/index.js`: `workspaceV2UseMergedInDiffMergeButton` via useMergedInDiffMergeButton
- `tools/workspace-v2/index.js`: `workspaceV2UndoLastMergeButton` via undoLastMergeButton
- `tools/workspace-v2/index.js`: `workspaceV2MergedToolStateStatus` via mergedToolStateStatusNode
- `tools/workspace-v2/index.js`: `workspaceV2MergeConflictSummary` via mergeConflictSummaryNode
- `tools/workspace-v2/index.js`: `workspaceV2MergeOutput` via mergeOutputNode
- `tools/workspace-v2/index.js`: `workspaceV2RefreshErrorLogsButton` via refreshErrorLogsButton
- `tools/workspace-v2/index.js`: `workspaceV2ClearErrorLogsButton` via clearErrorLogsButton
- `tools/workspace-v2/index.js`: `workspaceV2ErrorLogsEmptyState` via errorLogsEmptyState
- `tools/workspace-v2/index.js`: `workspaceV2ErrorLogsList` via errorLogsListNode
- `tools/workspace-v2/index.js`: `workspaceV2ClearSessionStorageButton` via clearToolStateStorageButton
- `tools/workspace-v2/index.js`: `workspaceV2ClearSavedToolStatesButton` via clearSavedToolStatesButton
- `tools/workspace-v2/index.js`: `workspaceV2ResetClearErrorLogsButton` via resetClearErrorLogsButton
- `tools/workspace-v2/index.js`: `workspaceV2FullResetButton` via fullResetButton
- `tools/workspace-v2/index.js`: `workspaceV2ActiveToolStatePublishStatus` via activeToolStatePublishStatusNode
- `tools/workspace-v2/index.js`: `workspaceV2Status` via statusNode
- `tools/workspace-v2/index.js`: `workspaceV2PublishedToolsList` via publishedToolsListNode
- `tools/workspace-v2/index.js`: `workspaceV2ImportExportStatus` via existingStatusNode
- `tools/workspace-v2/index.js`: `workspaceV2WorkspaceToolsSummary` via existingNode

## Current Functions And Classes
- `tools/workspace-v2/index.js`: class WorkspaceV2ToolStateProducer; function applyColors; function mergeValues; function scheduleUpdate; function updateColors; function walk; method activateWorkspaceToolState; method activePaletteHostContextId; method activeToolStatePublishStatusText; method addRecentToolStateEntry; method applyDefaultWorkspaceToolSelection; method applySelectedToolStateMerge; method applyShareLink; method applyToolStatePayload; method buildMergeSelectionKey; method buildRecentToolStateInventory; method buildToolLaunchUrl; method buildToolStateMergeCandidates; method buildWorkspaceSchemaDocument; method cleanupStaleInvalidSavedEntries; method clearDiffOutputForStateChange; method clearErrorLogs; method clearMergeOutputForSelectionChange; method clearMergePanelTransientState; method clearPersistedToolStateSelection; method clearSavedToolStates; method clearToolStateStorage; method cloneToolStateValue; method computeMergePreviewChanges; method computeNextWorkspaceTransitionState; method computeSelectedToolStateDiff; method computeSelectedToolStateMerge; method computeToolStateDiff; method computeWorkspaceToolStateUiStateModel; method computeWorkspaceTransitionStateFromModel; method confirmSelectedToolStateMergePreview; method conflictValuePreview; method copyPublishedToolToToolState; method copySavedToolStateIdToClipboard; method copyToolStateIdToClipboard; method createDirectToolsEntry; method createHostContextToolStateId; method createMergedHostContextId; method createProducerPayloadForTool; method createShareLink; method createToolStateAndLaunch; method currentDiffSelectionKey; method currentMergeSelectionKey; method decodeToolStateParamFromUrl; method decodeToolStatePayload; method defaultMergedToolStateId; method deleteNamedToolState; method deleteRecentToolStateEntry; method deleteSavedToolStateById; method encodeToolStatePayload; method ensureSelectedToolStateProducerToolId; method ensureWorkspaceActivePaletteBaseline; method exportWorkspaceToolStateJson; method findToolStateEntryByContextId; method findToolStateEntryById; method firstToolStateProducerToolId; method fixturePathForTool; method formatSelectionLabel; method fullReset; method generatedToolStateIdForTool; method groupErrorLogsByTool; method handleDiffSelectionChange; method handleImportFileDialogFocus; method handleImportWorkspaceToolStateJsonClick; method handleMergeSelectionChange; method hasActiveWorkspaceToolStateForSave; method hasFreshMergePreviewContext; method hasWorkspaceActivePalette; method importWorkspaceToolStateJson; method initializeHiddenImportFileInput; method initializeImportExportSectionStatusNode; method initializeWorkspaceProducerToolState; method initializeWorkspaceToolsSummaryNode; method isBlockedAlternatePaletteToolState; method isComparableObject; method isPaletteManagerToolId; method isPaletteToolStatePayload; method isToolStateProducerToolId; method isValidErrorLogEntry; method isValidNewToolStateId; method isValidToolStateHistoryEntry; method isValidToolStatePayload; method isWorkspaceTransitionAllowed; method loadNamedToolState; method loadSavedToolStateById; method loadSelectedToolState; method looksLikeWorkspaceHostContextId; method mergeToolStatePayloads; method normalizeFixtureToolStateContext; method normalizePaletteFixtureSwatches; method openAssetManagerFromWorkspace; method overwriteSavedToolStateById; method promoteActiveToolStateToWorkspaceTools; method promoteSavedToolStateById; method promoteToolStatePayloadToWorkspaceTools; method pruneCompetingPaletteRecentToolStates; method readActiveToolStatePayloadForLibraryActions; method readErrorLogs; method readImportFile; method readInvalidPaletteSavedToolStateId; method readLastMergedHostContextId; method readPersistedToolStateSelection; method readToolStateHistory; method readToolStateLibrary; method readToolStatePayloadForLibraryWrite; method readToolStatePayloadForSaveAction; method readToolStatePayloadFromRecentToolStateId; method readWorkspaceToolsFromTextarea; method recordMergeAuditEntry; method refreshPaletteOwnershipStateAndUi; method refreshPaletteOwnershipUiState; method refreshWorkspaceToolStateUiStateModel; method registerScrollTextColorRule; method removeDiagnosticsPanelUi; method removePaletteManagerProducerOption; method renderActiveToolStatePublishStatus; method renderedPublishedTools; method renderErrorLogsViewer; method renderMergeConflictSummary; method renderToolStateDiffInputs; method renderToolStateHistory; method renderToolStateLibrary; method renderToolStateMergeInputs; method renderWorkspaceToolsSummary; method renderWorkspaceToolStateUiStateModel; method reopenToolStateHistoryEntry; method requestWorkspaceTransition; method resetUrlState; method resolveActivePaletteForWorkspaceExport; method resolveActiveToolStatePayloadForWorkspaceManifest; method resolveAuthoritativeLastMergedHostContextId; method resolvePersistedSelectionIds; method resolveToolStatePayloadFromContextId; method resolveWorkspaceToolStateInventory; method restoreActiveToolStateFromHostContextIdUrl; method safeParseJson; method saveAndActivateProducerToolState; method savedToolStateIdExists; method saveMergedToolStateResult; method saveNamedToolState; method seedToolStateIdForSelectedTool; method selectedMergedToolStateId; method selectedToolId; method selectedToolStateIdForProducerAction; method selectedToolStateName; method setCurrentToolStatePayload; method setDiffSummaryFromCounts; method setImportExportStatus; method setLastMergedToolStateResult; method setLibraryStatus; method setMergeApplySummary; method setMergedToolStateStatus; method setMergePreviewSummary; method setMergeResultSummary; method setWorkspaceHostContextIdUrl; method singleActivePaletteBlockedMessage; method singleActivePaletteLibraryMessage; method syncDiffAndMergeSelectionSlotsFromToolStateId; method syncSelectionSlotsFromContextId; method syncWorkspaceManifestTextarea; method toolStatePayloadMetrics; method truncatePreview; method undoLastMerge; method updateDiffSelectionFeedbackAndState; method updateMergeSelectionFeedbackAndState; method updateToolStateLibraryActionState; method updateUndoLastMergeState; method updateWorkspaceActivePaletteFromCurrentToolState; method updateWorkspaceActivePaletteFromManifest; method useMergedToolStateInDiffMerge; method useSavedToolStateIdInLibraryInput; method useToolStateIdInLibraryInput; method validatePaletteSwatchesForWorkspaceExport; method validateToolStatePayloadSize; method validateToolStatePromotionPayload; method validateWorkspaceSchemaDocument; method validateWorkspaceToolStatePayload; method withToolStateVersion; method workspaceToolSummaryEntries; method writeLastMergedHostContextId; method writePersistedToolStateSelection; method writeToolStateHistory; method writeToolStateLibrary

## Quarantine Rules
- Do not use this folder as the JSON contract source for a core rebuild.
- Hosted payload or toolState behavior documented here is transitional reference behavior only.
- `sessionStorage` is allowed here only as the current browser API used by this transitional launcher.
- Core tool docs must not import V2 behavior from this folder.
