# Asset Manager V2 Transitional Reference

Task: PR_26124_023-finalize-tool-design-docs
Classification: transitional/quarantine tool
Core priority: none
Source folder: `tools/asset-manager-v2`

## Purpose
Transitional hosted payload editor for `payloadJson.assetCatalog` only.

This folder is not a core rebuild anchor. Keep it as a deferred reference until a later cleanup PR explicitly chooses to migrate, retain, or delete it.

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

## Quarantine Rules
- Do not use this folder as the JSON contract source for a core rebuild.
- Hosted payload or toolState behavior documented here is transitional reference behavior only.
- Browser storage details are reference-only and must not become a rebuilt core tool contract.
- Core tool docs must not import V2 behavior from this folder.
