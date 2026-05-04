# asset-manager-v2 Reengineering Design

Task: PR_26124_024
Classification: transitional/quarantine tool
Core priority: deferred
Source folder: `tools/asset-manager-v2`
Publish target: `reference-only shape under tools.asset-manager-v2`

## Tool Purpose
Reference-only quarantine folder for current asset-manager-v2 behavior. It is not a core rebuild anchor and does not replace Asset Browser or Asset Pipeline.

## Folder/Files Inspected
- `tools/asset-manager-v2/index.html`
- `tools/asset-manager-v2/index.js`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/asset-manager-v2/index.html`: `input[text]#assetManagerV2AddId` - assetManagerV2AddId | Edits the active entry field. | Updates the draft transitional asset manager payload field represented by `assetManagerV2AddId` before validation. |
| `tools/asset-manager-v2/index.html`: `input[text]#assetManagerV2AddLabel` - assetManagerV2AddLabel | Edits the active entry field. | Updates the draft transitional asset manager payload field represented by `assetManagerV2AddLabel` before validation. |
| `tools/asset-manager-v2/index.html`: `input[text]#assetManagerV2AddKind` - assetManagerV2AddKind | Edits the active entry field. | Updates the draft transitional asset manager payload field represented by `assetManagerV2AddKind` before validation. |
| `tools/asset-manager-v2/index.html`: `input[text]#assetManagerV2AddPath` - assetManagerV2AddPath | Edits the active entry field. | Updates the draft transitional asset manager payload field represented by `assetManagerV2AddPath` before validation. |
| `tools/asset-manager-v2/index.html`: `button[button]#assetBrowserV2BackButton` - Back | Triggers the current transitional asset manager payload UI action for `Back`. | May update draft transitional asset manager payload data; tools.asset-manager-v2 publish must wait for validation. |
| `tools/asset-manager-v2/index.html`: `button[button]#assetBrowserV2OpenSvgAssetStudioV2Button` - Open in SVG Asset Studio V2 | Starts transitional asset manager payload import/load. | Reads incoming JSON into the tool-owned transitional asset manager payload only after validation succeeds. |
| `tools/asset-manager-v2/index.html`: `button[button]#assetManagerV2AddButton` - Add Asset | Adds a new entry. | Appends schema-owned data to the draft transitional asset manager payload; publish waits for validation. |

## Panels And Surfaces Found
- `tools/asset-manager-v2/index.html`: `.asset-manager-v2-grid`
- `tools/asset-manager-v2/index.html`: `.asset-manager-v2-panel`
- `tools/asset-manager-v2/index.html`: `.hub-page-home--viewport`
- `tools/asset-manager-v2/index.html`: `.page-shell`

## Current Component/Class/Function Inventory
- `tools/asset-manager-v2/index.js`: AssetBrowserV2; addAssetEntry; buildRuntimeSnapshot; buildToolUrl; clearAddAssetForm; clearSelectedAssetDetails; cloneSessionValue; goBack; handleNavigationState; handleSessionVersion; loadContract; logStructuredError; normalizedAssetEntryFromForm; openSvgAssetStudioV2; optionalUrlStateSummary; persistValidSessionForWorkspace; readSession; readUrlState; registerSnapshotHook; removeAssetEntryById; renderCatalog; renderError; renderMissing; renderNavigation; renderSelectedAssetDetails; selectedAssetEntryFromCatalogEntries; setActionStatus; toolLabel

## Target Controls
Keep:
- current visible controls only as reference for later cleanup

Remove or rename:
- do not carry this folder into the core rebuild lane

Add:
- no core rebuild controls in this PR

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for transitional asset manager payload. No core schema contract is assigned to this transitional/reference folder.
Required keys: none assigned for this reference folder.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: treat transitional asset manager payload behavior as reference-only evidence from this exact folder
- validate: do not assign a core schema contract to asset-manager-v2 in this PR
- edit/process: do not define new rebuild-owned JSON fields from asset-manager-v2
- export/save: no core export/save contract is assigned to tools.asset-manager-v2
- publish: tools.asset-manager-v2 remains a reference-only null published-output shape
- copy/create payload: no core payload copy/create behavior is assigned until a later cleanup PR

## Valid JSON Behavior
- accepted only as the current transitional reference behavior found in this exact folder

## Invalid JSON Rejection Behavior
- any attempt to use this folder as the core rebuild contract
- any behavior that conflicts with the rebuilt core tool contract when cleanup occurs later

## Published Output
Published Output:
```jsonc
tools.asset-manager-v2 = {
  "publishedOutput": null,
  "status": "transitional-reference-only"
}
```

## Playwright Expectations
- load tools/asset-manager-v2/index.html only if later cleanup needs a reference screenshot
- do not use this folder for core publish-contract verification

## Manual Test Expectations
- Inspect tools/asset-manager-v2 only as a deferred reference surface.
- Do not rebuild from this folder unless a later cleanup PR explicitly scopes it.

## Known Gaps
- Deferred cleanup after core tool contracts are rebuilt and stable.

## Rebuild Order Priority
Deferred transitional/reference cleanup. Do not place this folder in the core rebuild lane.
