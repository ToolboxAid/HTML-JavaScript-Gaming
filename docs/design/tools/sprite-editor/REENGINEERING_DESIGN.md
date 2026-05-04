# Sprite Editor Reengineering Design

Task: PR_26124_022-tighten-tool-design-docs
Classification: rebuildable tool
Core priority: core-05
Source folder: `tools/Sprite Editor`
Publish target: `tools.sprite-editor`

## Tool Purpose
Sprite project authoring. This tool owns `spriteProject`, optional `assetRegistry`, frame/animation editing, validation, export, and publish to `tools.sprite-editor`.

## Exact Folder/Files Inspected
- `tools/Sprite Editor/how_to_use.html`
- `tools/Sprite Editor/index.html`
- `tools/Sprite Editor/main.js`
- `tools/Sprite Editor/modules/colorUtils.js`
- `tools/Sprite Editor/modules/constants.js`
- `tools/Sprite Editor/modules/projectModel.js`
- `tools/Sprite Editor/modules/spriteEditorApp.js`
- `tools/Sprite Editor/README.md`
- `tools/Sprite Editor/spriteEditor.css`

## Exact Current Controls Found
- `tools/Sprite Editor/index.html`: `input[number]#canvasWidthInput` - canvasWidthInput
- `tools/Sprite Editor/index.html`: `input[number]#canvasHeightInput` - canvasHeightInput
- `tools/Sprite Editor/index.html`: `button[button]#newCanvasButton` - Create New Canvas
- `tools/Sprite Editor/index.html`: `input[range]#pixelSizeInput` - pixelSizeInput
- `tools/Sprite Editor/index.html`: `input[checkbox]#gridToggle` - gridToggle
- `tools/Sprite Editor/index.html`: `button[button]` - Pencil
- `tools/Sprite Editor/index.html`: `button[button]` - Eraser
- `tools/Sprite Editor/index.html`: `button[button]` - Fill
- `tools/Sprite Editor/index.html`: `select#paletteSelect` - Select Palette...
- `tools/Sprite Editor/index.html`: `input[color]#colorPicker` - colorPicker
- `tools/Sprite Editor/index.html`: `button[button]#color1SelectorButton` - Color 1 none
- `tools/Sprite Editor/index.html`: `button[button]#color2SelectorButton` - Color 2 none
- `tools/Sprite Editor/index.html`: `button[button]#prevFrameButton` - Prev
- `tools/Sprite Editor/index.html`: `button[button]#nextFrameButton` - Next
- `tools/Sprite Editor/index.html`: `button[button]#addFrameButton` - Add
- `tools/Sprite Editor/index.html`: `button[button]#duplicateFrameButton` - Duplicate
- `tools/Sprite Editor/index.html`: `button[button]#deleteFrameButton` - Delete
- `tools/Sprite Editor/index.html`: `button[button]#undoButton` - Undo
- `tools/Sprite Editor/index.html`: `button[button]#redoButton` - Redo
- `tools/Sprite Editor/index.html`: `input[checkbox]#onionSkinToggle` - onionSkinToggle
- `tools/Sprite Editor/index.html`: `button[button]#saveAssetRegistryButton` - Save Assets Registry
- `tools/Sprite Editor/index.html`: `button[button]#loadAssetRegistryButton` - Load Assets Registry
- `tools/Sprite Editor/index.html`: `input[file]#loadAssetRegistryInput` - loadAssetRegistryInput
- `tools/Sprite Editor/index.html`: `button[button]#saveProjectButton` - Save JSON
- `tools/Sprite Editor/index.html`: `button[button]#loadProjectButton` - Load JSON
- `tools/Sprite Editor/index.html`: `input[file]#loadProjectInput` - loadProjectInput
- `tools/Sprite Editor/index.html`: `button[button]#importPngButton` - Import PNG
- `tools/Sprite Editor/index.html`: `button[button]#exportPngButton` - Export Frame PNG
- `tools/Sprite Editor/index.html`: `button[button]#exportSheetButton` - Export Sprite Sheet
- `tools/Sprite Editor/index.html`: `button[button]#packageProjectButton` - Package Project
- `tools/Sprite Editor/index.html`: `input[file]#importPngInput` - importPngInput
- `tools/Sprite Editor/index.html`: `button[button]` - + Colors
- `tools/Sprite Editor/index.html`: `button[button]` - + Frames
- `tools/Sprite Editor/index.html`: `button[button]` - + Project I/O
- `tools/Sprite Editor/index.html`: `button[button]` - + Preview
- `tools/Sprite Editor/index.html`: `button[button]` - + Status
- `tools/Sprite Editor/index.html`: `button[button]#playPreviewButton` - Play
- `tools/Sprite Editor/index.html`: `button[button]#pausePreviewButton` - Pause
- `tools/Sprite Editor/index.html`: `button[button]#resetPreviewButton` - Reset
- `tools/Sprite Editor/index.html`: `input[range]#fpsInput` - fpsInput
- `tools/Sprite Editor/index.html`: `button[button]#inspectRemediationButton` - Inspect Issues
- `tools/Sprite Editor/index.html`: `button[button]#jumpToProblemButton` - Jump to Problem
- `tools/Sprite Editor/index.html`: `button[button]#applyRemediationButton` - Apply Suggested Fix
- `tools/Sprite Editor/index.html`: `button[button]#refreshExperienceButton` - Refresh Pipeline View
- `tools/Sprite Editor/index.html`: `button[button]#refreshDebugVisualizationButton` - Refresh Debug View
- `tools/Sprite Editor/main.js`: `leftSidebar` via leftSidebar
- `tools/Sprite Editor/main.js`: `rightSidebar` via rightSidebar

