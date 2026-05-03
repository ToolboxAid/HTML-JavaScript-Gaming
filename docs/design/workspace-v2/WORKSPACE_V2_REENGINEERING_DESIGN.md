# Workspace V2 Reengineering Design

## Purpose
- Workspace V2 is the schema-validating dispatcher/launcher for tool JSON handoff.
- Workspace V2 is the authoring shell for draft tool state (`activeToolState`, `savedToolStates`) and explicit publish actions.
- Workspace V2 is not the domain owner for tool-specific edit logic.

## Out Of Scope For Workspace V2
- No broad JSON management as a replacement for tool-owned logic.
- No tool-specific compare/merge semantics that belong inside individual tool schemas.
- No sample JSON ownership.
- No games JSON ownership.
- No hidden fallback/default data injection beyond explicit palette baseline contract.

## Runtime Model (Current Contract)
- `tools.*` is published output consumed by games/samples.
- `tools.workspace-v2` is workspace editing/launcher state only.
- `tools.palette-browser` is global workspace palette state only.
- `activeToolState` is the single in-progress draft.
- `savedToolStates` is workspace draft library only.
- Promotion to `tools.<toolId>` is explicit (`Create Direct Tools Entry`, `Promote ... to Tools`), not implicit during export/import.

## Tool Launch Flow
1. Select tool from Workspace V2 producer list.
2. Load/generate tool JSON.
3. Validate payload with Workspace V2 validation gate before activation.
4. Save/activate toolState (`hostContextId` + `sessionStorage`).
5. Launch tool with URL `?hostContextId=<id>&fromTool=workspace-v2`.
6. Tool validates again before render and blocks invalid payloads.

## ToolState Model
- ToolState is draft/edit state only.
- ToolState is not games/samples output by default.
- ToolState library entries are named workspace artifacts and may be promoted to published `tools.<toolId>` entries explicitly.

## Promotion And Copy-Back Rules
- Preferred ownership: tool owns publish/copy semantics for its own schema whenever feasible.
- Current Workspace V2 behavior:
  - `Create Direct Tools Entry`: write active payload into `tools.<toolId>`.
  - `Promote Active Tool State to Tools`: explicit promotion from active draft.
  - Saved tool-state card `Promote to Tools`: explicit promotion from library entry.
  - Published tools `Copy to Tool State`: explicit copy from published object back to draft library.
- No implicit auto-promotion on export.

## Current Component Inventory
- Primary runtime class:
  - `WorkspaceV2ToolStateProducer` in `tools/workspace-v2/index.js`.
- Additional local helper closures in class file:
  - Scroll color helpers and merge/diff walker closures (`applyColors`, `updateColors`, `scheduleUpdate`, merge walk closures).

## Current Function Responsibility Inventory

### Bootstrapping And Wiring
- `constructor`
- `initializeImportExportSectionStatusNode`
- `initializeWorkspaceToolsSummaryNode`
- `initializeHiddenImportFileInput`
- `handleImportWorkspaceToolStateJsonClick`
- `handleImportFileDialogFocus`
- `removePaletteManagerProducerOption`
- `removeDiagnosticsPanelUi`
- `applyDefaultWorkspaceToolSelection`
- `registerScrollTextColorRule`

Current behavior:
- Captures all DOM nodes, wires all handlers, initializes shared state, and applies startup cleanup/filters.

Target behavior:
- Keep wiring centralized, but split into small view modules so startup does not also own business logic.

### Producer Selection And Active Draft State
- `selectedToolId`
- `ensureSelectedToolStateProducerToolId`
- `selectedToolStateName`
- `generatedToolStateIdForTool`
- `seedToolStateIdForSelectedTool`
- `isToolStateProducerToolId`
- `firstToolStateProducerToolId`
- `createProducerPayloadForTool`
- `initializeWorkspaceProducerToolState`
- `hasActiveWorkspaceToolStateForSave`
- `setCurrentToolStatePayload`
- `activateWorkspaceToolState`
- `applyToolStatePayload`
- `createHostContextToolStateId`
- `buildToolLaunchUrl`
- `setWorkspaceHostContextIdUrl`
- `createToolStateAndLaunch`
- `openAssetManagerFromWorkspace`

Current behavior:
- Produces fixture payloads, validates tool selection, activates state, and launches tools.

Target behavior:
- Keep dispatcher-only ownership and move tool-specific payload creation into tool-owned providers.

