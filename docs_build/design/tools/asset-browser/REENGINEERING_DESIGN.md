# Asset Browser Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-02
Source folder: `tools/Asset Browser`
Publish target: `tools.asset-browser`

## Tool Purpose
Asset Browser owns approved asset manifest browsing, asset import/load validation, manifest editing, export, and publish to `tools.asset-browser`.

## Folder/Files Inspected
- `tools/Asset Browser/assetBrowser.css`
- `tools/Asset Browser/how_to_use.html`
- `tools/Asset Browser/index.html`
- `tools/Asset Browser/main.js`
- `tools/Asset Browser/README.md`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/Asset Browser/index.html`: `input[search]#assetSearchInput` - Filter by name or path | Filters the visible asset entry list. | No tools.asset-browser JSON change; affects the current view filter only. |
| `tools/Asset Browser/index.html`: `input[file]#importFileInput` - importFileInput | Chooses a local file for asset manifest payload import/load. | Replaces or merges tool-owned asset manifest payload only after the import validates. |
| `tools/Asset Browser/index.html`: `input[text]#importNameInput` - lowercase-name.ext | Edits the active asset entry field. | Updates the draft asset manifest payload field represented by `importNameInput` before validation. |
| `tools/Asset Browser/index.html`: `select#assetCategoryFilter` - assetCategoryFilter | Filters the visible asset entry list. | No tools.asset-browser JSON change; affects the current view filter only. |
| `tools/Asset Browser/index.html`: `button[button]#useAssetInToolButton` - Use In Active Tool | Publishes or applies the validated asset manifest payload. | Writes the validated output shape to tools.asset-browser. |
| `tools/Asset Browser/index.html`: `select#importCategorySelect` - importCategorySelect | Edits the active asset entry field. | Updates the draft asset manifest payload field represented by `importCategorySelect` before validation. |
| `tools/Asset Browser/index.html`: `select#importDestinationSelect` - importDestinationSelect | Edits the active asset entry field. | Updates the draft asset manifest payload field represented by `importDestinationSelect` before validation. |
| `tools/Asset Browser/index.html`: `button[button]#validateImportButton` - Validate Plan | Validates the current asset manifest payload. | Updates validation status; blocks tools.asset-browser output when errors are present. |
| `tools/Asset Browser/index.html`: `button[button]#downloadImportPlanButton` - Download Plan JSON | Exports the validated asset manifest payload. | Serializes the validated asset manifest payload as the tools.asset-browser output shape. |

## Panels And Surfaces Found
- `tools/Asset Browser/how_to_use.html`: `.tools-platform-surface`
- `tools/Asset Browser/index.html`: `.app-shell`
- `tools/Asset Browser/index.html`: `.asset-browser__layout`
- `tools/Asset Browser/index.html`: `.asset-browser__list`
- `tools/Asset Browser/index.html`: `.asset-browser__panel`
- `tools/Asset Browser/index.html`: `.asset-browser__preview`
- `tools/Asset Browser/index.html`: `.asset-browser__text-preview`
- `tools/Asset Browser/index.html`: `.panel`
- `tools/Asset Browser/index.html`: `.tools-platform-layout-grid`
- `tools/Asset Browser/index.html`: `.tools-platform-resize-panel`

