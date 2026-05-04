# Asset Manager V2 Transitional Reference

Task: PR_26124_022-tighten-tool-design-docs
Classification: transitional/quarantine tool
Core priority: none
Source folder: `tools/asset-manager-v2`

## Purpose
`payloadJson.assetCatalog` hosted payload editor for transitional asset catalog work.

This folder is not a normal rebuild target in the core tool roadmap. Keep it quarantined as a reference until a later PR explicitly asks to migrate, delete, or rebuild it.

## Exact Folder/Files Inspected
- `tools/asset-manager-v2/index.html`
- `tools/asset-manager-v2/index.js`

## Current Controls Found
- `tools/asset-manager-v2/index.html`: `button[button]#assetBrowserV2BackButton` - Back
- `tools/asset-manager-v2/index.html`: `button[button]#assetBrowserV2OpenSvgAssetStudioV2Button` - Open in SVG Asset Studio V2
- `tools/asset-manager-v2/index.html`: `input[text]#assetManagerV2AddId` - assetManagerV2AddId
- `tools/asset-manager-v2/index.html`: `input[text]#assetManagerV2AddLabel` - assetManagerV2AddLabel
- `tools/asset-manager-v2/index.html`: `input[text]#assetManagerV2AddKind` - assetManagerV2AddKind
- `tools/asset-manager-v2/index.html`: `input[text]#assetManagerV2AddPath` - assetManagerV2AddPath
- `tools/asset-manager-v2/index.html`: `button[button]#assetManagerV2AddButton` - Add Asset

## Current Functions And Classes
- `tools/asset-manager-v2/index.js`: class AssetBrowserV2; method addAssetEntry; method buildRuntimeSnapshot; method buildToolUrl; method clearAddAssetForm; method clearSelectedAssetDetails; method cloneSessionValue; method goBack; method handleNavigationState; method handleSessionVersion; method loadContract; method logStructuredError; method normalizedAssetEntryFromForm; method openSvgAssetStudioV2; method optionalUrlStateSummary; method persistValidSessionForWorkspace; method readSession; method readUrlState; method registerSnapshotHook; method removeAssetEntryById; method renderCatalog; method renderError; method renderMissing; method renderNavigation; method renderSelectedAssetDetails; method selectedAssetEntryFromCatalogEntries; method setActionStatus; method toolLabel

## Boundary Rules
- Do not use this folder as the contract source for the rebuilt non-transitional tool.
- Use hosted payload or toolState wording for launch data.
- The only allowed browser storage wording is `sessionStorage` when referring to the API currently used by this transitional folder.
- Workspace and global launchers validate launch envelopes only; nested tool JSON remains owned by the rebuilt tool.

## Cleanup Trigger
Revisit this folder only after the corresponding core tool contract is rebuilt and validated. Cleanup choices should be explicit: migrate behavior, keep as reference, or delete in a deletion-scoped PR.
