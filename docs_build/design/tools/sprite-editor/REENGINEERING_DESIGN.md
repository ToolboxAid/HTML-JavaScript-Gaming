# Sprite Editor Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-05
Source folder: `tools/Sprite Editor`
Publish target: `tools.sprite-editor`

## Tool Purpose
Sprite Editor owns sprite project import, validation, frame/layer/animation editing, export, and publish to `tools.sprite-editor`.

## Folder/Files Inspected
- `tools/Sprite Editor/how_to_use.html`
- `tools/Sprite Editor/index.html`
- `tools/Sprite Editor/main.js`
- `tools/Sprite Editor/modules/colorUtils.js`
- `tools/Sprite Editor/modules/constants.js`
- `tools/Sprite Editor/modules/projectModel.js`
- `tools/Sprite Editor/modules/spriteEditorApp.js`
- `tools/Sprite Editor/README.md`
- `tools/Sprite Editor/spriteEditor.css`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/Sprite Editor/index.html`: `input[number]#canvasWidthInput` - 32 | Edits the active sprite frame, layer, or animation field. | Updates the draft sprite project payload field represented by `canvasWidthInput` before validation. |
| `tools/Sprite Editor/index.html`: `input[number]#canvasHeightInput` - 32 | Edits the active sprite frame, layer, or animation field. | Updates the draft sprite project payload field represented by `canvasHeightInput` before validation. |
| `tools/Sprite Editor/index.html`: `input[range]#pixelSizeInput` - 18 | Edits the active sprite frame, layer, or animation field. | Updates the draft sprite project payload field represented by `pixelSizeInput` before validation. |
| `tools/Sprite Editor/index.html`: `input[checkbox]#gridToggle` - gridToggle | Edits the current sprite project payload through `gridToggle`. | Updates draft sprite project payload data and requires validation before tools.sprite-editor publish. |
| `tools/Sprite Editor/index.html`: `input[color]#colorPicker` - #000000 | Edits the active sprite frame, layer, or animation color/value field. | Updates the draft sprite project payload field represented by `colorPicker` before validation. |
| `tools/Sprite Editor/index.html`: `input[checkbox]#onionSkinToggle` - onionSkinToggle | Edits the current sprite project payload through `onionSkinToggle`. | Updates draft sprite project payload data and requires validation before tools.sprite-editor publish. |
| `tools/Sprite Editor/index.html`: `input[file]#loadAssetRegistryInput` - loadAssetRegistryInput | Chooses a local file for sprite project payload import/load. | Replaces or merges tool-owned sprite project payload only after the import validates. |
| `tools/Sprite Editor/index.html`: `input[file]#loadProjectInput` - loadProjectInput | Chooses a local file for sprite project payload import/load. | Replaces or merges tool-owned sprite project payload only after the import validates. |
| `tools/Sprite Editor/index.html`: `input[file]#importPngInput` - importPngInput | Chooses a local file for sprite project payload import/load. | Replaces or merges tool-owned sprite project payload only after the import validates. |
| `tools/Sprite Editor/index.html`: `input[range]#fpsInput` - 8 | Edits the current sprite project payload through `fpsInput`. | Updates draft sprite project payload data and requires validation before tools.sprite-editor publish. |
| `tools/Sprite Editor/index.html`: `button[button]#newCanvasButton` - Create New Canvas | Creates or resets a draft sprite project payload. | Initializes tool-owned sprite project payload data; tools.sprite-editor is unchanged until validation and publish/export. |
| `tools/Sprite Editor/index.html`: `button[button]` - Pencil | Triggers the current sprite project payload UI action for `Pencil`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]` - Eraser | Triggers the current sprite project payload UI action for `Eraser`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]` - Fill | Triggers the current sprite project payload UI action for `Fill`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `select#paletteSelect` - Select Palette... | Edits the current sprite project payload through `paletteSelect`. | Updates draft sprite project payload data and requires validation before tools.sprite-editor publish. |
| `tools/Sprite Editor/index.html`: `button[button]#color1SelectorButton` - Color 1 none | Triggers the current sprite project payload UI action for `Color 1 none`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]#color2SelectorButton` - Color 2 none | Triggers the current sprite project payload UI action for `Color 2 none`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]#prevFrameButton` - Prev | Triggers the current sprite project payload UI action for `Prev`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]#nextFrameButton` - Next | Triggers the current sprite project payload UI action for `Next`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]#addFrameButton` - Add | Adds a new sprite frame, layer, or animation. | Appends schema-owned data to the draft sprite project payload; publish waits for validation. |
| `tools/Sprite Editor/index.html`: `button[button]#duplicateFrameButton` - Duplicate | Duplicates the selected sprite frame, layer, or animation. | Adds a copied sprite frame, layer, or animation to the draft sprite project payload; publish waits for validation. |
| `tools/Sprite Editor/index.html`: `button[button]#deleteFrameButton` - Delete | Removes or clears the selected sprite frame, layer, or animation. | Deletes that data from the draft sprite project payload; publish waits for validation. |
| `tools/Sprite Editor/index.html`: `button[button]#undoButton` - Undo | Triggers the current sprite project payload UI action for `Undo`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]#redoButton` - Redo | Triggers the current sprite project payload UI action for `Redo`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]#saveAssetRegistryButton` - Save Assets Registry | Exports the validated sprite project payload. | Serializes the validated sprite project payload as the tools.sprite-editor output shape. |
| `tools/Sprite Editor/index.html`: `button[button]#loadAssetRegistryButton` - Load Assets Registry | Starts sprite project payload import/load. | Reads incoming JSON into the tool-owned sprite project payload only after validation succeeds. |
| `tools/Sprite Editor/index.html`: `button[button]#saveProjectButton` - Save JSON | Exports the validated sprite project payload. | Serializes the validated sprite project payload as the tools.sprite-editor output shape. |
| `tools/Sprite Editor/index.html`: `button[button]#loadProjectButton` - Load JSON | Starts sprite project payload import/load. | Reads incoming JSON into the tool-owned sprite project payload only after validation succeeds. |
| `tools/Sprite Editor/index.html`: `button[button]#importPngButton` - Import PNG | Starts sprite project payload import/load. | Reads incoming JSON into the tool-owned sprite project payload only after validation succeeds. |
| `tools/Sprite Editor/index.html`: `button[button]#exportPngButton` - Export Frame PNG | Exports the validated sprite project payload. | Serializes the validated sprite project payload as the tools.sprite-editor output shape. |
| `tools/Sprite Editor/index.html`: `button[button]#exportSheetButton` - Export Sprite Sheet | Exports the validated sprite project payload. | Serializes the validated sprite project payload as the tools.sprite-editor output shape. |
| `tools/Sprite Editor/index.html`: `button[button]#packageProjectButton` - Package Project | Triggers the current sprite project payload UI action for `Package Project`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]` - + Colors | Triggers the current sprite project payload UI action for `+ Colors`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]` - + Frames | Triggers the current sprite project payload UI action for `+ Frames`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]` - + Project I/O | Triggers the current sprite project payload UI action for `+ Project I/O`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]` - + Preview | Triggers the current sprite project payload UI action for `+ Preview`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]` - + Status | Triggers the current sprite project payload UI action for `+ Status`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]#playPreviewButton` - Play | Controls preview/playback for the current sprite project payload. | No tools.sprite-editor JSON change unless a schema-owned playback setting is explicitly edited. |
| `tools/Sprite Editor/index.html`: `button[button]#pausePreviewButton` - Pause | Controls preview/playback for the current sprite project payload. | No tools.sprite-editor JSON change unless a schema-owned playback setting is explicitly edited. |
| `tools/Sprite Editor/index.html`: `button[button]#resetPreviewButton` - Reset | Creates or resets a draft sprite project payload. | Initializes tool-owned sprite project payload data; tools.sprite-editor is unchanged until validation and publish/export. |
| `tools/Sprite Editor/index.html`: `button[button]#inspectRemediationButton` - Inspect Issues | Triggers the current sprite project payload UI action for `Inspect Issues`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]#jumpToProblemButton` - Jump to Problem | Triggers the current sprite project payload UI action for `Jump to Problem`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]#applyRemediationButton` - Apply Suggested Fix | Publishes or applies the validated sprite project payload. | Writes the validated output shape to tools.sprite-editor. |
| `tools/Sprite Editor/index.html`: `button[button]#refreshExperienceButton` - Refresh Pipeline View | Triggers the current sprite project payload UI action for `Refresh Pipeline View`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |
| `tools/Sprite Editor/index.html`: `button[button]#refreshDebugVisualizationButton` - Refresh Debug View | Triggers the current sprite project payload UI action for `Refresh Debug View`. | May update draft sprite project payload data; tools.sprite-editor publish must wait for validation. |

