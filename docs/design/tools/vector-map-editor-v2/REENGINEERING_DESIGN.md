# Vector Map Editor V2 Transitional Reference

Task: PR_26124_023-finalize-tool-design-docs
Classification: transitional/quarantine tool
Core priority: none
Source folder: `tools/vector-map-editor-v2`

## Purpose
Transitional hosted payload reader for `payloadJson.vectorMapDocument` only.

This folder is not a core rebuild anchor. Keep it as a deferred reference until a later cleanup PR explicitly chooses to migrate, retain, or delete it.

## Exact Folder/Files Inspected
- `tools/vector-map-editor-v2/index.html`
- `tools/vector-map-editor-v2/index.js`

## Current Controls Found
- `tools/vector-map-editor-v2/index.html`: `button[button]#vectorMapV2BackButton` - Back

## Current Functions And Classes
- `tools/vector-map-editor-v2/index.js`: class VectorMapEditorV2; method buildRuntimeSnapshot; method buildToolUrl; method goBack; method handleNavigationState; method handleSessionVersion; method loadContract; method logStructuredError; method optionalUrlStateSummary; method readSession; method readUrlState; method registerSnapshotHook; method renderError; method renderMissing; method renderNavigation; method renderVectorMap; method toolLabel

## Quarantine Rules
- Do not use this folder as the JSON contract source for a core rebuild.
- Hosted payload or toolState behavior documented here is transitional reference behavior only.
- Browser storage details are reference-only and must not become a rebuilt core tool contract.
- Core tool docs must not import V2 behavior from this folder.
