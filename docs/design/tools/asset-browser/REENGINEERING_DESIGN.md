# Asset Browser Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: rebuildable tool
Core priority: core-02
Source folder: `tools/Asset Browser`
Publish target: `tools.asset-browser`

## Tool Purpose
Approved asset browsing and import-plan authoring. Asset Browser owns asset selection, import candidate validation, and publish to `tools.asset-browser`.

## Exact Folder/Files Inspected
- `tools/Asset Browser/assetBrowser.css`
- `tools/Asset Browser/how_to_use.html`
- `tools/Asset Browser/index.html`
- `tools/Asset Browser/main.js`
- `tools/Asset Browser/README.md`

## Exact Current Controls Found
- `tools/Asset Browser/index.html`: `select#assetCategoryFilter` - assetCategoryFilter
- `tools/Asset Browser/index.html`: `input[search]#assetSearchInput` - Filter by name or path
- `tools/Asset Browser/index.html`: `button[button]#useAssetInToolButton` - Use In Active Tool
- `tools/Asset Browser/index.html`: `input[file]#importFileInput` - importFileInput
- `tools/Asset Browser/index.html`: `select#importCategorySelect` - importCategorySelect
- `tools/Asset Browser/index.html`: `select#importDestinationSelect` - importDestinationSelect
- `tools/Asset Browser/index.html`: `input[text]#importNameInput` - lowercase-name.ext
- `tools/Asset Browser/index.html`: `button[button]#validateImportButton` - Validate Plan
- `tools/Asset Browser/index.html`: `button[button]#downloadImportPlanButton` - Download Plan JSON
- `tools/Asset Browser/main.js`: `assetCategoryFilter` via categoryFilter
- `tools/Asset Browser/main.js`: `assetSearchInput` via searchInput
- `tools/Asset Browser/main.js`: `launchContextText` via launchContextText
- `tools/Asset Browser/main.js`: `assetCountText` via countText
- `tools/Asset Browser/main.js`: `assetList` via assetList
- `tools/Asset Browser/main.js`: `assetPreviewTitle` via previewTitle
- `tools/Asset Browser/main.js`: `assetPreviewMeta` via previewMeta
- `tools/Asset Browser/main.js`: `assetPreviewCanvas` via previewCanvas
- `tools/Asset Browser/main.js`: `useAssetInToolButton` via useAssetInToolButton
- `tools/Asset Browser/main.js`: `assetPreviewText` via previewText
- `tools/Asset Browser/main.js`: `importFileInput` via importFileInput
- `tools/Asset Browser/main.js`: `importCategorySelect` via importCategorySelect
- `tools/Asset Browser/main.js`: `importDestinationSelect` via importDestinationSelect
- `tools/Asset Browser/main.js`: `importNameInput` via importNameInput
- `tools/Asset Browser/main.js`: `validateImportButton` via validateImportButton
- `tools/Asset Browser/main.js`: `downloadImportPlanButton` via downloadImportPlanButton
- `tools/Asset Browser/main.js`: `importStatusText` via importStatusText
- `tools/Asset Browser/main.js`: `importPlanText` via importPlanText

## Current Panels And Surfaces Found
- `tools/Asset Browser/index.html`: `.app-shell`
- `tools/Asset Browser/index.html`: `.panel`
- `tools/Asset Browser/index.html`: `.asset-browser__panel`
- `tools/Asset Browser/index.html`: `.tools-platform-layout-grid`
- `tools/Asset Browser/index.html`: `.tools-platform-resize-panel`
- `tools/Asset Browser/index.html`: `.asset-browser__list`
- `tools/Asset Browser/index.html`: `.asset-browser__preview`
- `tools/Asset Browser/index.html`: `.asset-browser__text-preview`
- `tools/Asset Browser/index.html`: `.asset-browser__status`

## Exact Current Functions And Classes
- `tools/Asset Browser/main.js`: function applyAssetBrowserPreset; function applyLaunchContext; function bindEvents; function bootAssetBrowser; function buildApprovedAssetEmptyStateText; function buildApprovedAssetStatusText; function buildImportPlan; function buildPresetLoadedStatus; function classifyApprovedAssetState; function collectCatalogPathCandidates; function downloadImportPlan; function emitAssetBrowserControlReadiness; function ensureFirstVisibleAssetSelection; function extractAssetBrowserCatalogFromPreset; function extractAssetBrowserPreset; function extractCompanionAssetPayload; function findCompanionPresetPath; function getActiveAssetEmptyStateMessage; function getAssetTypeFromCategory; function getCategoryOrder; function getPathExtension; function getSelectedAsset; function getVisibleAssets; function humanizeAssetId; function hydrateApprovedAssetCatalog; function hydrateCatalogLabels; function inferAssetKindFromPath; function inferCategoryFromFileName; function init; function inspectManifestAssetBrowserSource; function loadCatalogEntriesFromContext; function loadCompanionSampleEntries; function loadSampleMetadataManifest; function loadSamplePresetCatalogEntries; function mapCompanionPresetToEntries; function mapKindToCategory; function normalizeCatalogEntries; function normalizeExplicitCatalogPath; function normalizeImportName; function normalizeLocalPath; function normalizeManifestAssetEntries; function normalizeManifestToolAssetEntries; function normalizePresetAssetEntries; function normalizeSampleId; function normalizeSamplePresetPath; function normalizeToolId; function populateCategoryControls; function populateDestinationOptions; function pushEntry; function readActiveProjectManifest; function readCatalogEntriesFromPath; function renderAssetList; function renderImportPlan; function renderPreview; function resolveInitialSelectedAssetId; function sanitizeText; function setAssetBrowserLifecycle; function syncAssetBrowserUxContract; function syncImportFormFromFile; function toTitleCase; function tryLoadPresetFromQuery; function useSelectedAssetInActiveTool; method applyProjectState; method captureProjectState; method destroy; method getApi

## Target Controls
Keep:
- category filter
- search input
- asset list and preview
- import file/category/destination/name controls
- Validate Plan
- Download Plan JSON

Remove or rename:
- treat `Use In Active Tool` as a transient handoff, not a JSON ownership path

Add:
- Load Asset Browser JSON
- Validate asset catalog/import plan
- Publish `tools.asset-browser`

## JSON Contract Owned By This Tool
Owned JSON is the asset-browser payload. Required field is `assets`. Optional fields are `assetBrowserPreset`, `approvedAssets`, and `importHubPreset`. Import-plan output must use asset ids, categories, destinations, and path/name metadata produced by Asset Browser controls.

## Publish Output
Publish only to `tools.asset-browser`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- missing `assets`
- `assets` that is not the expected asset collection
- invalid import category/destination/name values
- unsupported top-level fields

## Manual Test Plan
- Filter assets by category and search term.
- Select an asset and confirm preview/meta text updates.
- Build an import plan, validate it, download it, and re-load it.
- Try bad category/destination/name combinations; validation must block publish.