## Panels And Surfaces Found
- `tools/Sprite Editor/how_to_use.html`: `.tools-platform-surface`
- `tools/Sprite Editor/index.html`: `.app-shell`
- `tools/Sprite Editor/index.html`: `.canvas-wrap`
- `tools/Sprite Editor/index.html`: `.center-panel`
- `tools/Sprite Editor/index.html`: `.frame-controls`
- `tools/Sprite Editor/index.html`: `.io-controls`
- `tools/Sprite Editor/index.html`: `.left-panel`
- `tools/Sprite Editor/index.html`: `.panel-accordion`
- `tools/Sprite Editor/index.html`: `.panel-accordion__body`
- `tools/Sprite Editor/index.html`: `.panel-accordion__summary`
- `tools/Sprite Editor/index.html`: `.preview-controls`
- `tools/Sprite Editor/index.html`: `.right-panel`
- `tools/Sprite Editor/index.html`: `.sprite-editor-page`
- `tools/Sprite Editor/index.html`: `.sprite-editor-page-root`
- `tools/Sprite Editor/index.html`: `.swatch-grid`
- `tools/Sprite Editor/index.html`: `.toolbar-group`
- `tools/Sprite Editor/index.html`: `.toolbar-row`
- `tools/Sprite Editor/index.html`: `.tools-platform-control-cluster--preview`
- `tools/Sprite Editor/index.html`: `.tools-platform-layout-grid`
- `tools/Sprite Editor/index.html`: `.tools-platform-resize-panel`

