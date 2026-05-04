# Sprite Editor Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `sprite-editor`
Source folder: `tools/Sprite Editor`

## 1. Tool Purpose
Edit sprite projects, frame metadata, animation state, and palette-aware sprite payloads for export.

## 2. Folder/Files Inspected
- `tools/Sprite Editor/how_to_use.html`
- `tools/Sprite Editor/index.html`
- `tools/Sprite Editor/main.js`
- `tools/Sprite Editor/modules/colorUtils.js`
- `tools/Sprite Editor/modules/constants.js`
- `tools/Sprite Editor/modules/projectModel.js`
- `tools/Sprite Editor/modules/spriteEditorApp.js`
- `tools/Sprite Editor/README.md`
- `tools/Sprite Editor/spriteEditor.css`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 34, inputs 10, selects 1, textareas 0, tables 0, inferred DOM controls/panels 0.
- `tools/Sprite Editor/index.html`: input[number] #canvasWidthInput - 32
- `tools/Sprite Editor/index.html`: input[number] #canvasHeightInput - 32
- `tools/Sprite Editor/index.html`: button[button] #newCanvasButton - Create New Canvas
- `tools/Sprite Editor/index.html`: input[range] #pixelSizeInput - 18
- `tools/Sprite Editor/index.html`: input[checkbox] #gridToggle - gridToggle
- `tools/Sprite Editor/index.html`: button[button] - Pencil
- `tools/Sprite Editor/index.html`: button[button] - Eraser
- `tools/Sprite Editor/index.html`: button[button] - Fill
- `tools/Sprite Editor/index.html`: select #paletteSelect - Select Palette...
- `tools/Sprite Editor/index.html`: input[color] #colorPicker - #000000
- `tools/Sprite Editor/index.html`: button[button] #color1SelectorButton - Color 1 none
- `tools/Sprite Editor/index.html`: button[button] #color2SelectorButton - Color 2 none
- `tools/Sprite Editor/index.html`: button[button] #prevFrameButton - Prev
- `tools/Sprite Editor/index.html`: button[button] #nextFrameButton - Next
- `tools/Sprite Editor/index.html`: button[button] #addFrameButton - Add
- `tools/Sprite Editor/index.html`: button[button] #duplicateFrameButton - Duplicate
- `tools/Sprite Editor/index.html`: button[button] #deleteFrameButton - Delete
- `tools/Sprite Editor/index.html`: button[button] #undoButton - Undo
- `tools/Sprite Editor/index.html`: button[button] #redoButton - Redo
- `tools/Sprite Editor/index.html`: input[checkbox] #onionSkinToggle - onionSkinToggle
- `tools/Sprite Editor/index.html`: button[button] #saveAssetRegistryButton - Save Assets Registry
- `tools/Sprite Editor/index.html`: button[button] #loadAssetRegistryButton - Load Assets Registry
- `tools/Sprite Editor/index.html`: input[file] #loadAssetRegistryInput - loadAssetRegistryInput
- `tools/Sprite Editor/index.html`: button[button] #saveProjectButton - Save JSON
- `tools/Sprite Editor/index.html`: button[button] #loadProjectButton - Load JSON
- `tools/Sprite Editor/index.html`: input[file] #loadProjectInput - loadProjectInput
- `tools/Sprite Editor/index.html`: button[button] #importPngButton - Import PNG
- `tools/Sprite Editor/index.html`: button[button] #exportPngButton - Export Frame PNG
- `tools/Sprite Editor/index.html`: button[button] #exportSheetButton - Export Sprite Sheet
- `tools/Sprite Editor/index.html`: button[button] #packageProjectButton - Package Project
- `tools/Sprite Editor/index.html`: input[file] #importPngInput - importPngInput
- `tools/Sprite Editor/index.html`: button[button] - + Colors
- `tools/Sprite Editor/index.html`: button[button] - + Frames
- `tools/Sprite Editor/index.html`: button[button] - + Project I/O
- `tools/Sprite Editor/index.html`: button[button] - + Preview
- `tools/Sprite Editor/index.html`: button[button] - + Status
- `tools/Sprite Editor/index.html`: button[button] #playPreviewButton - Play
- `tools/Sprite Editor/index.html`: button[button] #pausePreviewButton - Pause
- `tools/Sprite Editor/index.html`: button[button] #resetPreviewButton - Reset
- `tools/Sprite Editor/index.html`: input[range] #fpsInput - 8
- `tools/Sprite Editor/index.html`: button[button] #inspectRemediationButton - Inspect Issues
- `tools/Sprite Editor/index.html`: button[button] #jumpToProblemButton - Jump to Problem
- `tools/Sprite Editor/index.html`: button[button] #applyRemediationButton - Apply Suggested Fix
- `tools/Sprite Editor/index.html`: button[button] #refreshExperienceButton - Refresh Pipeline View
- `tools/Sprite Editor/index.html`: button[button] #refreshDebugVisualizationButton - Refresh Debug View
- Panels/surfaces found:
  - `tools/Sprite Editor/index.html`: .app-shell
  - `tools/Sprite Editor/index.html`: .toolbar-row
  - `tools/Sprite Editor/index.html`: .toolbar-group
  - `tools/Sprite Editor/index.html`: .tools-platform-control-cluster--preview
  - `tools/Sprite Editor/index.html`: .workspace
  - `tools/Sprite Editor/index.html`: .tools-platform-layout-grid
  - `tools/Sprite Editor/index.html`: .left-panel
  - `tools/Sprite Editor/index.html`: .tools-platform-resize-panel
  - `tools/Sprite Editor/index.html`: .panel-accordion
  - `tools/Sprite Editor/index.html`: .panel-accordion__summary
  - `tools/Sprite Editor/index.html`: .panel-accordion__body
  - `tools/Sprite Editor/index.html`: .swatch-grid
  - `tools/Sprite Editor/index.html`: .center-panel
  - `tools/Sprite Editor/index.html`: .canvas-wrap
  - `tools/Sprite Editor/index.html`: .right-panel
  - `tools/Sprite Editor/index.html`: .preview-controls
  - `tools/Sprite Editor/index.html`: .status-text