## Current Component/Class/Function Inventory
- `tools/Asset Browser/main.js`: applyAssetBrowserPreset; applyLaunchContext; applyProjectState; bindEvents; bootAssetBrowser; buildApprovedAssetEmptyStateText; buildApprovedAssetStatusText; buildImportPlan; buildPresetLoadedStatus; captureProjectState; classifyApprovedAssetState; collectCatalogPathCandidates; downloadImportPlan; emitAssetBrowserControlReadiness; ensureFirstVisibleAssetSelection; extractAssetBrowserCatalogFromPreset; extractAssetBrowserPreset; extractCompanionAssetPayload; findCompanionPresetPath; getActiveAssetEmptyStateMessage; getApi; getAssetTypeFromCategory; getCategoryOrder; getPathExtension; getSelectedAsset; getVisibleAssets; humanizeAssetId; hydrateApprovedAssetCatalog; hydrateCatalogLabels; inferAssetKindFromPath; inferCategoryFromFileName; init; inspectManifestAssetBrowserSource; loadCatalogEntriesFromContext; loadCompanionSampleEntries; loadSampleMetadataManifest; loadSamplePresetCatalogEntries; mapCompanionPresetToEntries; mapKindToCategory; normalizeCatalogEntries; normalizeExplicitCatalogPath; normalizeImportName; normalizeLocalPath; normalizeManifestAssetEntries; normalizeManifestToolAssetEntries; normalizePresetAssetEntries; normalizeSampleId; normalizeSamplePresetPath; normalizeToolId; populateCategoryControls; populateDestinationOptions; pushEntry; readActiveProjectManifest; readCatalogEntriesFromPath; registerToolBootContract; renderAssetList; renderImportPlan; renderPreview; resolveInitialSelectedAssetId; sanitizeText; setAssetBrowserLifecycle; syncAssetBrowserUxContract; syncImportFormFromFile; toTitleCase; tryLoadPresetFromQuery; useSelectedAssetInActiveTool

## Target Controls
Keep:
- asset library/search controls
- asset detail/selection panels
- asset import/load controls
- asset manifest copy/export controls

Remove or rename:
- any asset publish path that bypasses manifest validation

Add:
- Validate Asset Manifest
- Publish `tools.asset-browser`
- clear invalid asset id/path/kind/source feedback

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for asset manifest payload. Current contract baseline: `tools/schemas/tools/asset-browser.schema.json` (asset-browser Payload).
Required keys: `assets`.
Optional keys: `assetBrowserPreset`, `approvedAssets`, `importHubPreset`.

Tool-owned JSON responsibilities:
- import/load: parse incoming asset manifest payload and reject it before mutation when invalid
- validate: apply the current asset manifest payload contract before export, copy, or publish
- edit/process: mutate only asset manifest payload fields owned by Asset Browser
- export/save: serialize the validated asset manifest payload as the tools.asset-browser output shape
- publish: write only the validated tools.asset-browser value produced by Asset Browser
- copy/create payload: create copied payload text from the validated asset manifest payload, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts an object with an `assets` map
- requires each asset entry to include `path`, `kind`, and `source`
- allows only schema-defined asset ids and optional asset browser/import preset payloads

## Invalid JSON Rejection Behavior
- malformed JSON
- missing `assets`
- asset ids outside the schema patterns
- asset entries without `path`, `kind`, or `source`
- non-bezel assets carrying bezel-only stretch data

## Published Output
Published Output:
```jsonc
tools.asset-browser = {
  "assets": {
    "image.<project>.<name>.bezel": {
      "path": "string",
      "kind": "image",
      "source": "workspace-manager|asset-browser|manifest",
      "stretchOverride": {
        "uniformEdgeStretchPx": 1
      } // optional for bezel image entries only
    },
    "(image|audio|font|svg|data|other).<project>.<name>": {
      "path": "string",
      "kind": "image|audio|font|svg|data|other",
      "source": "workspace-manager|asset-browser|manifest"
    }
  },
  "assetBrowserPreset": "jsonValue", // optional
  "approvedAssets": "jsonValue", // optional
  "importHubPreset": "jsonValue" // optional
}
```

## Playwright Expectations
- load `tools/Asset Browser/index.html` without console errors
- import a valid asset manifest and confirm the list/detail surfaces update
- reject a manifest with an invalid asset id or missing path

## Manual Test Expectations
- Open `tools/Asset Browser/index.html` and inspect the asset list/detail flow.
- Import or paste a valid asset manifest and export it unchanged except for tool-owned normalization.
- Try an invalid asset key and an entry without `path`; each must block publish.

## Known Gaps
- Asset publish should be explicit and separate from preview selection.
- Validation feedback should call out the exact failing asset key.

## Rebuild Order Priority
core-02: rebuild in the core tool lane after earlier priorities are stable.