## Current Component/Class/Function Inventory
- `tools/Sprite Editor/main.js`: applyProjectSystemState; bootSpriteEditor; getApi; getOverlayPanels; getOverlaySidebar; registerToolBootContract; setupFullscreenSidePanels; syncFullscreenClass; syncOverlayToggleButtons; toggleOverlayPanel
- `tools/Sprite Editor/modules/colorUtils.js`: clampChannel; colorToPickerValue; dedupeColors; expandShortHex; isTransparent; normalizeColor; rgbaToHex; withOpaqueAlpha
- `tools/Sprite Editor/modules/projectModel.js`: clampInt; cloneFrame; createEmptyFrame; createNewProject; ensureProjectShape; frameIndex; normalizeAssetRefs; normalizePaletteRef; resizeProject; serializeProject
- `tools/Sprite Editor/modules/spriteEditorApp.js`: addFrame; applyCanonicalPaletteToProject; applyColorSlotSwatch; applyDrawAt; applyHistorySnapshot; applyLockedPaletteToProject; applyRemediationAction; applySamplePreset; applySwatchVisual; bindControls; bindPointerDrawing; bindShortcuts; bresenhamLine; buildEnginePaletteCatalog; buildPresetLoadedStatus; buildSampleSourceDetailLabel; buildSampleSourceLabel; canFloodFill; canvasToBlob; clamp; clearPaletteLock; createCheckerboard; createHistorySnapshot; createImageFromFrame; createSpriteSheetCanvas; deleteFrame; deriveDefaultSpriteAssetPath; deriveSpriteFileName; deriveSpritePresetDiagnosticTopLevelKeys; downloadBlob; drawFramePixels; duplicateFrame; emitSpriteEditorControlReadiness; ensureEditingEnabled; ensureFrameSelection; exportCurrentFramePng; exportSpriteSheetPng; extractCanonicalPalettePayload; extractPaletteColors; extractSpriteAssetRegistryFromSamplePreset; extractSpriteProjectFromSamplePreset; fileToImage; fileToText; findManifestRoundtripEntry; floodFill; getCanvasPixelFromEvent; getColorSlotValues; getRequiredElement; getSelectedFrame; guardSpriteProjectAction; hydratePaletteFromRefIfPossible; importPngIntoCurrentFrame; initializeSpriteEditorApp; inspectRemediationActions; isEditableTarget; isEditingEnabled; isPaletteLocked; isPaletteSelected; jumpToRemediationProblem; loadAssetRegistryJson; loadProjectJson; loadSampleMetadataManifest; normalizeManifestPath; normalizePaletteEntryColor; normalizeProjectColor; normalizeSampleId; normalizeSampleLabel; normalizeSamplePresetPath; normalizeToolId; onPointerDown; onPointerLeave; onPointerMove; onPointerUp; packageSpriteProject; parseCanonicalPalettePayload; pushHistory; pushRecentColor; redo; renderAll; renderColorSelectors; renderEditor; renderHud; renderPalette; renderPaletteSelect; renderPreview; renderRecentColors; renderToolButtons; resetProject; resizeWithFeedback; resolvePaletteFromAssetRegistry; resolveRequiredPaletteInput; saveAssetRegistryJson; saveProjectJson; selectColor; setPixel; setSampleSource; setSpriteEditorLifecycle; setStatus; shiftFrame; startPreviewLoop; step; summarizeGraphFindings; syncControlsFromProject; syncRegistryProjectId; syncSpriteAssetsToRegistry; syncSpriteEditorUxContract; tryLoadPresetFromQuery; undo; updateDebugVisualizationUI; updateEditGateDisabledState; updateEditorExperienceUI; updateHistoryButtons; updatePaletteLockText; updateRemediationUI; updateStatusBar; updateToolStateText; validateSpriteProjectAssets; willPixelChange

