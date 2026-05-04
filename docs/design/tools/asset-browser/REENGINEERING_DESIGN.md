# Asset Browser Reengineering Design

Task: PR_26124_022-tighten-tool-design-docs
Classification: rebuildable tool
Core priority: core-02
Source folder: `tools/Asset Browser`
Publish target: `tools.asset-browser`

## Tool Purpose
Approved asset browsing and import-plan authoring. This tool owns asset selection, import candidate validation, and publish to `tools.asset-browser`.

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
- ambiguous `Use In Active Tool` handoff as a persisted JSON owner

Add:
- Load asset-browser JSON
- Validate asset catalog/import plan
- Publish `tools.asset-browser`
- copy selected asset as launch payload only

## JSON Contract Owned By This Tool
Baseline schema: `tools/schemas/tools/asset-browser.schema.json`. Required top-level fields: assets. Allowed top-level fields: assets, assetBrowserPreset, approvedAssets, importHubPreset. Additional top-level properties are rejected by the current schema. The tool owns import/load, validation, edit/process, export/save, and publish of this payload. Workspace may pass a launch payload, but nested JSON remains tool-owned.

## Hosted/Launch Payload Boundary
- Launch payloads may seed this tool, but they do not become workspace-owned internals.
- toolState copies may be created later from the published output, but the copied JSON must still match this tool contract.
- Use file/path/name fields for assets. Do not persist `imageDataUrl`.

## Invalid JSON Behavior
- Reject malformed JSON before state mutation.
- Reject missing required fields from the schema baseline.
- Reject unsupported top-level fields when the schema disallows extras.
- Keep export/save/publish disabled until the current payload validates.
- Show a tool-specific error that names the failing field or control group.

## Manual Test Plan
- Filter assets by category and search term.
- Select an asset and confirm preview/meta text updates.
- Build an import plan, validate it, download it, and confirm invalid category/destination/name combinations are blocked.