## 4. Current Component/Class/Function Inventory
- `tools/Sprite Editor/main.js`: function bootSpriteEditor; function getOverlayPanels; function getOverlaySidebar; function setupFullscreenSidePanels; function syncFullscreenClass; function syncOverlayToggleButtons; function toggleOverlayPanel; method applyProjectSystemState; method destroy; method getApi
- `tools/Sprite Editor/modules/colorUtils.js`: function clampChannel; function colorToPickerValue; function dedupeColors; function expandShortHex; function isTransparent; function normalizeColor; function rgbaToHex; function withOpaqueAlpha
- `tools/Sprite Editor/modules/projectModel.js`: function clampInt; function cloneFrame; function createEmptyFrame; function createNewProject; function ensureProjectShape; function frameIndex; function normalizeAssetRefs; function normalizePaletteRef; function resizeProject; function serializeProject
- `tools/Sprite Editor/modules/spriteEditorApp.js`: function addFrame; function applyCanonicalPaletteToProject; function applyColorSlotSwatch; function applyDrawAt; function applyHistorySnapshot; function applyLockedPaletteToProject; function applyRemediationAction; function applySamplePreset; function applySwatchVisual; function bindControls; function bindPointerDrawing; function bindShortcuts; function bresenhamLine; function buildEnginePaletteCatalog; function buildPresetLoadedStatus; function buildSampleSourceDetailLabel; function buildSampleSourceLabel; function canFloodFill; function canvasToBlob; function clamp; function clearPaletteLock; function createCheckerboard; function createHistorySnapshot; function createImageFromFrame; function createSpriteSheetCanvas; function deleteFrame; function deriveDefaultSpriteAssetPath; function deriveSpriteFileName; function deriveSpritePresetDiagnosticTopLevelKeys; function downloadBlob; function drawFramePixels; function duplicateFrame; function emitSpriteEditorControlReadiness; function ensureEditingEnabled; function ensureFrameSelection; function exportCurrentFramePng; function exportSpriteSheetPng; function extractCanonicalPalettePayload; function extractPaletteColors; function extractSpriteAssetRegistryFromSamplePreset; function extractSpriteProjectFromSamplePreset; function fileToImage; function fileToText; function findManifestRoundtripEntry; function floodFill; function getCanvasPixelFromEvent; function getColorSlotValues; function getRequiredElement; function getSelectedFrame; function guardSpriteProjectAction; function hydratePaletteFromRefIfPossible; function importPngIntoCurrentFrame; function initializeSpriteEditorApp; function inspectRemediationActions; function isEditableTarget; function isEditingEnabled; function isPaletteLocked; function isPaletteSelected; function jumpToRemediationProblem; function loadAssetRegistryJson; ... 58 more

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/tools/sprite-editor.schema.json`. Title: Sprite Editor Payload. Required top-level fields: spriteProject. Allowed top-level fields: assetRegistry, spriteProject. Additional top-level properties: rejected.

JSON handling signals found: Blob/object URL, download/export, FileReader, JSON.parse, JSON.stringify, schema, toolState, validate.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the current schema baseline or tool-owned normalized shape, update the local editor/preview state, and remain exportable as path/file-field JSON without embedding `imageDataUrl`.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing required fields, unsupported top-level fields, wrong nested types, and empty required editor payloads must be rejected in the tool UI before export/save/publish.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.sprite-editor` if applicable: yes, publish normalized output under `tools.sprite-editor` when this tool is the producer.
- copy/create toolState if applicable: only if a future workspace flow copies a published `tools.*` entry into a toolState; the tool JSON remains tool-owned.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.sprite-editor`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/Sprite Editor/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/Sprite Editor/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P08: Sprite Editor. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
