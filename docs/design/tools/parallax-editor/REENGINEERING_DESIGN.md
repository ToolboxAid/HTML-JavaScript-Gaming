# Parallax Scene Studio Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `parallax-editor`
Source folder: `tools/Parallax Scene Studio`

## 1. Tool Purpose
Author parallax scene documents, layer settings, image references, and publishable parallax payloads.

## 2. Folder/Files Inspected
- `tools/Parallax Scene Studio/how_to_use.html`
- `tools/Parallax Scene Studio/index.html`
- `tools/Parallax Scene Studio/main.js`
- `tools/Parallax Scene Studio/parallaxEditor.css`
- `tools/Parallax Scene Studio/README.md`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 32, inputs 18, selects 4, textareas 0, tables 0, inferred DOM controls/panels 50.
- `tools/Parallax Scene Studio/index.html`: button[button] #newProjectButton - New Project
- `tools/Parallax Scene Studio/index.html`: button[button] #loadProjectButton - Load Project
- `tools/Parallax Scene Studio/index.html`: input[file] #loadProjectInput - loadProjectInput
- `tools/Parallax Scene Studio/index.html`: button[button] #saveProjectButton - Save Project
- `tools/Parallax Scene Studio/index.html`: button[button] #loadAssetRegistryButton - Load Assets Registry
- `tools/Parallax Scene Studio/index.html`: input[file] #loadAssetRegistryInput - loadAssetRegistryInput
- `tools/Parallax Scene Studio/index.html`: button[button] #saveAssetRegistryButton - Save Assets Registry
- `tools/Parallax Scene Studio/index.html`: button[button] #simulateButton - Simulate
- `tools/Parallax Scene Studio/index.html`: button[button] #playSimulationButton - Play
- `tools/Parallax Scene Studio/index.html`: button[button] #pauseSimulationButton - Pause
- `tools/Parallax Scene Studio/index.html`: button[button] #restartSimulationButton - Restart Position
- `tools/Parallax Scene Studio/index.html`: button[button] #exitSimulationButton - Exit Simulation
- `tools/Parallax Scene Studio/index.html`: button[button] #exportParallaxPatchButton - Export Tilemap Patch
- `tools/Parallax Scene Studio/index.html`: button[button] #packageProjectButton - Package Project
- `tools/Parallax Scene Studio/index.html`: input[text] #projectNameInput - untitled-map
- `tools/Parallax Scene Studio/index.html`: input[number] #mapWidthInput - 32
- `tools/Parallax Scene Studio/index.html`: input[number] #mapHeightInput - 18
- `tools/Parallax Scene Studio/index.html`: input[number] #tileSizeInput - 24
- `tools/Parallax Scene Studio/index.html`: button[button] #applyMapMetaButton - Apply Map Meta
- `tools/Parallax Scene Studio/index.html`: input[text] #newLayerNameInput - Parallax Layer
- `tools/Parallax Scene Studio/index.html`: button[button] #addLayerButton - Add Layer
- `tools/Parallax Scene Studio/index.html`: button[button] #removeLayerButton - Remove Layer
- `tools/Parallax Scene Studio/index.html`: button[button] #duplicateLayerButton - Duplicate
- `tools/Parallax Scene Studio/index.html`: button[button] #moveLayerUpButton - Move Up
- `tools/Parallax Scene Studio/index.html`: button[button] #moveLayerDownButton - Move Down
- `tools/Parallax Scene Studio/index.html`: input[range] #cameraXInput - 0
- `tools/Parallax Scene Studio/index.html`: input[range] #cameraYInput - 0
- `tools/Parallax Scene Studio/index.html`: button[button] - + Parallax Layers
- `tools/Parallax Scene Studio/index.html`: button[button] - + Preview Camera
- `tools/Parallax Scene Studio/index.html`: button[button] - + Selected Layer
- `tools/Parallax Scene Studio/index.html`: button[button] - + Image Assignment
- `tools/Parallax Scene Studio/index.html`: button[button] - + Scroll + Repeat
- `tools/Parallax Scene Studio/index.html`: button[button] - + Boundaries
- `tools/Parallax Scene Studio/index.html`: button[button] - + Remediation
- `tools/Parallax Scene Studio/index.html`: input[text] #layerNameInput - layerNameInput
- `tools/Parallax Scene Studio/index.html`: input[number] #layerDrawOrderInput - 0
- `tools/Parallax Scene Studio/index.html`: input[number] #layerOpacityInput - 1
- `tools/Parallax Scene Studio/index.html`: select #layerVisibleSelect - Visible Hidden
- `tools/Parallax Scene Studio/index.html`: input[text] #layerImageSourceInput - assets/backgrounds/clouds.png
- `tools/Parallax Scene Studio/index.html`: button[button] #applyImageSourceButton - Apply Source
- `tools/Parallax Scene Studio/index.html`: input[file] #layerImageFileInput - layerImageFileInput
- `tools/Parallax Scene Studio/index.html`: input[number] #scrollFactorXInput - 0.5
- `tools/Parallax Scene Studio/index.html`: input[number] #scrollFactorYInput - 0.5
- `tools/Parallax Scene Studio/index.html`: input[number] #offsetXInput - 0
- `tools/Parallax Scene Studio/index.html`: input[number] #offsetYInput - 0
- `tools/Parallax Scene Studio/index.html`: select #repeatXSelect - Repeat No Repeat
- `tools/Parallax Scene Studio/index.html`: select #repeatYSelect - Repeat No Repeat
- `tools/Parallax Scene Studio/index.html`: select #wrapModeSelect - Wrap Clamp
- `tools/Parallax Scene Studio/index.html`: button[button] #applyLayerSettingsButton - Apply Layer Settings
- `tools/Parallax Scene Studio/index.html`: button[button] #inspectRemediationButton - Inspect Issues
- `tools/Parallax Scene Studio/index.html`: button[button] #jumpToProblemButton - Jump to Problem
- `tools/Parallax Scene Studio/index.html`: button[button] #applyRemediationButton - Apply Suggested Fix
- `tools/Parallax Scene Studio/index.html`: button[button] #refreshExperienceButton - Refresh Pipeline View
- `tools/Parallax Scene Studio/index.html`: button[button] #refreshDebugVisualizationButton - Refresh Debug View
- `tools/Parallax Scene Studio/main.js`: button #newProjectButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #loadProjectButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #loadProjectInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #saveProjectButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #loadAssetRegistryButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #loadAssetRegistryInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #saveAssetRegistryButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #simulateButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #playSimulationButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #pauseSimulationButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #restartSimulationButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #exitSimulationButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #exportParallaxPatchButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #packageProjectButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #refreshExperienceButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #refreshDebugVisualizationButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #inspectRemediationButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #jumpToProblemButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #applyRemediationButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #projectNameInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #mapWidthInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #mapHeightInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #tileSizeInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #applyMapMetaButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: panel #layerList - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #newLayerNameInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #addLayerButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #removeLayerButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #duplicateLayerButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #moveLayerUpButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #moveLayerDownButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #cameraXInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #cameraYInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: panel #cameraReadout - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #layerNameInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #layerDrawOrderInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #layerOpacityInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: select #layerVisibleSelect - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #layerImageSourceInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #applyImageSourceButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #layerImageFileInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #scrollFactorXInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #scrollFactorYInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #offsetXInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: input #offsetYInput - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: select #repeatXSelect - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: select #repeatYSelect - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: select #wrapModeSelect - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: button #applyLayerSettingsButton - inferred from JS DOM lookup
- `tools/Parallax Scene Studio/main.js`: panel #previewCanvas - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/Parallax Scene Studio/index.html`: .app-shell
  - `tools/Parallax Scene Studio/index.html`: .toolbar
  - `tools/Parallax Scene Studio/index.html`: .toolbar-group
  - `tools/Parallax Scene Studio/index.html`: .workspace
  - `tools/Parallax Scene Studio/index.html`: .tools-platform-layout-grid
  - `tools/Parallax Scene Studio/index.html`: .sidebar
  - `tools/Parallax Scene Studio/index.html`: .left-sidebar
  - `tools/Parallax Scene Studio/index.html`: .tools-platform-resize-panel
  - `tools/Parallax Scene Studio/index.html`: .panel-accordion
  - `tools/Parallax Scene Studio/index.html`: .panel-accordion__summary
  - `tools/Parallax Scene Studio/index.html`: .panel-accordion__body
  - `tools/Parallax Scene Studio/index.html`: .layer-list
  - `tools/Parallax Scene Studio/index.html`: .preview-panel
  - `tools/Parallax Scene Studio/index.html`: .tools-platform-dock-panel
  - `tools/Parallax Scene Studio/index.html`: .preview-toolbar
  - `tools/Parallax Scene Studio/index.html`: .preview-wrap
  - `tools/Parallax Scene Studio/index.html`: .preview-details-text
  - `tools/Parallax Scene Studio/index.html`: .status-text
  - `tools/Parallax Scene Studio/index.html`: .right-sidebar
  - `tools/Parallax Scene Studio/index.html`: .usage-list

