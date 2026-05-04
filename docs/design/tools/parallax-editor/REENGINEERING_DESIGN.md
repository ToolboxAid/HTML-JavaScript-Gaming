# Parallax Scene Studio Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-09
Source folder: `tools/Parallax Scene Studio`
Publish target: `tools.parallax-editor`

## Tool Purpose
Parallax Scene Studio owns parallax document import, validation, layer editing, export, and publish to `tools.parallax-editor`.

## Folder/Files Inspected
- `tools/Parallax Scene Studio/how_to_use.html`
- `tools/Parallax Scene Studio/index.html`
- `tools/Parallax Scene Studio/main.js`
- `tools/Parallax Scene Studio/parallaxEditor.css`
- `tools/Parallax Scene Studio/README.md`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/Parallax Scene Studio/index.html`: `input[file]#loadProjectInput` - loadProjectInput | Chooses a local file for parallax document import/load. | Replaces or merges tool-owned parallax document only after the import validates. |
| `tools/Parallax Scene Studio/index.html`: `input[file]#loadAssetRegistryInput` - loadAssetRegistryInput | Chooses a local file for parallax document import/load. | Replaces or merges tool-owned parallax document only after the import validates. |
| `tools/Parallax Scene Studio/index.html`: `input[text]#projectNameInput` - untitled-map | Edits the active parallax layer or scene property field. | Updates the draft parallax document field represented by `projectNameInput` before validation. |
| `tools/Parallax Scene Studio/index.html`: `input[number]#mapWidthInput` - 32 | Edits the active parallax layer or scene property field. | Updates the draft parallax document field represented by `mapWidthInput` before validation. |
| `tools/Parallax Scene Studio/index.html`: `input[number]#mapHeightInput` - 18 | Edits the active parallax layer or scene property field. | Updates the draft parallax document field represented by `mapHeightInput` before validation. |
| `tools/Parallax Scene Studio/index.html`: `input[number]#tileSizeInput` - 24 | Edits the active parallax layer or scene property field. | Updates the draft parallax document field represented by `tileSizeInput` before validation. |
| `tools/Parallax Scene Studio/index.html`: `input[text]#newLayerNameInput` - Parallax Layer | Edits the active parallax layer or scene property field. | Updates the draft parallax document field represented by `newLayerNameInput` before validation. |
| `tools/Parallax Scene Studio/index.html`: `input[range]#cameraXInput` - 0 | Edits the current parallax document through `cameraXInput`. | Updates draft parallax document data and requires validation before tools.parallax-editor publish. |
| `tools/Parallax Scene Studio/index.html`: `input[range]#cameraYInput` - 0 | Edits the current parallax document through `cameraYInput`. | Updates draft parallax document data and requires validation before tools.parallax-editor publish. |
| `tools/Parallax Scene Studio/index.html`: `input[text]#layerNameInput` - layerNameInput | Edits the active parallax layer or scene property field. | Updates the draft parallax document field represented by `layerNameInput` before validation. |
| `tools/Parallax Scene Studio/index.html`: `input[number]#layerDrawOrderInput` - 0 | Edits the current parallax document through `layerDrawOrderInput`. | Updates draft parallax document data and requires validation before tools.parallax-editor publish. |
| `tools/Parallax Scene Studio/index.html`: `input[number]#layerOpacityInput` - 1 | Edits the current parallax document through `layerOpacityInput`. | Updates draft parallax document data and requires validation before tools.parallax-editor publish. |
| `tools/Parallax Scene Studio/index.html`: `input[text]#layerImageSourceInput` - assets/backgrounds/clouds.png | Edits the active parallax layer or scene property field. | Updates the draft parallax document field represented by `layerImageSourceInput` before validation. |
| `tools/Parallax Scene Studio/index.html`: `input[file]#layerImageFileInput` - layerImageFileInput | Chooses a local file for parallax document import/load. | Replaces or merges tool-owned parallax document only after the import validates. |
| `tools/Parallax Scene Studio/index.html`: `input[number]#scrollFactorXInput` - 0.5 | Edits the current parallax document through `scrollFactorXInput`. | Updates draft parallax document data and requires validation before tools.parallax-editor publish. |
| `tools/Parallax Scene Studio/index.html`: `input[number]#scrollFactorYInput` - 0.5 | Edits the current parallax document through `scrollFactorYInput`. | Updates draft parallax document data and requires validation before tools.parallax-editor publish. |
| `tools/Parallax Scene Studio/index.html`: `input[number]#offsetXInput` - 0 | Edits the current parallax document through `offsetXInput`. | Updates draft parallax document data and requires validation before tools.parallax-editor publish. |
| `tools/Parallax Scene Studio/index.html`: `input[number]#offsetYInput` - 0 | Edits the current parallax document through `offsetYInput`. | Updates draft parallax document data and requires validation before tools.parallax-editor publish. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#newProjectButton` - New Project | Creates or resets a draft parallax document. | Initializes tool-owned parallax document data; tools.parallax-editor is unchanged until validation and publish/export. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#loadProjectButton` - Load Project | Starts parallax document import/load. | Reads incoming JSON into the tool-owned parallax document only after validation succeeds. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#saveProjectButton` - Save Project | Exports the validated parallax document. | Serializes the validated parallax document as the tools.parallax-editor output shape. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#loadAssetRegistryButton` - Load Assets Registry | Starts parallax document import/load. | Reads incoming JSON into the tool-owned parallax document only after validation succeeds. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#saveAssetRegistryButton` - Save Assets Registry | Exports the validated parallax document. | Serializes the validated parallax document as the tools.parallax-editor output shape. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#simulateButton` - Simulate | Processes the current parallax document. | Updates tool-owned derived data/report fields that must validate before tools.parallax-editor publish. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#playSimulationButton` - Play | Controls preview/playback for the current parallax document. | No tools.parallax-editor JSON change unless a schema-owned playback setting is explicitly edited. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#pauseSimulationButton` - Pause | Controls preview/playback for the current parallax document. | No tools.parallax-editor JSON change unless a schema-owned playback setting is explicitly edited. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#restartSimulationButton` - Restart Position | Triggers the current parallax document UI action for `Restart Position`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#exitSimulationButton` - Exit Simulation | Triggers the current parallax document UI action for `Exit Simulation`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#exportParallaxPatchButton` - Export Tilemap Patch | Exports the validated parallax document. | Serializes the validated parallax document as the tools.parallax-editor output shape. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#packageProjectButton` - Package Project | Triggers the current parallax document UI action for `Package Project`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#applyMapMetaButton` - Apply Map Meta | Publishes or applies the validated parallax document. | Writes the validated output shape to tools.parallax-editor. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#addLayerButton` - Add Layer | Adds a new parallax layer or scene property. | Appends schema-owned data to the draft parallax document; publish waits for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#removeLayerButton` - Remove Layer | Removes or clears the selected parallax layer or scene property. | Deletes that data from the draft parallax document; publish waits for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#duplicateLayerButton` - Duplicate | Duplicates the selected parallax layer or scene property. | Adds a copied parallax layer or scene property to the draft parallax document; publish waits for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#moveLayerUpButton` - Move Up | Triggers the current parallax document UI action for `Move Up`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#moveLayerDownButton` - Move Down | Triggers the current parallax document UI action for `Move Down`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]` - + Parallax Layers | Triggers the current parallax document UI action for `+ Parallax Layers`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]` - + Preview Camera | Triggers the current parallax document UI action for `+ Preview Camera`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]` - + Selected Layer | Triggers the current parallax document UI action for `+ Selected Layer`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]` - + Image Assignment | Triggers the current parallax document UI action for `+ Image Assignment`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]` - + Scroll + Repeat | Triggers the current parallax document UI action for `+ Scroll + Repeat`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]` - + Boundaries | Triggers the current parallax document UI action for `+ Boundaries`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]` - + Remediation | Triggers the current parallax document UI action for `+ Remediation`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `select#layerVisibleSelect` - Visible Hidden | Edits the current parallax document through `layerVisibleSelect`. | Updates draft parallax document data and requires validation before tools.parallax-editor publish. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#applyImageSourceButton` - Apply Source | Publishes or applies the validated parallax document. | Writes the validated output shape to tools.parallax-editor. |
| `tools/Parallax Scene Studio/index.html`: `select#repeatXSelect` - Repeat No Repeat | Edits the current parallax document through `repeatXSelect`. | Updates draft parallax document data and requires validation before tools.parallax-editor publish. |
| `tools/Parallax Scene Studio/index.html`: `select#repeatYSelect` - Repeat No Repeat | Edits the current parallax document through `repeatYSelect`. | Updates draft parallax document data and requires validation before tools.parallax-editor publish. |
| `tools/Parallax Scene Studio/index.html`: `select#wrapModeSelect` - Wrap Clamp | Edits the current parallax document through `wrapModeSelect`. | Updates draft parallax document data and requires validation before tools.parallax-editor publish. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#applyLayerSettingsButton` - Apply Layer Settings | Publishes or applies the validated parallax document. | Writes the validated output shape to tools.parallax-editor. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#inspectRemediationButton` - Inspect Issues | Triggers the current parallax document UI action for `Inspect Issues`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#jumpToProblemButton` - Jump to Problem | Triggers the current parallax document UI action for `Jump to Problem`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#applyRemediationButton` - Apply Suggested Fix | Publishes or applies the validated parallax document. | Writes the validated output shape to tools.parallax-editor. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#refreshExperienceButton` - Refresh Pipeline View | Triggers the current parallax document UI action for `Refresh Pipeline View`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |
| `tools/Parallax Scene Studio/index.html`: `button[button]#refreshDebugVisualizationButton` - Refresh Debug View | Triggers the current parallax document UI action for `Refresh Debug View`. | May update draft parallax document data; tools.parallax-editor publish must wait for validation. |

