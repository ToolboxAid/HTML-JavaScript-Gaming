# Vector Map Editor V2 Transitional Reference

Task: PR_26124_022-tighten-tool-design-docs
Classification: transitional/quarantine tool
Core priority: none
Source folder: `tools/vector-map-editor-v2`

## Purpose
`payloadJson.vectorMapDocument` hosted payload reader for transitional vector map work.

This folder is not a normal rebuild target in the core tool roadmap. Keep it quarantined as a reference until a later PR explicitly asks to migrate, delete, or rebuild it.

## Exact Folder/Files Inspected
- `tools/vector-map-editor-v2/index.html`
- `tools/vector-map-editor-v2/index.js`

## Current Controls Found
- `tools/vector-map-editor-v2/index.html`: `button[button]#vectorMapV2BackButton` - Back

## Current Functions And Classes
- `tools/vector-map-editor-v2/index.js`: class VectorMapEditorV2; method buildRuntimeSnapshot; method buildToolUrl; method goBack; method handleNavigationState; method handleSessionVersion; method loadContract; method logStructuredError; method optionalUrlStateSummary; method readSession; method readUrlState; method registerSnapshotHook; method renderError; method renderMissing; method renderNavigation; method renderVectorMap; method toolLabel

## Boundary Rules
- Do not use this folder as the contract source for the rebuilt non-transitional tool.
- Use hosted payload or toolState wording for launch data.
- The only allowed browser storage wording is `sessionStorage` when referring to the API currently used by this transitional folder.
- Workspace and global launchers validate launch envelopes only; nested tool JSON remains owned by the rebuilt tool.

## Cleanup Trigger
Revisit this folder only after the corresponding core tool contract is rebuilt and validated. Cleanup choices should be explicit: migrate behavior, keep as reference, or delete in a deletion-scoped PR.
