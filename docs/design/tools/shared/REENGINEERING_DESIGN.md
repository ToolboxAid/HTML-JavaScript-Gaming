# Shared Tool Support Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `shared`
Source folder: `tools/shared`

## 1. Tool Purpose
Provide shared authoring, asset, pipeline, validation, preview, and launch support modules used by multiple tools.

## 2. Folder/Files Inspected
- `tools/shared/aiAuthoringAssistant.js`
- `tools/shared/assetMarketplace.js`
- `tools/shared/assetPipelineConverters.js`
- `tools/shared/assetPipelineFoundation.js`
- `tools/shared/assetPipelineValidationOutput.js`
- `tools/shared/assetUsageIntegration.js`
- `tools/shared/asteroidsPlatformDemo.js`
- `tools/shared/ciValidationPipeline.js`
- `tools/shared/cloudRuntime.js`
- `tools/shared/collaborationSystem.js`
- `tools/shared/contractVersioning.js`
- `tools/shared/debugInspectorData.js`
- `tools/shared/debugInspectorTools.css`
- `tools/shared/debugToolInteractionFlow.js`
- `tools/shared/debugVisualizationLayer.js`
- `tools/shared/devConsoleDebugOverlay.js`
- `tools/shared/documentModeGuards.js`
- `tools/shared/editor/EntityPlacementEditor.js`
- `tools/shared/editor/index.js`
- `tools/shared/editor/LevelEditor.js`
- `tools/shared/editor/TileMapEditor.js`
- `tools/shared/editor/TimelineEditor.js`
- `tools/shared/editorExperienceLayer.js`
- `tools/shared/eventCommandUtils.js`
- `tools/shared/gameplaySystemLayer.js`
- `tools/shared/gameTemplates.js`
- `tools/shared/hotReloadSystem.js`
- `tools/shared/livePreviewSyncChannel.js`
- `tools/shared/multiTargetExport.js`
- `tools/shared/paletteDocumentContract.js`
- `tools/shared/performanceBenchmarks.js`
- `tools/shared/performanceProfiler.js`
- `tools/shared/pipeline/assetErrorHandling.js`
- `tools/shared/pipeline/AssetImportPipeline.js`
- `tools/shared/pipeline/assetManifestLoader.js`
- `tools/shared/pipeline/assetPipelineTooling.js`
- `tools/shared/pipeline/AudioPreprocessPipeline.js`
- `tools/shared/pipeline/BuildAssetManifestSystem.js`
- `tools/shared/pipeline/ContentMigrationSystem.js`
- `tools/shared/pipeline/ContentValidationPipeline.js`
- `tools/shared/pipeline/gameAssetManifestCoordinator.js`
- `tools/shared/pipeline/gameAssetManifestDiscovery.js`
- `tools/shared/pipeline/index.js`
- `tools/shared/pipeline/runtimeAssetBinding.js`
- `tools/shared/pipeline/runtimeAssetLookup.js`
- `tools/shared/pipeline/runtimeAssetValidation.js`
- `tools/shared/pipeline/TexturePreprocessPipeline.js`
- `tools/shared/platformShell.css`
- `tools/shared/platformShell.js`
- `tools/shared/platformValidationSuite.js`
- `tools/shared/pluginArchitecture.js`
- `tools/shared/preview/generate-list-previews.html`
- `tools/shared/preview/generate-previews.html`
- `tools/shared/preview/preview-pages.css`
- `tools/shared/projectAssetRegistry.js`
- `tools/shared/projectAssetRemediation.js`
- `tools/shared/projectAssetValidation.js`
- `tools/shared/projectManifestContract.js`
- `tools/shared/projectPackaging.js`
- `tools/shared/projectSystem.js`
- `tools/shared/projectSystemAdapters.js`
- `tools/shared/projectSystemValueUtils.js`
- `tools/shared/projectToolIntegration.js`
- `tools/shared/projectVersioning.js`
- `tools/shared/publishingPipeline.js`
- `tools/shared/renderPipelineContract.js`
- `tools/shared/runtimeAssetLoader.js`
- `tools/shared/runtimeAssetSharedUtils.js`
- `tools/shared/runtimeAssetValidationUtils.js`
- `tools/shared/runtimeSceneLoaderHotReload.js`
- `tools/shared/runtimeStreaming.js`
- `tools/shared/schemaOnlyToolPresetValidation.js`
- `tools/shared/stringUtils.js`
- `tools/shared/toolBootContract.js`
- `tools/shared/toolHostManifest.js`
- `tools/shared/toolHostRuntime.js`
- `tools/shared/toolHostSharedContext.js`
- `tools/shared/tooling/AssetBrowser.js`
- `tools/shared/tooling/CapturePreviewRuntime.js`
- `tools/shared/tooling/DeveloperConsole.js`
- `tools/shared/tooling/index.js`
- `tools/shared/tooling/LiveTuningService.js`
- `tools/shared/tooling/PropertyEditor.js`
- `tools/shared/tooling/RuntimeInspector.js`
- `tools/shared/tooling/SceneGraphViewer.js`
- `tools/shared/toolLaunchSSoT.js`
- `tools/shared/toolLaunchSSoTData.js`
- `tools/shared/toolLoadDiagnostics.js`
- `tools/shared/toolSampleCatalog.js`
- `tools/shared/uiSafeUtils.js`
- `tools/shared/unifiedToolUxContract.js`
- `tools/shared/vector/vectorAssetBridge.js`
- `tools/shared/vector/vectorAssetContract.js`
- `tools/shared/vector/vectorGeometryMath.js`
- `tools/shared/vector/vectorRenderPrep.js`
- `tools/shared/vector/vectorSafeValueUtils.js`
- `tools/shared/vectorAssetSystem.js`
- `tools/shared/vectorGeometryRuntime.js`
- `tools/shared/vectorNativeTemplate.js`
- `tools/shared/vectorTemplateSampleGame.js`
- `tools/shared/workspaceShell.js`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 13, inputs 7, selects 0, textareas 1, tables 0, inferred DOM controls/panels 1.
- `tools/shared/platformShell.js`: button[button] - New Workspace
- `tools/shared/platformShell.js`: button[button] - Open Workspace
- `tools/shared/platformShell.js`: button[button] - Save Workspace
- `tools/shared/platformShell.js`: button[button] - Save Workspace As
- `tools/shared/platformShell.js`: button[button] - Close Workspace
- `tools/shared/platformShell.js`: input[file] - input
- `tools/shared/platformShell.js`: button[button] - PREV
- `tools/shared/platformShell.js`: button[button] - NEXT
- `tools/shared/preview/generate-list-previews.html`: input[text] #baseUrl - http://127.0.0.1:5500
- `tools/shared/preview/generate-list-previews.html`: input[number] #waitMs - 3500
- `tools/shared/preview/generate-list-previews.html`: textarea #sampleList - Paste sample paths or IDs here, one per line.
Examples:
samples/phase01/0102/index.html
sa...
- `tools/shared/preview/generate-list-previews.html`: input[checkbox] #forceRewrite - forceRewrite
- `tools/shared/preview/generate-list-previews.html`: input[checkbox] #onlyCaptureTimeout - onlyCaptureTimeout
- `tools/shared/preview/generate-list-previews.html`: button #pickRepoBtn - Pick Repo Folder
- `tools/shared/preview/generate-list-previews.html`: button #executeBtn - Execute
- `tools/shared/preview/generate-list-previews.html`: button #stopBtn - Stop
- `tools/shared/preview/generate-list-previews.html`: panel #sampleList - inferred from JS DOM lookup
- `tools/shared/preview/generate-previews.html`: input[text] #baseUrl - http://localhost:5500
- `tools/shared/preview/generate-previews.html`: input[number] #waitMs - 3500
- `tools/shared/preview/generate-previews.html`: button #pickRepoBtn - Pick Repo Folder
- `tools/shared/preview/generate-previews.html`: button #runBtn - Run
- `tools/shared/preview/generate-previews.html`: button #stopBtn - Stop
- Panels/surfaces found:
  - `tools/shared/platformShell.js`: .tools-platform-frame__nav-grid
  - `tools/shared/platformShell.js`: .tools-platform-frame__workspace-status-block
  - `tools/shared/platformShell.js`: .tools-platform-frame__shared-status
  - `tools/shared/platformShell.js`: .tools-platform-frame__nav${navWorkspaceLockClass}
  - `tools/shared/platformShell.js`: .tools-platform-statusbar
  - `tools/shared/preview/generate-previews.html`: .preview-list-page