## Panels And Surfaces Found
- `tools/Parallax Scene Studio/how_to_use.html`: `.tools-platform-surface`
- `tools/Parallax Scene Studio/index.html`: `.app-shell`
- `tools/Parallax Scene Studio/index.html`: `.layer-list`
- `tools/Parallax Scene Studio/index.html`: `.left-sidebar`
- `tools/Parallax Scene Studio/index.html`: `.panel-accordion`
- `tools/Parallax Scene Studio/index.html`: `.panel-accordion__body`
- `tools/Parallax Scene Studio/index.html`: `.panel-accordion__summary`
- `tools/Parallax Scene Studio/index.html`: `.parallax-editor-page`
- `tools/Parallax Scene Studio/index.html`: `.parallax-editor-page-root`
- `tools/Parallax Scene Studio/index.html`: `.preview-details-text`
- `tools/Parallax Scene Studio/index.html`: `.preview-panel`
- `tools/Parallax Scene Studio/index.html`: `.preview-toolbar`
- `tools/Parallax Scene Studio/index.html`: `.preview-wrap`
- `tools/Parallax Scene Studio/index.html`: `.right-sidebar`
- `tools/Parallax Scene Studio/index.html`: `.sidebar`
- `tools/Parallax Scene Studio/index.html`: `.toolbar`
- `tools/Parallax Scene Studio/index.html`: `.toolbar-group`
- `tools/Parallax Scene Studio/index.html`: `.tools-platform-dock-panel`
- `tools/Parallax Scene Studio/index.html`: `.tools-platform-layout-grid`
- `tools/Parallax Scene Studio/index.html`: `.tools-platform-resize-panel`
- `tools/Parallax Scene Studio/index.html`: `.usage-list`

