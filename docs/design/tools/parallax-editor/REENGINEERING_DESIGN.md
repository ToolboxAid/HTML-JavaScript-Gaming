# Parallax Scene Studio Reengineering Design (parallax-editor)

## Purpose
- Parallax Scene Studio: compose layered backgrounds, midgrounds, and foreground scene depth.

## Current V1 Capability
- Active in registry-driven tools surface.
- Runtime entry point: `Parallax Scene Studio/index.html`.
- Runtime implementation file: `tools/Parallax Scene Studio/main.js`.

## Current V2 / Workspace Status
- Legacy/first-class tool present in registry; not fully mapped into Workspace V2 toolState lane.
- Workspace integration classification:
  - global tool: no
  - toolState-capable tool: no
  - published `tools.*` output candidate: yes
- Readiness: Needs additional schema/contract alignment

## Expected JSON Schema/Input
- Schema ref: `tools/schemas/tools/parallax-editor.schema.json`. Required root keys: none. Defined root properties: `parallaxDocument`, `tilemapDocumentPath`, `vectorAssetSvgPath`.

## Valid JSON Load Behavior (Target)
- Parse incoming tool payload once.
- Validate against the tool schema/contract before rendering.
- Render the fully valid state and expose clear contract readout text.

## Invalid JSON Rejection Behavior (Target)
- Reject before rendering domain state.
- Show one clear actionable invalid message.
- Avoid fallback/default injections and avoid mutating inbound payload structure.

## Current Components/Functions
- Class `ParallaxEditorApp` in `tools/Parallax Scene Studio/main.js`.
- Class methods: `constructor()`, `invalidateImageCache()`, `clearTransientLayerImageSources()`, `setTransientLayerImageSource()`, `getTransientLayerImageSource()`, `init()`, `captureRefs()`, `attachEvents()`, `syncFullscreenState()`, `syncOverlayToggleButtons()`, `getOverlaySidebar()`, `getOverlayPanels()`, `toggleOverlayPanel()`, `handleOverlayAccordionToggle()`, `getSelectedLayer()`, `touchDocument()`, `bindRuntimeStateSync()`, `publishLivePreviewSync()`, `queueLivePreviewSync()`, `updateStatus()`, `syncInputsFromDocument()`, `updateCameraInputBounds()`, `refreshSimulationActionState()`, `configureSimulationTraverse()`, `getSimulationProgress()`, `updateSimulationContextReadout()`, `applySimulationCameraAtProgress()`, `enterSimulationMode()`, `pauseSimulation()`, `resumeSimulation()`, `restartSimulationPosition()`, `exitSimulationMode()`, `startSimulationLoop()`, `advanceSimulationCamera()`, `applyParallaxDocument()`, `handleNewProject()`, `syncAssetRegistryFromDocument()`, `resolveAssetRefsFromRegistry()`, `handleSaveProject()`, `handleSaveAssetRegistry()`, `handleExportTilemapPatch()`, `handlePackageProject()`, `handleLoadProject()`, `handleLoadAssetRegistry()`, `applyMapMetaFromInputs()`, `addLayer()`, `removeSelectedLayer()`, `duplicateSelectedLayer()`, `moveSelectedLayer()`, `applyBasicLayerFields()`, `applyExtendedLayerSettings()`, `applyImageSourceFromInput()`, `assignLocalImageFile()`, `handleCameraChange()`, `renderAll()`, `renderLayerList()`, `renderSelectedLayerFields()`, `resolveLayerImageUrl()`, `getLayerImageRecord()`, `drawFallbackLayer()`, `drawSingleLayer()`, `ensureSimulationViewportFocus()`, `renderPreview()`, `validateProjectAssets()`, `updateRemediationUI()`, `updateEditorExperienceUI()`, `updateDebugVisualizationUI()`, `refreshExperienceSnapshot()`, `refreshDebugVisualizationSnapshot()`, `inspectRemediationActions()`, `jumpToRemediationProblem()`, `applyRemediationAction()`.
- Top-level functions: `normalizeSamplePresetPath()`, `buildPresetLoadedStatus()`, `clamp()`, `cloneDeep()`, `normalizeMapMeta()`, `createDefaultLayer()`, `normalizeLayer()`, `sortLayersByOrder()`, `normalizeDrawOrderSequence()`, `sanitizeAssetRefs()`, `createRegistryManagedParallaxSaveDocument()`, `createInitialParallaxDocument()`, `sanitizeParallaxDocument()`, `extractParallaxDocument()`, `extractParallaxDocumentFromSamplePreset()`, `createTilemapParallaxPatch()`, `createDownload()`, `summarizeGraphFindings()`, `mod()`, `getLayerVisualColor()`, `isStrictWorkspaceParallaxSnapshot()`, `bootParallaxSceneStudio()`.

## Target Components/Functions
- Separate explicit JSON contract functions (`import`, `validate`, `load`, `export`) from view-only rendering methods.
- Keep tool-specific logic inside the tool runtime; avoid Workspace V2 owning tool-specific compare/merge/edit behavior.
- Keep one visible invalid-state path that blocks render before any partial state draws.

## Tool-Owned JSON Functions
- Import: `updateSimulationContextReadout()`, `handleLoadProject()`, `handleLoadAssetRegistry()`, `buildPresetLoadedStatus()`, `createDownload()`
- Validate: `invalidateImageCache()`, `validateProjectAssets()`, `normalizeSamplePresetPath()`, `normalizeMapMeta()`, `normalizeLayer()`, `normalizeDrawOrderSequence()`, `sanitizeAssetRefs()`, `sanitizeParallaxDocument()`
- Edit/process: `updateStatus()`, `updateCameraInputBounds()`, `updateSimulationContextReadout()`, `applySimulationCameraAtProgress()`, `applyParallaxDocument()`, `applyMapMetaFromInputs()`, `addLayer()`, `removeSelectedLayer()`, `applyBasicLayerFields()`, `applyExtendedLayerSettings()`, `applyImageSourceFromInput()`, `renderAll()`, `renderLayerList()`, `renderSelectedLayerFields()`, `renderPreview()`, `updateRemediationUI()`, `updateEditorExperienceUI()`, `updateDebugVisualizationUI()`, `applyRemediationAction()`
- Export: `handleExportTilemapPatch()`, `createDownload()`
- Add/copy to Workspace toolState: `publishLivePreviewSync()`
- Publish to `tools.parallax-editor`: Supported as target ownership in design; concrete publish path varies by tool.
- Compare/merge for own schema: Not currently tool-local; Workspace V2 has cross-toolState compare/merge UI today.

## Workspace Integration Contract
- Workspace launch path exists via tools index/workspace-manager registry entry points.
- Explicit Workspace V2 toolState contract is not yet completed for this tool.

## Playwright Expectations
- Valid payload path should show visible valid-state surface.
- Invalid payload path should show visible invalid-state surface and hide valid state.
- Workspace launch handoff should open the tool with hostContext/toolState payload when applicable.

## Manual Test Expectations
- Launch from `tools/index.html` and confirm baseline UI renders.
- Launch from Workspace V2 when applicable and confirm payload handoff path.
- Provide an invalid JSON contract and confirm the tool blocks render with explicit error.

## Known Gaps
- Tool is not fully in the current Workspace V2 toolState-capable Playwright lane.
