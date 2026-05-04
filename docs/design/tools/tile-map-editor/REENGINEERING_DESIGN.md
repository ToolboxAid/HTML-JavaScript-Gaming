# Tilemap Studio Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `tile-map-editor`
Source folder: `tools/Tilemap Studio`

## 1. Tool Purpose
Author tile maps, layers, tilesets, collision data, and export tile map documents owned by the tool.

## 2. Folder/Files Inspected
- `tools/Tilemap Studio/how_to_use.html`
- `tools/Tilemap Studio/index.html`
- `tools/Tilemap Studio/main.js`
- `tools/Tilemap Studio/README.md`
- `tools/Tilemap Studio/tileMapEditor.css`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 27, inputs 14, selects 3, textareas 0, tables 0, inferred DOM controls/panels 46.
- `tools/Tilemap Studio/index.html`: button[button] #loadAssetRegistryButton - Load Assets Registry
- `tools/Tilemap Studio/index.html`: input[file] #loadAssetRegistryInput - loadAssetRegistryInput
- `tools/Tilemap Studio/index.html`: button[button] #saveAssetRegistryButton - Save Assets Registry
- `tools/Tilemap Studio/index.html`: button[button] #simulateButton - Simulate
- `tools/Tilemap Studio/index.html`: button[button] #playSimulationButton - Play
- `tools/Tilemap Studio/index.html`: button[button] #pauseSimulationButton - Pause
- `tools/Tilemap Studio/index.html`: button[button] #restartSimulationButton - Restart Position
- `tools/Tilemap Studio/index.html`: button[button] #exitSimulationButton - Exit Simulation
- `tools/Tilemap Studio/index.html`: button[button] #exportRuntimeButton - Export Runtime
- `tools/Tilemap Studio/index.html`: button[button] #packageProjectButton - Package Project
- `tools/Tilemap Studio/index.html`: input[text] #mapNameInput - untitled-map
- `tools/Tilemap Studio/index.html`: input[number] #mapWidthInput - 32
- `tools/Tilemap Studio/index.html`: input[number] #mapHeightInput - 18
- `tools/Tilemap Studio/index.html`: input[number] #tileSizeInput - 24
- `tools/Tilemap Studio/index.html`: button[button] #applyMapSizeButton - Apply Size
- `tools/Tilemap Studio/index.html`: select #activeToolSelect - Paint Erase Picker Marker
- `tools/Tilemap Studio/index.html`: button[button] #loadTilesetPngButton - Load Tileset PNG
- `tools/Tilemap Studio/index.html`: input[file] #loadTilesetPngInput - loadTilesetPngInput
- `tools/Tilemap Studio/index.html`: button[button] #loadTilePngAssetsButton - Load Tile PNG(s)
- `tools/Tilemap Studio/index.html`: input[file] #loadTilePngAssetsInput - loadTilePngAssetsInput
- `tools/Tilemap Studio/index.html`: button[button] #generateTilesetButton - Generate Tile Grid
- `tools/Tilemap Studio/index.html`: input[number] #tilesetTileWidthInput - 24
- `tools/Tilemap Studio/index.html`: input[number] #tilesetTileHeightInput - 24
- `tools/Tilemap Studio/index.html`: input[number] #tilesetSpacingInput - 0
- `tools/Tilemap Studio/index.html`: input[number] #tilesetMarginInput - 0
- `tools/Tilemap Studio/index.html`: select #markerTypeSelect - Spawn Object
- `tools/Tilemap Studio/index.html`: input[text] #markerNameInput - spawn-point
- `tools/Tilemap Studio/index.html`: button[button] #clearMarkersButton - Clear Markers
- `tools/Tilemap Studio/index.html`: input[range] #canvasZoomInput - 100
- `tools/Tilemap Studio/index.html`: button[button] - + Tileset
- `tools/Tilemap Studio/index.html`: button[button] - + Markers
- `tools/Tilemap Studio/index.html`: button[button] - + Layers
- `tools/Tilemap Studio/index.html`: button[button] - + Usage
- `tools/Tilemap Studio/index.html`: button[button] - + Remediation
- `tools/Tilemap Studio/index.html`: input[text] #newLayerNameInput - Layer
- `tools/Tilemap Studio/index.html`: select #newLayerKindSelect - Tile Collision Data
- `tools/Tilemap Studio/index.html`: button[button] #addLayerButton - Add Layer
- `tools/Tilemap Studio/index.html`: button[button] #removeLayerButton - Remove Layer
- `tools/Tilemap Studio/index.html`: button[button] #layerVisibilityToggle - Toggle Visibility
- `tools/Tilemap Studio/index.html`: button[button] #inspectRemediationButton - Inspect Issues
- `tools/Tilemap Studio/index.html`: button[button] #jumpToProblemButton - Jump to Problem
- `tools/Tilemap Studio/index.html`: button[button] #applyRemediationButton - Apply Suggested Fix
- `tools/Tilemap Studio/index.html`: button[button] #refreshExperienceButton - Refresh Pipeline View
- `tools/Tilemap Studio/index.html`: button[button] #refreshDebugVisualizationButton - Refresh Debug View
- `tools/Tilemap Studio/main.js`: button #newProjectButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #loadProjectButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #loadProjectInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #saveProjectButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #loadAssetRegistryButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #loadAssetRegistryInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #saveAssetRegistryButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #simulateButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #playSimulationButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #pauseSimulationButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #restartSimulationButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #exitSimulationButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #exportRuntimeButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #packageProjectButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #refreshExperienceButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #refreshDebugVisualizationButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #inspectRemediationButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #jumpToProblemButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #applyRemediationButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #mapNameInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #mapWidthInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #mapHeightInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #tileSizeInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #applyMapSizeButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: select #activeToolSelect - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #canvasZoomInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: panel #canvasZoomReadout - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #loadTilesetPngButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #loadTilesetPngInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #loadTilePngAssetsButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #loadTilePngAssetsInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #tilesetTileWidthInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #tilesetTileHeightInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #tilesetSpacingInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #tilesetMarginInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #generateTilesetButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: panel #layerList - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #newLayerNameInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: select #newLayerKindSelect - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #addLayerButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #removeLayerButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: select #markerTypeSelect - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: input #markerNameInput - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: button #clearMarkersButton - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: panel #markerList - inferred from JS DOM lookup
- `tools/Tilemap Studio/main.js`: panel #mapCanvas - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/Tilemap Studio/index.html`: .app-shell
  - `tools/Tilemap Studio/index.html`: .toolbar
  - `tools/Tilemap Studio/index.html`: .toolbar-group
  - `tools/Tilemap Studio/index.html`: .tools-platform-control-cluster--preview
  - `tools/Tilemap Studio/index.html`: .workspace
  - `tools/Tilemap Studio/index.html`: .tools-platform-layout-grid
  - `tools/Tilemap Studio/index.html`: .sidebar
  - `tools/Tilemap Studio/index.html`: .left-sidebar
  - `tools/Tilemap Studio/index.html`: .tools-platform-resize-panel
  - `tools/Tilemap Studio/index.html`: .panel-accordion
  - `tools/Tilemap Studio/index.html`: .panel-accordion__summary
  - `tools/Tilemap Studio/index.html`: .panel-accordion__body
  - `tools/Tilemap Studio/index.html`: .tileset-config-grid
  - `tools/Tilemap Studio/index.html`: .marker-list
  - `tools/Tilemap Studio/index.html`: .canvas-panel
  - `tools/Tilemap Studio/index.html`: .canvas-toolbar
  - `tools/Tilemap Studio/index.html`: .canvas-zoom-control
  - `tools/Tilemap Studio/index.html`: .canvas-wrap
  - `tools/Tilemap Studio/index.html`: .status-text
  - `tools/Tilemap Studio/index.html`: .right-sidebar
  - `tools/Tilemap Studio/index.html`: .layer-list
  - `tools/Tilemap Studio/index.html`: .usage-list