## 4. Current Component/Class/Function Inventory
- `tools/shared/aiAuthoringAssistant.js`: function buildAiAuthoringAssistant; function createSuggestion; function createTrace; function sanitizeText; function summarizeAiAuthoringAssistant
- `tools/shared/assetMarketplace.js`: function buildAssetMarketplace; function createReport; function normalizeListing; function sanitizeText; function summarizeAssetMarketplace
- `tools/shared/assetPipelineConverters.js`: function cloneCandidate; function convertAssetPipelineCandidate; function createAssetPipelineConverterRegistry; function createSpriteNormalizationConverter; function createTileToVectorConverter; function createVectorToTileConverter; function listAssetPipelineConverters; function normalizeConversionRequest; function normalizePath; function normalizeSection; function normalizeType; function replacePathExtension; function resolveConverter; function toFileSlug; function withConversionMetadata; method convert; method match
- `tools/shared/assetPipelineFoundation.js`: function buildFallbackLabel; function convertNormalizedAssetPipelineCandidate; function createAssetPipelineOutput; function ensureConverterRegistry; function inferSectionFromType; function ingestAssetPipelineCandidate; function normalizeAssetPipelineCandidate; function normalizeSection; function registerAssetPipelineCandidate; function summarizeAssetPipelineRules; function validateAssetPipelineCandidate; function validateAssetPipelineRegistryState; function validateNormalizedAssetPipelineCandidate
- `tools/shared/assetPipelineValidationOutput.js`: function classifyGraphFindings; function collectCandidateReferences; function createAssetPipelineOutputArtifact; function listSectionNames; function normalizeMetadataReferences; function summarizeRegistry; function toDeterministicSlug; function validateAssetPipelineState; function validateCandidateReferencesAgainstRegistry; function validateEntryIds; function validateSectionShape
- `tools/shared/assetUsageIntegration.js`: function clearSharedAssetHandoff; function clearSharedPaletteHandoff; function createAssetHandoff; function createPaletteHandoff; function dispatchHandoffChanged; function getSharedLaunchContext; function getSharedShellActions; function getSharedToolHref; function getToolDisplayName; function isHostedWorkspaceMode; function isRecord; function normalizeAssetTags; function normalizeAssetType; function normalizeMetadata; function normalizePaletteColors; function normalizeSharedAssetHandoff; function normalizeSharedPaletteHandoff; function normalizeTimestamp; function readSharedAssetHandoff; function readSharedPaletteHandoff; function safeParseJson; function sanitizeText; function writeSharedAssetHandoff; function writeSharedPaletteHandoff
- `tools/shared/asteroidsPlatformDemo.js`: function buildAsteroidsPlatformDemo; function buildImageSource; function createAsteroidsPlatformDemoDefinition; function createDemoDetails; function createParallaxDocument; function createRegistry; function createReport; function createRuntimeAssetSources; function createSpriteProject; function createTileMapDocument; function createVectorDocument; function findRegistryEntry; function sanitizeText; function summarizeAsteroidsPlatformDemo
- `tools/shared/ciValidationPipeline.js`: function buildArtifactEntries; function createReport; function runCiValidationPipeline; function sanitizeText; function summarizeCiValidationPipeline
- `tools/shared/cloudRuntime.js`: function buildCloudRuntime; function createReport; function sanitizeText; function summarizeCloudRuntime
- `tools/shared/collaborationSystem.js`: function buildCollaborationSystem; function collectConflicts; function createAudit; function sanitizeText; function summarizeCollaborationSystem
- `tools/shared/contractVersioning.js`: function compareContractVersion; function createVersionedContractMetadata; function createVersionedContractPolicy; function evaluateContractVersion; function normalizeContractVersion; function parseVersionParts; function sanitizeText; function toSemver; function uniqueSemvers
- `tools/shared/debugInspectorData.js`: function asArray; function asNumber; function createStateInspectorSnapshot; function getReplayEventAtTime; function normalizeReplayEvents; function percentile; function runDeterministicWorkloadIteration; function safeParseJson; function summarizeDurationSamples; function toPositiveInt; function toPrettyJson
- `tools/shared/debugToolInteractionFlow.js`: function handleKeydown; function isTextEntryElement; function setupDebugToolInteractionFlow; function triggerPrimaryAction
- `tools/shared/debugVisualizationLayer.js`: function buildDebugVisualizationLayer; function createSection; function formatSection; function sanitizeText; function summarizeDebugVisualizationLayer; function toAssetPipelineStateLines; function toAssetRuntimeStateLines; function toGraphLines; function toPackagingLines; function toProfilerLines; function toRemediationLines; function toRuntimeLines; function toValidationLines
- `tools/shared/devConsoleDebugOverlay.js`: function applyHotReload; function buildCoreCommandDefinition; function collectDiagnostics; function createCommandRegistry; function createDevConsoleDebugOverlayRuntime; function createDiagnosticsCollector; function createDiagnosticsEnvelope; function createOverlayPanelRegistry; function createStructuredReport; function defaultPanelRenderer; function dispose; function execute; function executeConsoleInput; function getDeterministicRenderOrder; function getDevDiagnosticsContractVersionMetadata; function getOrderedPanels; function listCommands; function normalizeRenderStageToken; function parseInput; function registerCommand; function registerPanel; function render; function renderOverlay; function setPanelEnabled; function summarizeDevConsoleDebugOverlay; function validateCommandDefinition; function validateDiagnosticsEnvelope; function validatePanelDefinition; method collect; method execute; method getCount; method getReports; method getState; method hideConsole; method hideOverlay; method showConsole; method showOverlay
- `tools/shared/documentModeGuards.js`: function addToolModeMetadata; function assertStandaloneToolDocument; function detectWorkspaceDocument; function getDocumentMode; function getDocumentToolId; function inferToolIdFromDocument; function isWorkspaceManagerContext; function isWorkspaceManagerParent; function navigateToTool; function offerImportMismatchOptions; function sanitizeText; function stashViewerPayload
- `tools/shared/editor/EntityPlacementEditor.js`: class EntityPlacementEditor; method addEntity; method exportEntities; method moveEntity
- `tools/shared/editor/LevelEditor.js`: class LevelEditor; method exportLevel; method getCell; method setCell
- `tools/shared/editor/TileMapEditor.js`: class TileMapEditor; method paint; method setActiveTile
- `tools/shared/editor/TimelineEditor.js`: class TimelineEditor; method addClip; method exportTimeline; method moveClip
- `tools/shared/editorExperienceLayer.js`: function buildEditorExperienceLayer; function buildReportText; function createLine; function sanitizeText; function summarizeEditorExperienceLayer; function toActionLines; function toDependencyLines; function toFindingLines; function toPackageLines; function toRuntimeLines
- `tools/shared/eventCommandUtils.js`: function bindEventHandlers; function createCommandDispatcher; function dispatchCommand; function sanitizeCommand
- `tools/shared/gameplaySystemLayer.js`: function buildGameplaySystemLayer; function createReport; function inferBindingRole; function sanitizeText; function summarizeGameplaySystemLayer
- `tools/shared/gameTemplates.js`: function buildGameTemplates; function createReport; function sanitizeText; function summarizeGameTemplates
- `tools/shared/hotReloadSystem.js`: function createReport; function fingerprintManifest; function runHotReloadSystem; function sanitizeText; function summarizeHotReloadSystem
- `tools/shared/livePreviewSyncChannel.js`: function createLivePreviewSyncBridge; function dispatchMessage; function dispose; function hasObjectField; function hasRuntimeState; function hasToolStatePayload; function publish; function sanitizeText; function subscribe; function toMessageEnvelope; function validateStateBindingPayload
- `tools/shared/multiTargetExport.js`: function buildMultiTargetExport; function createReport; function sanitizeText; function summarizeMultiTargetExport
- `tools/shared/paletteDocumentContract.js`: function getFallbackSymbol; function normalizeEntry; function normalizeLegacyColorEntries; function normalizePaletteDocument; function sanitizeText; function toHexColor; function toObject; function validatePaletteDocument
- `tools/shared/performanceBenchmarks.js`: function createDefaultPerformanceBenchmarkSuite; function createPerformanceBenchmarkSuite; function createReport; function evaluateThreshold; function normalizeMissingStageBehavior; function normalizeNumber; function normalizeSamples; function normalizeThreshold; function normalizeThresholds; function runPerformanceBenchmarkSuite; function sanitizeText; function summarizePerformanceBenchmarkSuite
- `tools/shared/performanceProfiler.js`: function add; function buildPerformanceProfiler; function createReport; function createSample; function sanitizeText; function sortSamples; function summarizeGeometryParticipation; function summarizePerformanceProfiler
- `tools/shared/pipeline/assetErrorHandling.js`: function appendAssetError; function appendAssetErrors; function createAssetError; function toErrorLevel
- `tools/shared/pipeline/AssetImportPipeline.js`: class AssetImportPipeline; method run
- `tools/shared/pipeline/assetManifestLoader.js`: function discoverRuntimeAssets; function getAssetManifestRelativePath; function loadAssetManifest; function readManifestJson; function toGameId; function toManifestPath
- `tools/shared/pipeline/assetPipelineTooling.js`: function buildCoordinator; function collectRecords; function createDomainPaths; function normalizeDomain; function normalizeDomainRecord; function normalizeGameId; function runAssetPipelineTooling; function sortByDomainAndAssetId; function toArray; function toSlug; function validateToolContracts
- `tools/shared/pipeline/AudioPreprocessPipeline.js`: class AudioPreprocessPipeline; method run
- `tools/shared/pipeline/BuildAssetManifestSystem.js`: class BuildAssetManifestSystem; method createManifest; method validate
- `tools/shared/pipeline/ContentMigrationSystem.js`: class ContentMigrationSystem; method migrate; method register
- `tools/shared/pipeline/ContentValidationPipeline.js`: class ContentValidationPipeline; method run
- `tools/shared/pipeline/gameAssetManifestCoordinator.js`: function asArray; function asObject; function buildEmptyDomains; function coordinateGameAssetManifest; function mergeDomains; function normalizeExistingManifest; function normalizeRecord; function sortDomainEntries; function toSlug
- `tools/shared/pipeline/gameAssetManifestDiscovery.js`: function asArray; function asObject; function discoverRuntimeAssetSourcesFromManifest; function inferRuntimeKind; function pushIssue; function validateGameAssetManifestStructure
- `tools/shared/pipeline/runtimeAssetBinding.js`: function asArray; function asObject; function buildDomainBindingEntries; function createRuntimeAssetBinding; function isRuntimePath; function normalizeDomain; function normalizeManifestRecord; function resolveRuntimeAsset; function toSlug
- `tools/shared/pipeline/runtimeAssetLookup.js`: function buildRuntimeRecords; function createDomainIndex; function createRuntimeManifestAssetLookup; function getRuntimeBindingDomain; function normalizeRuntimeRecord; function resolvePackagedAsset; function toObject; function toSlug; method getDebugState; method getErrors
- `tools/shared/pipeline/runtimeAssetValidation.js`: function asObject; function hasRuntimePath; function hasText; function includesDataPath; function validateRequiredFields; function validateRuntimeResolvedAsset
- `tools/shared/pipeline/TexturePreprocessPipeline.js`: class TexturePreprocessPipeline; method run
- `tools/shared/platformShell.js`: class tools; function applyDocumentMetadata; function applyFullscreenShellState; function applySidebarAccordionRules; function asHeadingElement; function bindHeaderIntroFullscreenEvents; function bindLiveBindingRefresh; function bindWorkspacePagerDelegatedEvents; function bindWorkspaceShellEvents; function buildHostedRegistryEntryHref; function buildToolDetailsToggleText; function buildToolHeaderIntroData; function buildWorkspaceHrefFromGameId; function classifyToolGroup; function clearFullscreenLayoutMarkers; function clearFullscreenSummaryMarkers; function clearSharedBindingsForNewLaunch; function clearStorageLike; function clearToolStateStorageForWorkspaceLaunch; function convertPanelToAccordion; function deriveGameAssetCatalogPaths; function deriveGameManifestPaths; function emitAccordionReadinessLog; function ensureRuntimeMonitoring; function exitFullscreenAndRestoreShell; function getAccordionStateKey; function getAssetPathBasename; function getDefaultHeaderExpandedState; function getDisplaySurfaceName; function getHandoffGameId; function getManifest; function getPageMode; function getRegistryEntryHref; function getRelativeRepoHomePath; function getRelativeToolsHomePath; function hasToolState; function hydrateSharedAssetFromGameLaunchContext; function hydrateSharedPaletteFromGameLaunchContext; function hydrateSharedPaletteFromSamplePresetPath; function inferAssetDisplayName; function initPlatformShell; function installWorkspaceScopedSamplePresetFetchShim; function isAssetCompatibleWithTool; function isCurrentGameHandoff; function isDeprecatedHostedSvgPlatformBadgeLaunch; function isHostedToolLaunch; function isHostedWorkspaceBadgeRowRemovalLaunch; function isToolDisabled; function isWorkspaceManagerContext; function isWorkspaceManagerParent; function isWorkspaceManifestPreset; function manifestVectorEntry; function normalizeAssetKind; function normalizeCatalogEntries; function normalizeFetchRequestPath; function normalizeForwardedLaunchParam; function normalizeLocalHref; function normalizeSamplePresetPath; function normalizeSingleLineText; function normalizeTextValue; ... 46 more
- `tools/shared/platformValidationSuite.js`: function createBaseRegistry; function createLoaders; function createReport; function createScenario; function createValidTilemapDocument; function formatScenarioReport; function runGoldenPathScenario; function runInvalidReferenceScenario; function runPackagingAndRuntimeDeterminismScenario; function runPlatformValidationSuite; function runPluginScenario; function runRemediationScenario; function runRuntimeFailureScenario; function runStreamingScenario; function runVersioningScenario; function sanitizeText; function summarizePlatformValidationSuite
- `tools/shared/pluginArchitecture.js`: function buildPluginArchitecture; function createReport; function normalizePlugin; function sanitizeText; function summarizePluginArchitecture; function validateHostPackage
- `tools/shared/projectAssetRegistry.js`: function addGraphEdge; function buildAssetDependencyGraph; function cloneDeep; function createAssetDependencyGraph; function createAssetId; function createAssetRegistry; function createGraphEdgeId; function createGraphFinding; function createGraphNode; function createRegistryDownloadPayload; function dedupeColors; function findMergeIndex; function findRegistryEntryById; function mergeAssetRegistries; function normalizeProjectRelativePath; function sanitizeAssetRegistry; function sanitizeEntry; function sanitizeId; function sanitizeText; function slugify; function upsertRegistryEntry
- `tools/shared/projectAssetRemediation.js`: function addInspectAndNavigate; function addSingleCandidateRelink; function buildProjectAssetRemediation; function createAction; function getPrimaryRemediationAction; function mapFindingToActions; function sanitizeText; function sortActions; function summarizeProjectAssetRemediation; function toRegistryIds
- `tools/shared/projectAssetValidation.js`: function canonicalizeGraph; function collectCycleFindings; function collectDuplicateRegistryIdFindings; function collectParallaxDocumentFindings; function collectSpriteProjectFindings; function collectTileMapDocumentFindings; function collectVectorDocumentFindings; function collectVectorRegistryFindings; function createFinding; function getBlockingAssetValidationMessage; function graphsMatch; function hasBlockingAssetValidationFindings; function mapGraphFindingToValidationFinding; function sanitizeText; function sortFindings; function summarizeAssetValidation; function validateProjectAssetState; function visit
- `tools/shared/projectManifestContract.js`: function captureSharedReferenceSnapshot; function createEmptyProjectManifest; function createProjectId; function migrateProjectManifest; function normalizeProjectFileName; function sanitizeEntries; function sanitizeExportArtifacts; function sanitizeSharedLibrary; function sanitizeSharedReference; function sanitizeToolsBlock; function serializeProjectManifest; function validateProjectManifest
- `tools/shared/projectPackaging.js`: function buildAssetRecord; function buildProjectPackage; function collectPackagingRoots; function createBlockedResult; function createPackagingReport; function sanitizeText; function sortStrings; function summarizeProjectPackaging; function traverseDependencies; function visit
- `tools/shared/projectSystem.js`: function adapter; function applyExternalToolState; function buildStatusSummary; function clearStorage; function computeObservedManifest; function createWorkspaceSystemController; function downloadTextFile; function ensureWorkspaceManifest; function handleCloseWorkspace; function handleNewWorkspace; function handleOpenWorkspace; function handleSaveWorkspace; function handleSaveWorkspaceAs; function isGenericWorkspaceName; function markSaved; function maybeApplyInitialToolState; function readFileAsText; function readStorage; function serializeForDirtyComparison; function shouldConfirmDiscard; function startWatching; function updateDirtyState; function writeStorage; method getManifest; method isDirty
- `tools/shared/projectSystemAdapters.js`: function buildUnavailableAdapter; function createAssetBrowserAdapter; function createAssetPipelineAdapter; function createPaletteBrowserAdapter; function createParallaxAdapter; function createSpriteAdapter; function createTilemapAdapter; function createVectorAssetAdapter; function createVectorMapAdapter; function getProjectAdapter; function readToolApi; method applyState; method captureState; method getProjectName
- `tools/shared/projectSystemValueUtils.js`: function cloneValue; function safeString
- `tools/shared/projectToolIntegration.js`: function addAssetRef; function addAssetRefList; function buildProjectToolIntegration; function createEmptyNormalizedAssetReferences; function extractToolAssetReferences; function getToolDataContract; function mergeAssetRefs; function normalizeDocumentAssetRefs; function normalizeId; function normalizeIdList; function normalizeProjectAssetRefs; function normalizeToolStateForProjectManifest; function readObject; function sanitizeAssetRefsBlock; function stripVolatileToolFields; function unwrapToolStateForAdapter; function validateToolStateContract
- `tools/shared/projectVersioning.js`: function buildProjectVersioning; function createReport; function readSchemaName; function readSchemaVersion; function sanitizeText; function summarizeProjectVersioning
- `tools/shared/publishingPipeline.js`: function createReport; function runPublishingPipeline; function sanitizeText; function summarizePublishingPipeline
- `tools/shared/renderPipelineContract.js`: function composeFromAssetDocument; function composeFromCompositionDocument; function createContractError; function createStageStatus; function getRenderContractVersionMetadata; function getRenderPipelineStageOrder; function mergeAssets; function normalizeAssetDocument; function normalizeCompositionDocument; function pushError; function resolveDocumentLookup; function runRenderContractRuntimePath; function sanitizeText; function sequenceLayersAndItems; function summarizeRenderContractRuntimePath; function validateAssetDocument; function validateAssetRecords; function validateCompositionDocument; function validateEntityRecords; function validateEnvelope; function validateItemRecords; function validateLayerRecords; function validateUniqueIds
- `tools/shared/runtimeAssetLoader.js`: function createLoaderState; function finalizeLoadedAsset; function loadPackagedProjectRuntime; function summarizeRuntimeAssetLoader; function toBootstrapData
- `tools/shared/runtimeAssetSharedUtils.js`: function createRuntimeReport; function sanitizeRuntimeText
- `tools/shared/runtimeAssetValidationUtils.js`: function createRegistryDefinition; function validatePackageManifest
- `tools/shared/runtimeSceneLoaderHotReload.js`: function buildRuntimeScene; function classifyDomainsFromOutput; function classifyReloadPlan; function collectReferenceDomainLookup; function createDefaultDomainLoader; function createHotReloadCoordinator; function createRuntimeSceneLoader; function createSceneCompositionLoader; function createStructuredReport; function createWatcherBridge; function disposeActiveScene; function disposeDomainHandle; function flush; function getState; function load; function normalizeChangeEvent; function publish; function reload; function runRuntimeLoad; function sanitizeText; function setEnabled; function summarizeContractFailure; function summarizeRuntimeSceneHotReload; function toMap; method getState; method load
- `tools/shared/runtimeStreaming.js`: function buildRuntimeStreamingManifest; function collectBootAssetIds; function loadRuntimeStreamingChunks; function summarizeRuntimeStreaming; function visit
- `tools/shared/schemaOnlyToolPresetValidation.js`: function buildSchemaValidationScreenErrorMessage; function enforceToolPresetSchemaOnlyContract; function getSchemaPathForToolId; function isPlainObject; function keyMatchesPropertyNameSchema; function normalizeText; function readFailedField; function readSchemaForTool; function resolveJsonPointer; function validateBranchSchema; function validateJsonValueAgainstSchema; function validateNode
- `tools/shared/toolBootContract.js`: function getBootRegistry; function getToolBootContract; function registerToolBootContract; function sanitizeToolId
- `tools/shared/toolHostManifest.js`: function createToolHostEntry; function createToolHostManifest; function getToolHostEntryById; function toHostLaunchPath
- `tools/shared/toolHostRuntime.js`: function assertExplicitLaunchInputs; function buildHostLaunchUrl; function clearMountedTools; function createHostFrame; function createToolHostRuntime; function destroyMountRecord; function getCurrentMount; function isPlainObject; function launch; function readToolDestroyContract; function setActiveMount; function setFrameActive; function unmountCurrentTool; function validateInput
- `tools/shared/toolHostSharedContext.js`: function buildContextStorageKey; function createContextId; function createToolHostSharedContext; function getHostStorage; function readToolHostSharedContextById; function readToolHostSharedContextFromLocation; function removeToolHostSharedContextById; function safeParseJson; function sanitizeToolId; function writeToolHostSharedContext
- `tools/shared/tooling/AssetBrowser.js`: class AssetBrowser; method getSelected; method list; method select
- `tools/shared/tooling/CapturePreviewRuntime.js`: function bootCapturePreview
- `tools/shared/tooling/DeveloperConsole.js`: class DeveloperConsole; method execute; method register
- `tools/shared/tooling/LiveTuningService.js`: class LiveTuningService; method get; method onChange; method set
- `tools/shared/tooling/PropertyEditor.js`: class PropertyEditor; method set
- `tools/shared/tooling/RuntimeInspector.js`: class RuntimeInspector; method inspect
- `tools/shared/tooling/SceneGraphViewer.js`: class SceneGraphViewer; method flatten
- `tools/shared/toolLaunchSSoT.js`: function appendQuery; function clearExternalToolWorkspaceMemory; function clearStorageKeysByPrefix; function launchWithExternalToolWorkspaceReset; function normalizeSamplePresetPath; function normalizeText; function resolveGameWorkspaceLaunchHref; function resolveSampleToolLaunchHref
- `tools/shared/toolLaunchSSoTData.js`: function buildTargetPathFromEntryPoint; function cloneLaunchDefinition; function createSampleToolLaunchDefinition; function createWorkspaceManagerGameLaunchDefinition; function findActiveVisibleToolById; function getSampleToolLaunchDefinition; function getWorkspaceManagerGameLaunchDefinition; function listToolLaunchIds; function normalizeEntryPoint; function normalizeText; function normalizeToken; function validateLaunchDefinitionAccess
- `tools/shared/toolLoadDiagnostics.js`: function appendQueryValue; function buildActualBlock; function buildArrayCounts; function buildCacheKey; function buildEventPayload; function buildExpectedBlock; function buildFieldPresence; function cacheLoaded; function classifyLikelyCause; function clearClassificationCacheForScope; function collectRequiredPaths; function deriveClassification; function emitBoundaryAndClassification; function emitClassification; function emitMissingPaletteClassification; function emitToolLoadLog; function extractLoadedSchema; function findFirstMatch; function findPalettePathCandidate; function getCachedLoaded; function getEmptyRequiredArrays; function getMissingArrayRequiredFields; function getMissingRequiredFields; function getMissingScalarRequiredFields; function getToolContract; function getToolLoadQuerySnapshot; function getToolLoadRequestedDataPaths; function inferExpectedPath; function inferExpectedPathKey; function inferExpectedSchema; function inferPrimaryDependencyId; function inferRequiredArrayFields; function inferRequiredFields; function isHttpFailure; function isSchemaMismatch; function logToolLoadError; function logToolLoadFetch; function logToolLoadLoaded; function logToolLoadRequest; function logToolLoadWarning; function logToolUiControlReady; function logToolUiFinalReady; function logToolUiLifecycle; function makeUniqueList; function normalizeClassificationValue; function normalizePathParts; function normalizeQueryValue; function normalizeShapeList; function normalizeText; function readHttpStatus; function sanitizePayload; function summarizePaletteData; function summarizeReplayData; function summarizeSpriteData; function summarizeToolLoadData; function summarizeTopLevelKeys; function summarizeValueShape; function summarizeValueType
- `tools/shared/toolSampleCatalog.js`: function normalizeToolSamplePath; function toToolSampleLabel
- `tools/shared/uiSafeUtils.js`: function asHtmlInput; function queryAll; function queryFirst; function readDataAttribute; function setTextContent
- `tools/shared/unifiedToolUxContract.js`: function applyUnifiedLayoutZones; function getBodyElement; function getUnifiedEmptyStateMessage; function normalizeText; function setToolUxLifecycleState
- `tools/shared/vector/vectorAssetBridge.js`: function extractPathData; function extractViewBox; function normalizeSvgToVectorAsset; function summarizeVectorAssetDefinition
- `tools/shared/vector/vectorAssetContract.js`: function createDefaultVectorOrigin; function hasLegacyGeometryPaths; function inspectVectorAssetContract; function normalizeAnchor; function normalizeColor; function normalizeFill; function normalizeLayer; function normalizeLegacyLayer; function normalizeOrigin; function normalizePoint; function normalizePoints; function normalizeShape; function normalizeShapeGeometry; function normalizeStroke; function normalizeVectorAssetContract; function normalizeViewport; function parseViewBoxString; function pushIssue; function validateLayerAndShapeStructure; function validateStylePayload; function validateVectorAssetContract
- `tools/shared/vector/vectorGeometryMath.js`: function combineBounds; function computeBoundsFromPoints; function createPoint; function parseSvgPathData; function readNumber; function rotatePoint; function scalePoint; function tokenizePathData; function transformPoint; function transformPoints; function translatePoint
- `tools/shared/vector/vectorRenderPrep.js`: function createCollisionPrimitive; function createRenderableGeometry; function prepareVectorRenderables; function resolveStyle; function sampleEllipsePoints
- `tools/shared/vector/vectorSafeValueUtils.js`: function sanitizeVectorText
- `tools/shared/vectorAssetSystem.js`: function buildVectorAssetSystem; function createReport; function createVectorAssetSystemFixture; function sanitizeText
- `tools/shared/vectorGeometryRuntime.js`: function createReport; function inspectVectorGeometryRuntimeAsset; function prepareVectorGeometryRuntimeAsset; function sanitizeText; function summarizeVectorGeometryRuntime
- `tools/shared/vectorNativeTemplate.js`: class vector; function buildVectorNativeTemplate; function createParallaxDocument; function createRegistry; function createReport; function createRuntimeAssetSources; function createTileMapDocument; function createVectorDocument; function createVectorNativeTemplateDefinition; function findRegistryEntry; function sanitizeText; function summarizeVectorNativeTemplate
- `tools/shared/vectorTemplateSampleGame.js`: function buildVectorTemplateSampleGame; function createReport; function createVectorTemplateSampleGameDefinition; function remapPath; function remapRegistry; function remapRuntimeSources; function summarizeVectorTemplateSampleGame
- `tools/shared/workspaceShell.js`: function appendTextElement; function applyPaletteContract; function applySvgAssetStudioContract; function createBaseWorkspaceShellState; function initWorkspaceShell; function isRecord; function normalizeText; function publishWorkspaceShellState; function readSearchParams; function readWorkspaceShellStateFromLocation; function renderHostedSvgAssetBadge; function renderWorkspaceShellFromLocation; function renderWorkspaceShellStatus