### Workspace Palette Ownership
- `isPaletteManagerToolId`
- `isPaletteToolStatePayload`
- `ensureWorkspaceActivePaletteBaseline`
- `hasWorkspaceActivePalette`
- `activePaletteHostContextId`
- `singleActivePaletteBlockedMessage`
- `singleActivePaletteLibraryMessage`
- `isBlockedAlternatePaletteToolState`
- `updateWorkspaceActivePaletteFromCurrentToolState`
- `updateWorkspaceActivePaletteFromManifest`
- `pruneCompetingPaletteRecentToolStates`
- `refreshPaletteOwnershipUiState`
- `refreshPaletteOwnershipStateAndUi`
- `validatePaletteSwatchesForWorkspaceExport`
- `resolveActivePaletteForWorkspaceExport`
- `normalizePaletteFixtureSwatches`

Current behavior:
- Enforces single active palette contract and ownership under `tools.palette-browser`.

Target behavior:
- Preserve ownership, reduce cross-cutting checks by centralizing palette guard evaluation in one state model.

### Tool State Library CRUD
- `isValidNewToolStateId`
- `savedToolStateIdExists`
- `updateToolStateLibraryActionState`
- `setLibraryStatus`
- `readToolStateLibrary`
- `writeToolStateLibrary`
- `renderToolStateLibrary`
- `useSavedToolStateIdInLibraryInput`
- `promoteSavedToolStateById`
- `loadSavedToolStateById`
- `overwriteSavedToolStateById`
- `deleteSavedToolStateById`
- `selectedToolStateIdForProducerAction`
- `saveAndActivateProducerToolState`
- `saveNamedToolState`
- `loadNamedToolState`
- `deleteNamedToolState`
- `readToolStatePayloadForLibraryWrite`
- `readToolStatePayloadForSaveAction`
- `readToolStatePayloadFromRecentToolStateId`
- `readActiveToolStatePayloadForLibraryActions`
- `readInvalidPaletteSavedToolStateId`
- `cleanupStaleInvalidSavedEntries`

Current behavior:
- Manages create/load/overwrite/delete and card actions with tool-state ID validation and palette guard messaging.

Target behavior:
- Keep strict no-fallback behavior; separate command handlers from DOM rendering branches.

### Recent Tool State History
- `isValidToolStateHistoryEntry`
- `readToolStateHistory`
- `writeToolStateHistory`
- `addRecentToolStateEntry`
- `renderToolStateHistory`
- `useToolStateIdInLibraryInput`
- `deleteRecentToolStateEntry`
- `reopenToolStateHistoryEntry`
- `resolveToolStatePayloadFromContextId`
- `buildRecentToolStateInventory`
- `resolveWorkspaceToolStateInventory`

Current behavior:
- Tracks recent entries, supports reopen/copy/delete, and feeds diff/merge inventory.

Target behavior:
- Keep inventory as single resolver source for all selectors and actions.

### Diff/Merge Selection And State Model
- `computeWorkspaceTransitionStateFromModel`
- `isWorkspaceTransitionAllowed`
- `computeNextWorkspaceTransitionState`
- `requestWorkspaceTransition`
- `computeWorkspaceToolStateUiStateModel`
- `renderWorkspaceToolStateUiStateModel`
- `refreshWorkspaceToolStateUiStateModel`
- `buildMergeSelectionKey`
- `currentMergeSelectionKey`
- `currentDiffSelectionKey`
- `clearDiffOutputForStateChange`
- `handleDiffSelectionChange`
- `clearMergePanelTransientState`
- `clearMergeOutputForSelectionChange`
- `handleMergeSelectionChange`
- `readPersistedToolStateSelection`
- `writePersistedToolStateSelection`
- `clearPersistedToolStateSelection`
- `findToolStateEntryByContextId`
- `resolvePersistedSelectionIds`
- `findToolStateEntryById`
- `syncSelectionSlotsFromContextId`
- `syncDiffAndMergeSelectionSlotsFromToolStateId`
- `formatSelectionLabel`
- `updateDiffSelectionFeedbackAndState`
- `updateMergeSelectionFeedbackAndState`

Current behavior:
- Computes enable/disable state and resets stale preview output on selection changes.

Target behavior:
- Keep one computed state model as single source of truth; remove any remaining branch duplication.

