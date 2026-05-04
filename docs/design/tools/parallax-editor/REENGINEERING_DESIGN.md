# Parallax Scene Studio Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: rebuildable tool
Core priority: core-09
Source folder: `tools/Parallax Scene Studio`
Publish target: `tools.parallax-editor`

## Tool Purpose
Parallax scene authoring. Parallax Scene Studio owns `parallaxDocument`, optional `tilemapDocumentPath`, optional `vectorAssetSvgPath`, layer controls, validation, export, and publish to `tools.parallax-editor`.

## Exact Folder/Files Inspected
- `tools/Parallax Scene Studio/how_to_use.html`
- `tools/Parallax Scene Studio/index.html`
- `tools/Parallax Scene Studio/main.js`
- `tools/Parallax Scene Studio/parallaxEditor.css`
- `tools/Parallax Scene Studio/README.md`

## Exact Current Controls Found
- `tools/Parallax Scene Studio/index.html`: `button[button]#newProjectButton` - New Project
- `tools/Parallax Scene Studio/index.html`: `button[button]#loadProjectButton` - Load Project
- `tools/Parallax Scene Studio/index.html`: `input[file]#loadProjectInput` - loadProjectInput
- `tools/Parallax Scene Studio/index.html`: `button[button]#saveProjectButton` - Save Project
- `tools/Parallax Scene Studio/index.html`: `button[button]#loadAssetRegistryButton` - Load Assets Registry
- `tools/Parallax Scene Studio/index.html`: `input[file]#loadAssetRegistryInput` - loadAssetRegistryInput
- `tools/Parallax Scene Studio/index.html`: `button[button]#saveAssetRegistryButton` - Save Assets Registry
- `tools/Parallax Scene Studio/index.html`: `button[button]#simulateButton` - Simulate
- `tools/Parallax Scene Studio/index.html`: `button[button]#playSimulationButton` - Play
- `tools/Parallax Scene Studio/index.html`: `button[button]#pauseSimulationButton` - Pause
- `tools/Parallax Scene Studio/index.html`: `button[button]#restartSimulationButton` - Restart Position
- `tools/Parallax Scene Studio/index.html`: `button[button]#exitSimulationButton` - Exit Simulation
- `tools/Parallax Scene Studio/index.html`: `button[button]#exportParallaxPatchButton` - Export Tilemap Patch
- `tools/Parallax Scene Studio/index.html`: `button[button]#packageProjectButton` - Package Project
- `tools/Parallax Scene Studio/index.html`: `input[text]#projectNameInput` - projectNameInput
- `tools/Parallax Scene Studio/index.html`: `input[number]#mapWidthInput` - mapWidthInput
- `tools/Parallax Scene Studio/index.html`: `input[number]#mapHeightInput` - mapHeightInput
- `tools/Parallax Scene Studio/index.html`: `input[number]#tileSizeInput` - tileSizeInput
- `tools/Parallax Scene Studio/index.html`: `button[button]#applyMapMetaButton` - Apply Map Meta
- `tools/Parallax Scene Studio/index.html`: `input[text]#newLayerNameInput` - newLayerNameInput
- `tools/Parallax Scene Studio/index.html`: `button[button]#addLayerButton` - Add Layer
- `tools/Parallax Scene Studio/index.html`: `button[button]#removeLayerButton` - Remove Layer
- `tools/Parallax Scene Studio/index.html`: `button[button]#duplicateLayerButton` - Duplicate
- `tools/Parallax Scene Studio/index.html`: `button[button]#moveLayerUpButton` - Move Up
- `tools/Parallax Scene Studio/index.html`: `button[button]#moveLayerDownButton` - Move Down
- `tools/Parallax Scene Studio/index.html`: `input[range]#cameraXInput` - cameraXInput
- `tools/Parallax Scene Studio/index.html`: `input[range]#cameraYInput` - cameraYInput
- `tools/Parallax Scene Studio/index.html`: `button[button]` - + Parallax Layers
- `tools/Parallax Scene Studio/index.html`: `button[button]` - + Preview Camera
- `tools/Parallax Scene Studio/index.html`: `button[button]` - + Selected Layer
- `tools/Parallax Scene Studio/index.html`: `button[button]` - + Image Assignment
- `tools/Parallax Scene Studio/index.html`: `button[button]` - + Scroll + Repeat
- `tools/Parallax Scene Studio/index.html`: `button[button]` - + Boundaries
- `tools/Parallax Scene Studio/index.html`: `button[button]` - + Remediation
- `tools/Parallax Scene Studio/index.html`: `input[text]#layerNameInput` - layerNameInput
- `tools/Parallax Scene Studio/index.html`: `input[number]#layerDrawOrderInput` - layerDrawOrderInput
- `tools/Parallax Scene Studio/index.html`: `input[number]#layerOpacityInput` - layerOpacityInput
- `tools/Parallax Scene Studio/index.html`: `select#layerVisibleSelect` - Visible Hidden
- `tools/Parallax Scene Studio/index.html`: `input[text]#layerImageSourceInput` - assets/backgrounds/clouds.png
- `tools/Parallax Scene Studio/index.html`: `button[button]#applyImageSourceButton` - Apply Source
- `tools/Parallax Scene Studio/index.html`: `input[file]#layerImageFileInput` - layerImageFileInput
- `tools/Parallax Scene Studio/index.html`: `input[number]#scrollFactorXInput` - scrollFactorXInput
- `tools/Parallax Scene Studio/index.html`: `input[number]#scrollFactorYInput` - scrollFactorYInput
- `tools/Parallax Scene Studio/index.html`: `input[number]#offsetXInput` - offsetXInput
- `tools/Parallax Scene Studio/index.html`: `input[number]#offsetYInput` - offsetYInput
- `tools/Parallax Scene Studio/index.html`: `select#repeatXSelect` - Repeat No Repeat
- `tools/Parallax Scene Studio/index.html`: `select#repeatYSelect` - Repeat No Repeat
- `tools/Parallax Scene Studio/index.html`: `select#wrapModeSelect` - Wrap Clamp
- `tools/Parallax Scene Studio/index.html`: `button[button]#applyLayerSettingsButton` - Apply Layer Settings
- `tools/Parallax Scene Studio/index.html`: `button[button]#inspectRemediationButton` - Inspect Issues
- `tools/Parallax Scene Studio/index.html`: `button[button]#jumpToProblemButton` - Jump to Problem
- `tools/Parallax Scene Studio/index.html`: `button[button]#applyRemediationButton` - Apply Suggested Fix
- `tools/Parallax Scene Studio/index.html`: `button[button]#refreshExperienceButton` - Refresh Pipeline View
- `tools/Parallax Scene Studio/index.html`: `button[button]#refreshDebugVisualizationButton` - Refresh Debug View
- `tools/Parallax Scene Studio/main.js`: `newProjectButton` via newProjectButton
- `tools/Parallax Scene Studio/main.js`: `loadProjectButton` via loadProjectButton
- `tools/Parallax Scene Studio/main.js`: `loadProjectInput` via loadProjectInput
- `tools/Parallax Scene Studio/main.js`: `saveProjectButton` via saveProjectButton
- `tools/Parallax Scene Studio/main.js`: `loadAssetRegistryButton` via loadAssetRegistryButton
- `tools/Parallax Scene Studio/main.js`: `loadAssetRegistryInput` via loadAssetRegistryInput
- `tools/Parallax Scene Studio/main.js`: `saveAssetRegistryButton` via saveAssetRegistryButton
- `tools/Parallax Scene Studio/main.js`: `simulateButton` via simulateButton
- `tools/Parallax Scene Studio/main.js`: `playSimulationButton` via playSimulationButton
- `tools/Parallax Scene Studio/main.js`: `pauseSimulationButton` via pauseSimulationButton
- `tools/Parallax Scene Studio/main.js`: `restartSimulationButton` via restartSimulationButton
- `tools/Parallax Scene Studio/main.js`: `exitSimulationButton` via exitSimulationButton
- `tools/Parallax Scene Studio/main.js`: `exportParallaxPatchButton` via exportParallaxPatchButton
- `tools/Parallax Scene Studio/main.js`: `packageProjectButton` via packageProjectButton
- `tools/Parallax Scene Studio/main.js`: `remediationSummaryText` via remediationSummaryText
- `tools/Parallax Scene Studio/main.js`: `experienceSummaryText` via experienceSummaryText
- `tools/Parallax Scene Studio/main.js`: `experienceDetailsText` via experienceDetailsText
- `tools/Parallax Scene Studio/main.js`: `refreshExperienceButton` via refreshExperienceButton
- `tools/Parallax Scene Studio/main.js`: `debugSummaryText` via debugSummaryText
- `tools/Parallax Scene Studio/main.js`: `debugDetailsText` via debugDetailsText
- `tools/Parallax Scene Studio/main.js`: `refreshDebugVisualizationButton` via refreshDebugVisualizationButton
- `tools/Parallax Scene Studio/main.js`: `inspectRemediationButton` via inspectRemediationButton
- `tools/Parallax Scene Studio/main.js`: `jumpToProblemButton` via jumpToProblemButton
- `tools/Parallax Scene Studio/main.js`: `applyRemediationButton` via applyRemediationButton
- `tools/Parallax Scene Studio/main.js`: `projectNameInput` via projectNameInput
- `tools/Parallax Scene Studio/main.js`: `mapWidthInput` via mapWidthInput
- `tools/Parallax Scene Studio/main.js`: `mapHeightInput` via mapHeightInput
- `tools/Parallax Scene Studio/main.js`: `tileSizeInput` via tileSizeInput
- `tools/Parallax Scene Studio/main.js`: `applyMapMetaButton` via applyMapMetaButton
- `tools/Parallax Scene Studio/main.js`: `layerList` via layerList
- `tools/Parallax Scene Studio/main.js`: `newLayerNameInput` via newLayerNameInput
- `tools/Parallax Scene Studio/main.js`: `addLayerButton` via addLayerButton
- `tools/Parallax Scene Studio/main.js`: `removeLayerButton` via removeLayerButton
- `tools/Parallax Scene Studio/main.js`: `duplicateLayerButton` via duplicateLayerButton
- `tools/Parallax Scene Studio/main.js`: `moveLayerUpButton` via moveLayerUpButton
- `tools/Parallax Scene Studio/main.js`: `moveLayerDownButton` via moveLayerDownButton
- `tools/Parallax Scene Studio/main.js`: `cameraXInput` via cameraXInput
- `tools/Parallax Scene Studio/main.js`: `cameraYInput` via cameraYInput
- `tools/Parallax Scene Studio/main.js`: `cameraReadout` via cameraReadout
- `tools/Parallax Scene Studio/main.js`: `layerNameInput` via layerNameInput
- `tools/Parallax Scene Studio/main.js`: `layerDrawOrderInput` via layerDrawOrderInput
- `tools/Parallax Scene Studio/main.js`: `layerOpacityInput` via layerOpacityInput
- `tools/Parallax Scene Studio/main.js`: `layerVisibleSelect` via layerVisibleSelect
- `tools/Parallax Scene Studio/main.js`: `layerImageSourceInput` via layerImageSourceInput
- `tools/Parallax Scene Studio/main.js`: `applyImageSourceButton` via applyImageSourceButton
- `tools/Parallax Scene Studio/main.js`: `layerImageFileInput` via layerImageFileInput
- `tools/Parallax Scene Studio/main.js`: `scrollFactorXInput` via scrollFactorXInput
- `tools/Parallax Scene Studio/main.js`: `scrollFactorYInput` via scrollFactorYInput
- `tools/Parallax Scene Studio/main.js`: `offsetXInput` via offsetXInput
- `tools/Parallax Scene Studio/main.js`: `offsetYInput` via offsetYInput
- `tools/Parallax Scene Studio/main.js`: `repeatXSelect` via repeatXSelect
- `tools/Parallax Scene Studio/main.js`: `repeatYSelect` via repeatYSelect
- `tools/Parallax Scene Studio/main.js`: `wrapModeSelect` via wrapModeSelect
- `tools/Parallax Scene Studio/main.js`: `applyLayerSettingsButton` via applyLayerSettingsButton
- `tools/Parallax Scene Studio/main.js`: `previewMeta` via previewMeta
- `tools/Parallax Scene Studio/main.js`: `simulationContext` via simulationContext
- `tools/Parallax Scene Studio/main.js`: `previewDetailsText` via previewDetailsText
- `tools/Parallax Scene Studio/main.js`: `statusText` via statusText
- `tools/Parallax Scene Studio/main.js`: `leftSidebar` via leftSidebar
- `tools/Parallax Scene Studio/main.js`: `rightSidebar` via rightSidebar
- `tools/Parallax Scene Studio/main.js`: `previewCanvas` via previewCanvas