## 5. JSON Schema/Input Contract Currently Expected
No standalone JSON input contract. Shared modules define reusable validation, launch, pipeline, asset, and preview helpers for tool-owned contracts.

JSON handling signals found: Blob/object URL, download/export, FileReader, hostContextId, JSON.parse, JSON.stringify, localStorage, safeParseJson, schema, sessionStorage, tools.*, toolState, validate.

## 6. Valid JSON Behavior
Valid JSON is only accepted when a consuming tool or support script explicitly calls this folder. There is no standalone publish/import flow owned by this folder.

## 7. Invalid JSON Rejection Behavior
Invalid JSON is rejected by the consuming helper/script path. This folder should not silently repair or publish malformed tool payloads.

## 8. Tool-Owned JSON Responsibilities
- import/load: support-only; no standalone tool import flow unless a consuming script invokes it.
- validate: support-only validation helpers where present.
- edit/process: support modules may process values for callers; no workspace editing of internals.
- export/save: support-only unless a maintenance script writes its own artifact.
- publish to `tools.shared` if applicable: no standalone published output in this folder.
- copy/create toolState if applicable: no.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
No `tools.*` game/sample output is owned by this folder in the reset design. Consuming tools may use helpers from this folder, but persisted game/sample payloads must come from the owning launchable tool.

## 11. Playwright Expectations
No direct Playwright launch is expected for this global-only/support folder. Coverage should come through the launchable tool or guard that consumes it.

## 12. Manual Test Expectations
Manual verification should inspect the consuming workflow or maintenance script only; this folder has no direct user-facing tool flow.

## 13. Known Gaps
- Keep this folder support-only unless a future BUILD explicitly promotes a launchable/publishable contract.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P27: Shared Tool Support. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
