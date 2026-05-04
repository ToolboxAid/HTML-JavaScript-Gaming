# Asset Browser Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `asset-browser`
Source folder: `tools/Asset Browser`

## 1. Tool Purpose
Browse approved assets, filter import candidates, validate import plans, and emit asset-browser payloads for downstream tools.

## 2. Folder/Files Inspected
- `tools/Asset Browser/assetBrowser.css`
- `tools/Asset Browser/how_to_use.html`
- `tools/Asset Browser/index.html`
- `tools/Asset Browser/main.js`
- `tools/Asset Browser/README.md`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 4, inputs 3, selects 3, textareas 0, tables 0, inferred DOM controls/panels 10.
- `tools/Asset Browser/index.html`: select #assetCategoryFilter - assetCategoryFilter
- `tools/Asset Browser/index.html`: input[search] #assetSearchInput - Filter by name or path
- `tools/Asset Browser/index.html`: button[button] #useAssetInToolButton - Use In Active Tool
- `tools/Asset Browser/index.html`: input[file] #importFileInput - importFileInput
- `tools/Asset Browser/index.html`: select #importCategorySelect - importCategorySelect
- `tools/Asset Browser/index.html`: select #importDestinationSelect - importDestinationSelect
- `tools/Asset Browser/index.html`: input[text] #importNameInput - lowercase-name.ext
- `tools/Asset Browser/index.html`: button[button] #validateImportButton - Validate Plan
- `tools/Asset Browser/index.html`: button[button] #downloadImportPlanButton - Download Plan JSON
- `tools/Asset Browser/main.js`: button[button] #${entry.id} - ${entry.label} ${entry.category} ${entry.path}
- `tools/Asset Browser/main.js`: input #assetSearchInput - inferred from JS DOM lookup
- `tools/Asset Browser/main.js`: panel #assetList - inferred from JS DOM lookup
- `tools/Asset Browser/main.js`: panel #assetPreviewCanvas - inferred from JS DOM lookup
- `tools/Asset Browser/main.js`: button #useAssetInToolButton - inferred from JS DOM lookup
- `tools/Asset Browser/main.js`: input #importFileInput - inferred from JS DOM lookup
- `tools/Asset Browser/main.js`: select #importCategorySelect - inferred from JS DOM lookup
- `tools/Asset Browser/main.js`: select #importDestinationSelect - inferred from JS DOM lookup
- `tools/Asset Browser/main.js`: input #importNameInput - inferred from JS DOM lookup
- `tools/Asset Browser/main.js`: button #validateImportButton - inferred from JS DOM lookup
- `tools/Asset Browser/main.js`: button #downloadImportPlanButton - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/Asset Browser/index.html`: .app-shell
  - `tools/Asset Browser/index.html`: .panel
  - `tools/Asset Browser/index.html`: .asset-browser__panel
  - `tools/Asset Browser/index.html`: .tools-platform-layout-grid
  - `tools/Asset Browser/index.html`: .tools-platform-resize-panel
  - `tools/Asset Browser/index.html`: .asset-browser__list
  - `tools/Asset Browser/index.html`: .asset-browser__preview
  - `tools/Asset Browser/index.html`: .asset-browser__text-preview
  - `tools/Asset Browser/index.html`: .asset-browser__status

## 4. Current Component/Class/Function Inventory
- `tools/Asset Browser/main.js`: function applyAssetBrowserPreset; function applyLaunchContext; function bindEvents; function bootAssetBrowser; function buildApprovedAssetEmptyStateText; function buildApprovedAssetStatusText; function buildImportPlan; function buildPresetLoadedStatus; function classifyApprovedAssetState; function collectCatalogPathCandidates; function downloadImportPlan; function emitAssetBrowserControlReadiness; function ensureFirstVisibleAssetSelection; function extractAssetBrowserCatalogFromPreset; function extractAssetBrowserPreset; function extractCompanionAssetPayload; function findCompanionPresetPath; function getActiveAssetEmptyStateMessage; function getAssetTypeFromCategory; function getCategoryOrder; function getPathExtension; function getSelectedAsset; function getVisibleAssets; function humanizeAssetId; function hydrateApprovedAssetCatalog; function hydrateCatalogLabels; function inferAssetKindFromPath; function inferCategoryFromFileName; function init; function inspectManifestAssetBrowserSource; function loadCatalogEntriesFromContext; function loadCompanionSampleEntries; function loadSampleMetadataManifest; function loadSamplePresetCatalogEntries; function mapCompanionPresetToEntries; function mapKindToCategory; function normalizeCatalogEntries; function normalizeExplicitCatalogPath; function normalizeImportName; function normalizeLocalPath; function normalizeManifestAssetEntries; function normalizeManifestToolAssetEntries; function normalizePresetAssetEntries; function normalizeSampleId; function normalizeSamplePresetPath; function normalizeToolId; function populateCategoryControls; function populateDestinationOptions; function pushEntry; function readActiveProjectManifest; function readCatalogEntriesFromPath; function renderAssetList; function renderImportPlan; function renderPreview; function resolveInitialSelectedAssetId; function sanitizeText; function setAssetBrowserLifecycle; function syncAssetBrowserUxContract; function syncImportFormFromFile; function toTitleCase; ... 6 more

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/tools/asset-browser.schema.json`. Title: asset-browser Payload. Required top-level fields: assets. Allowed top-level fields: assets, assetBrowserPreset, approvedAssets, importHubPreset. Additional top-level properties: rejected.

JSON handling signals found: Blob/object URL, download/export, JSON.parse, JSON.stringify, localStorage, schema, tools.*, validate.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the current schema baseline or tool-owned normalized shape, update the local editor/preview state, and remain exportable as path/file-field JSON without embedding `imageDataUrl`.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing required fields, unsupported top-level fields, wrong nested types, and empty required editor payloads must be rejected in the tool UI before export/save/publish.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.asset-browser` if applicable: yes, publish normalized output under `tools.asset-browser` when this tool is the producer.
- copy/create toolState if applicable: only if a future workspace flow copies a published `tools.*` entry into a toolState; the tool JSON remains tool-owned.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.asset-browser`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/Asset Browser/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/Asset Browser/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P03: Asset Browser. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