## Current Component/Class/Function Inventory
- `tools/Parallax Scene Studio/main.js`: ParallaxEditorApp; addLayer; advanceSimulationCamera; applyBasicLayerFields; applyExtendedLayerSettings; applyImageSourceFromInput; applyMapMetaFromInputs; applyParallaxDocument; applyProjectSystemState; applyRemediationAction; applySimulationCameraAtProgress; assignLocalImageFile; attachEvents; bindRuntimeStateSync; bootParallaxSceneStudio; buildPresetLoadedStatus; captureRefs; clamp; clearTransientLayerImageSources; cloneDeep; configureSimulationTraverse; createDefaultLayer; createDownload; createInitialParallaxDocument; createRegistryManagedParallaxSaveDocument; createTilemapParallaxPatch; drawFallbackLayer; drawSingleLayer; drawTraversalMarker; duplicateSelectedLayer; ensureSimulationViewportFocus; enterSimulationMode; exitSimulationMode; extractParallaxDocument; extractParallaxDocumentFromSamplePreset; getApi; getLayerImageRecord; getLayerVisualColor; getOverlayPanels; getOverlaySidebar; getSelectedLayer; getSimulationProgress; getTransientLayerImageSource; handleCameraChange; handleExportTilemapPatch; handleLoadAssetRegistry; handleLoadProject; handleNewProject; handleOverlayAccordionToggle; handlePackageProject; handleSaveAssetRegistry; handleSaveProject; init; inspectRemediationActions; invalidateImageCache; isStrictWorkspaceParallaxSnapshot; jumpToRemediationProblem; mod; moveSelectedLayer; normalizeDrawOrderSequence; normalizeLayer; normalizeMapMeta; normalizeSamplePresetPath; pauseSimulation; publishLivePreviewSync; queueLivePreviewSync; refreshDebugVisualizationSnapshot; refreshExperienceSnapshot; refreshSimulationActionState; registerToolBootContract; removeSelectedLayer; renderAll; renderLayerList; renderPreview; renderSelectedLayerFields; resolveAssetRefsFromRegistry; resolveLayerImageUrl; restartSimulationPosition; resumeSimulation; sanitizeAssetRefs; sanitizeParallaxDocument; setTransientLayerImageSource; sortLayersByOrder; startSimulationLoop; summarizeGraphFindings; syncAssetRegistryFromDocument; syncFullscreenState; syncInputsFromDocument; syncOverlayToggleButtons; tick; toggleOverlayPanel; touchDocument; tryLoadPresetFromQuery; updateCameraInputBounds; updateDebugVisualizationUI; updateEditorExperienceUI; updateRemediationUI; updateSimulationContextReadout; updateStatus; validateProjectAssets