## Current Panels And Surfaces Found
- `tools/Sprite Editor/index.html`: `.app-shell`
- `tools/Sprite Editor/index.html`: `.toolbar-row`
- `tools/Sprite Editor/index.html`: `.toolbar-group`
- `tools/Sprite Editor/index.html`: `.tools-platform-control-cluster--preview`
- `tools/Sprite Editor/index.html`: `.tools-platform-layout-grid`
- `tools/Sprite Editor/index.html`: `.left-panel`
- `tools/Sprite Editor/index.html`: `.tools-platform-resize-panel`
- `tools/Sprite Editor/index.html`: `.panel-accordion`
- `tools/Sprite Editor/index.html`: `.panel-accordion__summary`
- `tools/Sprite Editor/index.html`: `.panel-accordion__body`
- `tools/Sprite Editor/index.html`: `.swatch-grid`
- `tools/Sprite Editor/index.html`: `.center-panel`
- `tools/Sprite Editor/index.html`: `.canvas-wrap`
- `tools/Sprite Editor/index.html`: `.right-panel`
- `tools/Sprite Editor/index.html`: `.preview-controls`
- `tools/Sprite Editor/index.html`: `.status-text`

## Exact Current Functions And Classes
- `tools/Sprite Editor/main.js`: function bootSpriteEditor; function getOverlayPanels; function getOverlaySidebar; function setupFullscreenSidePanels; function syncFullscreenClass; function syncOverlayToggleButtons; function toggleOverlayPanel; method applyProjectSystemState; method destroy; method getApi
- `tools/Sprite Editor/modules/colorUtils.js`: function clampChannel; function colorToPickerValue; function dedupeColors; function expandShortHex; function isTransparent; function normalizeColor; function rgbaToHex; function withOpaqueAlpha
- `tools/Sprite Editor/modules/projectModel.js`: function clampInt; function cloneFrame; function createEmptyFrame; function createNewProject; function ensureProjectShape; function frameIndex; function normalizeAssetRefs; function normalizePaletteRef; function resizeProject; function serializeProject
- `tools/Sprite Editor/modules/spriteEditorApp.js`: function addFrame; function applyCanonicalPaletteToProject; function applyColorSlotSwatch; function applyDrawAt; function applyHistorySnapshot; function applyLockedPaletteToProject; function applyRemediationAction; function applySamplePreset; function applySwatchVisual; function bindControls; function bindPointerDrawing; function bindShortcuts; function bresenhamLine; function buildEnginePaletteCatalog; function buildPresetLoadedStatus; function buildSampleSourceDetailLabel; function buildSampleSourceLabel; function canFloodFill; function canvasToBlob; function clamp; function clearPaletteLock; function createCheckerboard; function createHistorySnapshot; function createImageFromFrame; function createSpriteSheetCanvas; function deleteFrame; function deriveDefaultSpriteAssetPath; function deriveSpriteFileName; function deriveSpritePresetDiagnosticTopLevelKeys; function downloadBlob; function drawFramePixels; function duplicateFrame; function emitSpriteEditorControlReadiness; function ensureEditingEnabled; function ensureFrameSelection; function exportCurrentFramePng; function exportSpriteSheetPng; function extractCanonicalPalettePayload; function extractPaletteColors; function extractSpriteAssetRegistryFromSamplePreset; function extractSpriteProjectFromSamplePreset; function fileToImage; function fileToText; function findManifestRoundtripEntry; function floodFill; function getCanvasPixelFromEvent; function getColorSlotValues; function getRequiredElement; function getSelectedFrame; function guardSpriteProjectAction; function hydratePaletteFromRefIfPossible; function importPngIntoCurrentFrame; function initializeSpriteEditorApp; function inspectRemediationActions; function isEditableTarget; function isEditingEnabled; function isPaletteLocked; function isPaletteSelected; function jumpToRemediationProblem; function loadAssetRegistryJson; function loadProjectJson; function loadSampleMetadataManifest; function normalizeManifestPath; function normalizePaletteEntryColor; function normalizeProjectColor; function normalizeSampleId; function normalizeSampleLabel; function normalizeSamplePresetPath; function normalizeToolId; function onPointerDown; function onPointerLeave; function onPointerMove; function onPointerUp; function packageSpriteProject; function parseCanonicalPalettePayload; function pushHistory; function pushRecentColor; function redo; function renderAll; function renderColorSelectors; function renderEditor; function renderHud; function renderPalette; function renderPaletteSelect; function renderPreview; function renderRecentColors; function renderToolButtons; function resetProject; function resizeWithFeedback; function resolvePaletteFromAssetRegistry; function resolveRequiredPaletteInput; function saveAssetRegistryJson; function saveProjectJson; function selectColor; function setPixel; function setSampleSource; function setSpriteEditorLifecycle; function setStatus; function shiftFrame; function startPreviewLoop; function step; function summarizeGraphFindings; function syncControlsFromProject; function syncRegistryProjectId; function syncSpriteAssetsToRegistry; function syncSpriteEditorUxContract; function tryLoadPresetFromQuery; function undo; function updateDebugVisualizationUI; function updateEditGateDisabledState; function updateEditorExperienceUI; function updateHistoryButtons; function updatePaletteLockText; function updateRemediationUI; function updateStatusBar; function updateToolStateText; function validateSpriteProjectAssets; function willPixelChange

## Target Controls
Keep:
- sprite canvas/grid controls
- frame controls
- animation controls
- palette-aware color controls
- import/export controls

Remove or rename:
- workspace-owned sprite state assumptions

Add:
- Validate Sprite Project
- Publish `tools.sprite-editor`
- explicit invalid frame/animation diagnostics

## JSON Contract Owned By This Tool
Baseline schema: `tools/schemas/tools/sprite-editor.schema.json`. Required top-level fields: spriteProject. Allowed top-level fields: assetRegistry, spriteProject. Additional top-level properties are rejected by the current schema. The tool owns import/load, validation, edit/process, export/save, and publish of this payload. Workspace may pass a launch payload, but nested JSON remains tool-owned.

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
- Create or load a sprite project.
- Edit at least one frame and animation, then export JSON.
- Try missing `spriteProject`, invalid frame data, and bad animation references; each must reject before publish.