### Merge Preview, Confirm, Apply, Undo
- `setMergedToolStateStatus`
- `setMergeResultSummary`
- `setMergePreviewSummary`
- `setMergeApplySummary`
- `hasFreshMergePreviewContext`
- `conflictValuePreview`
- `renderMergeConflictSummary`
- `buildToolStateMergeCandidates`
- `renderToolStateMergeInputs`
- `cloneToolStateValue`
- `mergeToolStatePayloads`
- `computeSelectedToolStateMerge`
- `computeMergePreviewChanges`
- `defaultMergedToolStateId`
- `setLastMergedToolStateResult`
- `saveMergedToolStateResult`
- `useMergedToolStateInDiffMerge`
- `confirmSelectedToolStateMergePreview`
- `recordMergeAuditEntry`
- `applySelectedToolStateMerge`
- `selectedMergedToolStateId`
- `looksLikeWorkspaceHostContextId`
- `readLastMergedHostContextId`
- `writeLastMergedHostContextId`
- `resolveAuthoritativeLastMergedHostContextId`
- `updateUndoLastMergeState`
- `undoLastMerge`

Current behavior:
- Supports dry-run preview, conflict blocking, confirmation gate, apply verification, audit log entry, and last-merge undo.

Target behavior:
- Keep explicit state transitions and prevent any UI/data source desync.

### Diff Computation
- `renderToolStateDiffInputs`
- `isComparableObject`
- `computeToolStateDiff`
- `setDiffSummaryFromCounts`
- `computeSelectedToolStateDiff`

Current behavior:
- Deep structural diff for selected tool states with summary counts and output panel.

Target behavior:
- Keep deterministic read-only behavior; move tool-specific semantic compare rules to tool-owned implementations later.

### Import/Export And Manifest Validation
- `readWorkspaceToolsFromTextarea`
- `workspaceToolSummaryEntries`
- `renderedPublishedTools`
- `copyPublishedToolToToolState`
- `renderWorkspaceToolsSummary`
- `setImportExportStatus`
- `activeToolStatePublishStatusText`
- `renderActiveToolStatePublishStatus`
- `syncWorkspaceManifestTextarea`
- `buildWorkspaceSchemaDocument`
- `exportWorkspaceToolStateJson`
- `validateWorkspaceToolStatePayload`
- `validateWorkspaceSchemaDocument`
- `importWorkspaceToolStateJson`
- `readImportFile`
- `resolveActiveToolStatePayloadForWorkspaceManifest`
- `validateToolStatePromotionPayload`
- `promoteToolStatePayloadToWorkspaceTools`
- `promoteActiveToolStateToWorkspaceTools`
- `createDirectToolsEntry`

Current behavior:
- Maintains manifest textarea, validates schema-like contract, and handles import/export file flow and explicit publish/copy actions.

Target behavior:
- Keep validation as hard gate and move authoritative schema validation to shared schema validator integration where available.

### Diagnostics, Errors, Reset, Share
- `isValidErrorLogEntry`
- `readErrorLogs`
- `groupErrorLogsByTool`
- `renderErrorLogsViewer`
- `clearToolStateStorage`
- `clearSavedToolStates`
- `clearErrorLogs`
- `resetUrlState`
- `fullReset`
- `safeParseJson`
- `truncatePreview`
- `createShareLink`
- `applyShareLink`
- `decodeToolStateParamFromUrl`
- `encodeToolStatePayload`
- `decodeToolStatePayload`
- `restoreActiveToolStateFromHostContextIdUrl`
- `normalizeFixtureToolStateContext`
- `fixturePathForTool`

Current behavior:
- Provides deterministic reset path, diagnostics, share-link encode/decode, and error log viewing.

Target behavior:
- Keep deterministic controls; remove non-essential diagnostics from default user workflow once stability lane closes.

## Target Workspace V2 Architecture
- Dispatcher shell:
  - Select tool, load tool JSON, validate, launch.
- Draft state manager:
  - Owns `activeToolState` + `savedToolStates` only.
- Publish manager:
  - Owns explicit promotion from draft to `tools.<toolId>`.
- Validation gate:
  - Hard reject invalid manifest/toolState payloads before use.
- UI renderer:
  - Pure projection from computed state model.

## Tool Integration Contract (Target)
- Workspace passes:
  - selected tool id
  - validated JSON payload for tool schema
  - host context id for launch handoff
- Tool returns:
  - validated output payload (if tool supports publish)
  - explicit publish command intent (no implicit write-back)
- Workspace persists:
  - draft state in `tools.workspace-v2`
  - published output in `tools.<toolId>`

## Playwright Expectations
- Workspace lifecycle remains deterministic (`full reset`, `import`, `export`, round-trip).
- Tool launch validates payload before render.
- Invalid payloads are rejected with visible status.
- No stale status text after selection/undo/delete/reset actions.

## Manual Test Expectations
- Reset -> select producer tool -> load/create toolState -> launch tool.
- Import valid manifest and confirm active toolState + published tools summary.
- Attempt invalid manifest/toolState import and confirm hard rejection with clear status.
- Promote active/saved toolState to published tools and confirm summary updates.