## Target Controls
Keep:
- parallax layer controls
- scene preview controls
- import/export controls

Remove or rename:
- preview-only state leaking into published parallax JSON

Add:
- Validate Parallax Document
- Publish `tools.parallax-editor`
- layer/property validation messages

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for parallax document. Current contract baseline: `tools/schemas/tools/parallax-editor.schema.json` (parallax-editor Payload).
Required keys: none assigned for this reference folder.
Optional keys: `parallaxDocument`, `tilemapDocumentPath`, `vectorAssetSvgPath`.

Tool-owned JSON responsibilities:
- import/load: parse incoming parallax document and reject it before mutation when invalid
- validate: apply the current parallax document contract before export, copy, or publish
- edit/process: mutate only parallax document fields owned by Parallax Scene Studio
- export/save: serialize the validated parallax document as the tools.parallax-editor output shape
- publish: write only the validated tools.parallax-editor value produced by Parallax Scene Studio
- copy/create payload: create copied payload text from the validated parallax document, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts the schema-defined parallax document
- allows schema-defined linked path fields when present
- publishes only validated parallax JSON

## Invalid JSON Rejection Behavior
- malformed JSON
- payload shape outside `parallax-editor.schema.json`
- invalid layer/property data
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.parallax-editor = {
  "parallaxDocument": "jsonValue", // optional
  "tilemapDocumentPath": "jsonValue", // optional
  "vectorAssetSvgPath": "jsonValue" // optional
}
```

## Playwright Expectations
- load `tools/Parallax Scene Studio/index.html` without console errors
- edit a layer/property and confirm output JSON updates
- reject invalid parallax JSON

## Manual Test Expectations
- Open `tools/Parallax Scene Studio/index.html` and confirm layer and preview controls render.
- Edit a parallax layer/property, validate, export, and re-import.
- Try malformed JSON and an invalid layer; each must block publish.

## Known Gaps
- Layer validation should identify the failing layer.
- Publish should remain separate from preview playback state.

## Rebuild Order Priority
core-09: rebuild in the core tool lane after earlier priorities are stable.