## Current Panels And Surfaces Found
- `tools/Parallax Scene Studio/index.html`: `.app-shell`
- `tools/Parallax Scene Studio/index.html`: `.toolbar`
- `tools/Parallax Scene Studio/index.html`: `.toolbar-group`
- `tools/Parallax Scene Studio/index.html`: `.tools-platform-layout-grid`
- `tools/Parallax Scene Studio/index.html`: `.sidebar`
- `tools/Parallax Scene Studio/index.html`: `.left-sidebar`
- `tools/Parallax Scene Studio/index.html`: `.tools-platform-resize-panel`
- `tools/Parallax Scene Studio/index.html`: `.panel-accordion`
- `tools/Parallax Scene Studio/index.html`: `.panel-accordion__summary`
- `tools/Parallax Scene Studio/index.html`: `.panel-accordion__body`
- `tools/Parallax Scene Studio/index.html`: `.layer-list`
- `tools/Parallax Scene Studio/index.html`: `.preview-panel`
- `tools/Parallax Scene Studio/index.html`: `.tools-platform-dock-panel`
- `tools/Parallax Scene Studio/index.html`: `.preview-toolbar`
- `tools/Parallax Scene Studio/index.html`: `.preview-wrap`
- `tools/Parallax Scene Studio/index.html`: `.preview-details-text`
- `tools/Parallax Scene Studio/index.html`: `.status-text`
- `tools/Parallax Scene Studio/index.html`: `.right-sidebar`
- `tools/Parallax Scene Studio/index.html`: `.usage-list`

