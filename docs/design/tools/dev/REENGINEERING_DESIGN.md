# Developer Tooling Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `dev`
Source folder: `tools/dev`

## 1. Tool Purpose
Provide debug console, command packs, guard scripts, and development-only tooling support.

## 2. Folder/Files Inspected
- `tools/dev/advanced/debugMacroExecutor.js`
- `tools/dev/advanced/debugMacroRegistry.js`
- `tools/dev/advanced/debugPanelGroupRegistry.js`
- `tools/dev/advanced/registerStandardDebugMacros.js`
- `tools/dev/advanced/registerStandardPanelGroups.js`
- `tools/dev/canvasDebugHudRenderer.js`
- `tools/dev/checkBoundaryHardeningGuard.mjs`
- `tools/dev/checkDocsStructureGuard.mjs`
- `tools/dev/checkPhase24CloseoutExecutionGuard.mjs`
- `tools/dev/checkSharedExtractionGuard.mjs`
- `tools/dev/checkSharedExtractionGuard.selftest.mjs`
- `tools/dev/checkStyleSystemGuard.mjs`
- `tools/dev/commandPacks/commandPackResultUtils.js`
- `tools/dev/commandPacks/debugCommandPack.js`
- `tools/dev/commandPacks/entityCommandPack.js`
- `tools/dev/commandPacks/groupCommandPack.js`
- `tools/dev/commandPacks/hotReloadCommandPack.js`
- `tools/dev/commandPacks/inputCommandPack.js`
- `tools/dev/commandPacks/inspectorCommandPack.js`
- `tools/dev/commandPacks/macroCommandPack.js`
- `tools/dev/commandPacks/overlayCommandPack.js`
- `tools/dev/commandPacks/packUtils.js`
- `tools/dev/commandPacks/presetCommandPack.js`
- `tools/dev/commandPacks/renderCommandPack.js`
- `tools/dev/commandPacks/sceneCommandPack.js`
- `tools/dev/commandPacks/toggleCommandPack.js`
- `tools/dev/commandPacks/validationCommandPack.js`
- `tools/dev/devConsoleCommandRegistry.js`
- `tools/dev/devConsoleIntegration.js`
- `tools/dev/inspectors/inspectorStore.js`
- `tools/dev/interactiveDevConsoleRenderer.js`
- `tools/dev/plugins/debugPluginSystem.js`
- `tools/dev/presets/debugPresetApplier.js`
- `tools/dev/presets/debugPresetRegistry.js`
- `tools/dev/presets/registerPresetCommands.js`
- `tools/dev/presets/registerStandardDebugPresets.js`
- `tools/dev/server-dashboard/README.md`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 0, inputs 0, selects 0, textareas 0, tables 0, inferred DOM controls/panels 0.
- No buttons, inputs, selects, textareas, tables, or direct control lookups were found in the inspected files.
- Panels/surfaces: none found by class-name scan.