## 4. Current Component/Class/Function Inventory
- `tools/Tilemap Studio/main.js`: class TileMapEditorApp; function applyProjectSystemState; function bootTileMapStudio; function buildPresetLoadedStatus; function buildTilesetFromAtlas; function clampInteger; function cloneDeep; function computeAtlasGridMetrics; function createDefaultTilesetAtlas; function createGrid; function createInitialDocument; function createLayer; function createPersistableTileMapDocument; function createRuntimeExport; function downloadTextFile; function ensureGridSize; function extractTileMapDocumentFromSamplePreset; function generateLayerId; function getOrderedImageSources; function getPrimaryImageSource; function isStrictWorkspaceTilemapSnapshot; function loadImageElement; function normalizeCellValue; function normalizeSamplePresetPath; function sanitizeAssetRefs; function sanitizeDocument; function sanitizeLayer; function sanitizeMarkers; function sanitizeTileset; function sanitizeTilesetAtlas; function sanitizeTileSource; function summarizeGraphFindings; function tick; function toProjectAssetUrl; method addLayer; method advanceSimulationProbe; method applyCanvasZoom; method applyCellEdit; method applyMapSizing; method applyRemediationAction; method applyTilesetAtlasSettingsFromInputs; method attachEvents; method bindRuntimeStateSync; method buildSimulationCellSummary; method buildSimulationCellSummaryFromDetails; method captureRefs; method clearTransientImageSources; method composeTilesetWithAtlasTiles; method destroy; method drawCheckerboard; method drawCollisionLayer; method drawDataLayer; method drawGrid; method drawMarkers; method drawSimulationOverlay; method drawTileLayer; method emitTilemapControlReadiness; method ensureEditable; method ensureFirstTileSelection; method ensureSimulationProbeVisible; ... 81 more

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/tools/tile-map-editor.schema.json`. Title: tile-map-editor Payload. Required top-level fields: (none listed). Allowed top-level fields: tileMapDocument, tilemapDocumentPath, parallaxDocument. Additional top-level properties: rejected.

JSON handling signals found: Blob/object URL, download/export, FileReader, JSON.parse, JSON.stringify, schema, validate.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the current schema baseline or tool-owned normalized shape, update the local editor/preview state, and remain exportable as path/file-field JSON without embedding `imageDataUrl`.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing required fields, unsupported top-level fields, wrong nested types, and empty required editor payloads must be rejected in the tool UI before export/save/publish.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.tile-map-editor` if applicable: yes, publish normalized output under `tools.tile-map-editor` when this tool is the producer.
- copy/create toolState if applicable: only if a future workspace flow copies a published `tools.*` entry into a toolState; the tool JSON remains tool-owned.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.tile-map-editor`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/Tilemap Studio/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/Tilemap Studio/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P10: Tilemap Studio. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