## Exact Current Functions And Classes
- `tools/Parallax Scene Studio/main.js`: class ParallaxEditorApp; function applyProjectSystemState; function bootParallaxSceneStudio; function buildPresetLoadedStatus; function clamp; function cloneDeep; function createDefaultLayer; function createDownload; function createInitialParallaxDocument; function createRegistryManagedParallaxSaveDocument; function createTilemapParallaxPatch; function drawTraversalMarker; function extractParallaxDocument; function extractParallaxDocumentFromSamplePreset; function getLayerVisualColor; function isStrictWorkspaceParallaxSnapshot; function mod; function normalizeDrawOrderSequence; function normalizeLayer; function normalizeMapMeta; function normalizeSamplePresetPath; function sanitizeAssetRefs; function sanitizeParallaxDocument; function sortLayersByOrder; function summarizeGraphFindings; function tick; method addLayer; method advanceSimulationCamera; method applyBasicLayerFields; method applyExtendedLayerSettings; method applyImageSourceFromInput; method applyMapMetaFromInputs; method applyParallaxDocument; method applyRemediationAction; method applySimulationCameraAtProgress; method assignLocalImageFile; method attachEvents; method bindRuntimeStateSync; method captureRefs; method clearTransientLayerImageSources; method configureSimulationTraverse; method destroy; method drawFallbackLayer; method drawSingleLayer; method duplicateSelectedLayer; method ensureSimulationViewportFocus; method enterSimulationMode; method exitSimulationMode; method getApi; method getLayerImageRecord; method getOverlayPanels; method getOverlaySidebar; method getSelectedLayer; method getSimulationProgress; method getTransientLayerImageSource; method handleCameraChange; method handleExportTilemapPatch; method handleLoadAssetRegistry; method handleLoadProject; method handleNewProject; method handleOverlayAccordionToggle; method handlePackageProject; method handleSaveAssetRegistry; method handleSaveProject; method init; method inspectRemediationActions; method invalidateImageCache; method jumpToRemediationProblem; method moveSelectedLayer; method pauseSimulation; method publishLivePreviewSync; method queueLivePreviewSync; method refreshDebugVisualizationSnapshot; method refreshExperienceSnapshot; method refreshSimulationActionState; method removeSelectedLayer; method renderAll; method renderLayerList; method renderPreview; method renderSelectedLayerFields; method resolveAssetRefsFromRegistry; method resolveLayerImageUrl; method restartSimulationPosition; method resumeSimulation; method setTransientLayerImageSource; method startSimulationLoop; method syncAssetRegistryFromDocument; method syncFullscreenState; method syncInputsFromDocument; method syncOverlayToggleButtons; method toggleOverlayPanel; method touchDocument; method tryLoadPresetFromQuery; method updateCameraInputBounds; method updateDebugVisualizationUI; method updateEditorExperienceUI; method updateRemediationUI; method updateSimulationContextReadout; method updateStatus; method validateProjectAssets

## Target Controls
Keep:
- project load/save
- asset registry load/save
- map metadata controls
- layer add/remove/duplicate/move controls
- camera range controls
- layer opacity/draw order/visibility/image source/repeat/wrap controls
- tilemap patch export

Remove or rename:
- local image import as a persisted source of truth for parallax JSON

Add:
- Validate Parallax Document
- Publish `tools.parallax-editor`
- layer source/reference diagnostics

## JSON Contract Owned By This Tool
Owned JSON is the parallax-editor payload. Allowed top-level fields are `parallaxDocument`, `tilemapDocumentPath`, and `vectorAssetSvgPath`. The parallax document owns map metadata, layer order, layer image source values, scroll factors, offsets, repeat flags, wrap mode, and boundaries.

## Publish Output
Publish only to `tools.parallax-editor`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- parallax documents without usable map/layer data when publishing
- invalid layer opacity/draw order/scroll/offset values
- invalid image source value
- unsupported top-level fields

## Manual Test Plan
- Create or load a parallax project.
- Edit map metadata, add a layer, set image source, and export.
- Try malformed JSON, invalid layer opacity, and invalid image source values; publish must stay blocked.