## 4. Current Component/Class/Function Inventory
- `tools/dev/advanced/debugMacroExecutor.js`: class DebugMacroExecutor; function parseCommandName; function toResult; method executeMacro
- `tools/dev/advanced/debugMacroRegistry.js`: class DebugMacroRegistry; function asStepArray; function normalizeMacroDescriptor; function validateMacroDescriptor; method getCount; method getMacro; method getReports; method hasMacro; method listMacros; method registerMacro
- `tools/dev/advanced/debugPanelGroupRegistry.js`: class DebugPanelGroupRegistry; function normalizeGroupDescriptor; function validateGroupDescriptor; method getCount; method getGroup; method getReports; method hasGroup; method listGroups; method registerGroup
- `tools/dev/advanced/registerStandardDebugMacros.js`: function registerStandardDebugMacros
- `tools/dev/advanced/registerStandardPanelGroups.js`: function registerStandardPanelGroups
- `tools/dev/canvasDebugHudRenderer.js`: function drawCanvasDebugHud; function drawCanvasDebugHudPanel; function drawPanelWithCanvasContext; function drawPanelWithRendererFallback; function getCanvasContext; function toArrayLines
- `tools/dev/checkBoundaryHardeningGuard.mjs`: function collectViolations; function evaluateSpecifier; function listSourceFiles; function normalizePath; function printReport; function resolveLayerForAbsolutePath; function resolveLayerForSpecifier; function run
- `tools/dev/checkDocsStructureGuard.mjs`: function fail; function ok
- `tools/dev/checkPhase24CloseoutExecutionGuard.mjs`: function collectSampleFiles; function normalizeRoadmapStatusMarkers; function readJson; function runGuard; function sha256; function toPosix
- `tools/dev/checkSharedExtractionGuard.mjs`: function collectSourceFiles; function diffViolations; function findViolations; function loadBaseline; function parseArgs; function pathExists; function printGroupedViolations; function printSummary; function run; function sortViolations; function summarizeViolationLabels; function violationKey; function writeBaseline
- `tools/dev/checkSharedExtractionGuard.selftest.mjs`: function asFiniteNumber; function createWorkspaceWithFixture; function run; function runCase; function runGuardAt
- `tools/dev/checkStyleSystemGuard.mjs`: function readUtf8
- `tools/dev/commandPacks/commandPackResultUtils.js`: function createResult
- `tools/dev/commandPacks/debugCommandPack.js`: function createDebugCommandPack; method handler; method validate
- `tools/dev/commandPacks/entityCommandPack.js`: function createEntityCommandPack; method handler; method validate
- `tools/dev/commandPacks/groupCommandPack.js`: function buildSnapshot; function createGroupCommandPack; function persistSnapshotIfConfigured; function setGroupEnabled; method handler; method validate
- `tools/dev/commandPacks/hotReloadCommandPack.js`: function createHotReloadCommandPack; function toDelegatedOutput; method handler; method validate
- `tools/dev/commandPacks/inputCommandPack.js`: function createInputCommandPack; method handler; method validate
- `tools/dev/commandPacks/inspectorCommandPack.js`: function asPositiveInt; function createInspectorCommandPack; function findEntity; function formatTime; function getInspectorsSnapshot; function getInspectorStore; method handler; method validate
- `tools/dev/commandPacks/macroCommandPack.js`: function createMacroCommandPack; method handler; method validate
- `tools/dev/commandPacks/overlayCommandPack.js`: function buildMissingPanelError; function buildPanelSnapshot; function createFailedResult; function createOverlayCommandPack; function createReadyResult; function findPanel; function formatPanelLine; function formatPanelOrderLine; function getPanels; function persistOverlayState; function setPanelState; function togglePanelState; function toRuntimeContextError; method handler; method validate
- `tools/dev/commandPacks/packUtils.js`: function delegateRuntimeCommand; function requireAtLeastArgs; function requireNoArgs; function safeArray; function safeSection; function standardDetails; function toLinePair
- `tools/dev/commandPacks/presetCommandPack.js`: function createPresetCommandPack
- `tools/dev/commandPacks/renderCommandPack.js`: function createRenderCommandPack; method handler; method validate
- `tools/dev/commandPacks/sceneCommandPack.js`: function createSceneCommandPack; method handler; method validate
- `tools/dev/commandPacks/toggleCommandPack.js`: function createToggleCommandPack; function executePresetToggle; method handler; method validate
- `tools/dev/commandPacks/validationCommandPack.js`: function createValidationCommandPack; method handler; method validate
- `tools/dev/devConsoleCommandRegistry.js`: function createConsoleOutput; function createDevConsoleCommandRegistry; function createFailure; function createStandardOutput; function execute; function executeRuntimeFallback; function listCommands; function listPacks; function normalizeHandlerOutput; function parseCommandInput; function registerPack; function renderHelp; function toLines; function validatePack; method getCommandCount; method getPackCount
- `tools/dev/devConsoleIntegration.js`: function appendExecutionToConsole; function autocompleteConsoleInput; function buildCommandContext; function buildRegistryCommandContext; function buildRuntimeFromOptions; function captureCommandHistory; function clampConsoleCursor; function createDefaultAdapters; function createSampleGameDevConsoleIntegration; function cyclePanel; function deleteAtCursor; function deleteBeforeCursor; function executeCommand; function executeRegistryCommand; function executeRuntimeCommand; function findLongestCommonPrefix; function flattenOverlaySections; function getComboEdgePress; function getCommandRegistryNames; function getCommandTokenAtCursor; function getConsoleHistoryLines; function getConsoleInputDisplay; function getInputEdgePress; function getKeyboardEventTarget; function insertConsoleText; function isModifierDown; function isPrintableCharacter; function navigateConsoleHistory; function normalizeRuntimeDelegationResult; function onConsoleKeyDown; function pushConsoleOutputLine; function pushConsoleOutputLines; function render; function replaceConsoleRange; function resetConsoleAutocompleteState; function resetConsoleUiState; function scrollConsoleHistory; function setConsoleInputBuffer; function submitConsoleInput; function summarizeSampleGameDevConsoleIntegration; function toContextSection; function trackPluginReport; function update; method activatePlugin; method deactivatePlugin; method dispose; method getPluginRegistry; method getRuntime; method getState; method listPlugins; method registerPlugin; method unregisterPlugin
- `tools/dev/inspectors/inspectorStore.js`: function asFinite; function asPositiveInt; function boundedPush; function buildDiffSummary; function createInspectorStore; function createSyntheticComponents; function createSyntheticEntitySnapshot; function getSnapshot; function getStateSection; function normalizeComponentMap; function normalizeEntity; function normalizeStreamEvent; function normalizeTimelineEvent; function safeId; function setSelectedEntityId; function update
- `tools/dev/interactiveDevConsoleRenderer.js`: function drawInteractiveConsoleWithCanvasContext; function drawInteractiveConsoleWithRendererFallback; function drawInteractiveDevConsole; function getCanvasContext; function toLines
- `tools/dev/plugins/debugPluginSystem.js`: function activatePlugin; function applyPanelActivation; function asPositiveInt; function checkCapabilities; function checkLimit; function createContextApi; function createDebugPluginRegistry; function createEntry; function createExtensionLimits; function deactivatePlugin; function dispose; function disposePlugin; function ensureContext; function initializePlugin; function isFeatureEnabled; function listPlugins; function loadExtensions; function normalizeAvailableCapabilities; function normalizeCapabilityDescriptor; function normalizeFeatureFlags; function normalizePluginDescriptor; function registerPlugin; function registerPlugins; function runHookSafely; function toResult; function unregisterPlugin; function validatePluginDescriptor; function wrapCommandPack; method getAvailableCapabilities; method getDiagnosticsSnapshot; method getLimits; method getRuntimeSnapshot; method handler; method listCapabilities; method registerCommandPack; method registerPanel; method registerProvider
- `tools/dev/presets/debugPresetApplier.js`: class DebugPresetApplier; function buildPanelSnapshot; function getAllPanels; function toPanelMap; method applyPreset; method captureBaseline; method getCurrentPresetId; method persistSnapshotIfAvailable; method resetPreset
- `tools/dev/presets/debugPresetRegistry.js`: class DebugPresetRegistry; function normalizePresetDescriptor; function validatePresetDescriptor; method getCount; method getPreset; method getReports; method hasPreset; method listPresets; method registerPreset
- `tools/dev/presets/registerPresetCommands.js`: function createCommandResult; function formatPresetLine; function registerPresetCommands; method handler; method validate
- `tools/dev/presets/registerStandardDebugPresets.js`: function registerStandardDebugPresets

## 5. JSON Schema/Input Contract Currently Expected
No standalone JSON input contract. Guard baselines and dev command data are development-only support inputs, not runtime tool payloads.

JSON handling signals found: download/export, JSON.parse, JSON.stringify, tools.*, validate.

## 6. Valid JSON Behavior
Valid JSON is only accepted when a consuming tool or support script explicitly calls this folder. There is no standalone publish/import flow owned by this folder.

## 7. Invalid JSON Rejection Behavior
Invalid JSON is rejected by the consuming helper/script path. This folder should not silently repair or publish malformed tool payloads.

## 8. Tool-Owned JSON Responsibilities
- import/load: support-only; no standalone tool import flow unless a consuming script invokes it.
- validate: support-only validation helpers where present.
- edit/process: support modules may process values for callers; no workspace editing of internals.
- export/save: support-only unless a maintenance script writes its own artifact.
- publish to `tools.dev` if applicable: no standalone published output in this folder.
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
P28: Developer Tooling. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