## Target Controls
Keep:
- sprite project controls
- canvas/editor controls
- frame/layer/animation controls
- import/copy/export controls

Remove or rename:
- any publish path that exposes unvalidated draft sprite data

Add:
- Validate Sprite Project
- Publish `tools.sprite-editor`
- frame/layer/animation validation feedback

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for sprite project payload. Current contract baseline: `tools/schemas/tools/sprite-editor.schema.json` (Sprite Editor Payload).
Required keys: `spriteProject`.
Optional keys: `assetRegistry`.

Tool-owned JSON responsibilities:
- import/load: parse incoming sprite project payload and reject it before mutation when invalid
- validate: apply the current sprite project payload contract before export, copy, or publish
- edit/process: mutate only sprite project payload fields owned by Sprite Editor
- export/save: serialize the validated sprite project payload as the tools.sprite-editor output shape
- publish: write only the validated tools.sprite-editor value produced by Sprite Editor
- copy/create payload: create copied payload text from the validated sprite project payload, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts a `spriteProject` object
- allows optional `assetRegistry` data when present in the schema
- publishes only a validated sprite project payload

## Invalid JSON Rejection Behavior
- malformed JSON
- missing or invalid `spriteProject`
- frame/layer/animation data outside the schema
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.sprite-editor = {
  "assetRegistry": "jsonValue", // optional
  "spriteProject": "jsonValue"
}
```

## Playwright Expectations
- load `tools/Sprite Editor/index.html` without console errors
- create/edit a frame or layer and confirm export JSON updates
- reject invalid sprite project JSON

## Manual Test Expectations
- Open `tools/Sprite Editor/index.html` and confirm the sprite editor canvas and project controls render.
- Create or edit a sprite frame/layer, validate, export, and re-import.
- Try malformed JSON and an invalid `spriteProject`; each must block publish.

## Known Gaps
- Publish should be explicit after project validation.
- Validation should pinpoint the failing frame/layer/animation.

## Rebuild Order Priority
core-05: rebuild in the core tool lane after earlier priorities are stable.