## 4. Current Component/Class/Function Inventory
- `tools/Parallax Scene Studio/main.js`: class ParallaxEditorApp; function applyProjectSystemState; function bootParallaxSceneStudio; function buildPresetLoadedStatus; function clamp; function cloneDeep; function createDefaultLayer; function createDownload; function createInitialParallaxDocument; function createRegistryManagedParallaxSaveDocument; function createTilemapParallaxPatch; function drawTraversalMarker; function extractParallaxDocument; function extractParallaxDocumentFromSamplePreset; function getLayerVisualColor; function isStrictWorkspaceParallaxSnapshot; function mod; function normalizeDrawOrderSequence; function normalizeLayer; function normalizeMapMeta; function normalizeSamplePresetPath; function sanitizeAssetRefs; function sanitizeParallaxDocument; function sortLayersByOrder; function summarizeGraphFindings; function tick; method addLayer; method advanceSimulationCamera; method applyBasicLayerFields; method applyExtendedLayerSettings; method applyImageSourceFromInput; method applyMapMetaFromInputs; method applyParallaxDocument; method applyRemediationAction; method applySimulationCameraAtProgress; method assignLocalImageFile; method attachEvents; method bindRuntimeStateSync; method captureRefs; method clearTransientLayerImageSources; method configureSimulationTraverse; method destroy; method drawFallbackLayer; method drawSingleLayer; method duplicateSelectedLayer; method ensureSimulationViewportFocus; method enterSimulationMode; method exitSimulationMode; method getApi; method getLayerImageRecord; method getOverlayPanels; method getOverlaySidebar; method getSelectedLayer; method getSimulationProgress; method getTransientLayerImageSource; method handleCameraChange; method handleExportTilemapPatch; method handleLoadAssetRegistry; method handleLoadProject; method handleNewProject; ... 40 more

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/tools/parallax-editor.schema.json`. Title: parallax-editor Payload. Required top-level fields: (none listed). Allowed top-level fields: parallaxDocument, tilemapDocumentPath, vectorAssetSvgPath. Additional top-level properties: rejected.

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
- publish to `tools.parallax-editor` if applicable: yes, publish normalized output under `tools.parallax-editor` when this tool is the producer.
- copy/create toolState if applicable: only if a future workspace flow copies a published `tools.*` entry into a toolState; the tool JSON remains tool-owned.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.parallax-editor`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/Parallax Scene Studio/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/Parallax Scene Studio/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P13: Parallax Scene Studio. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
