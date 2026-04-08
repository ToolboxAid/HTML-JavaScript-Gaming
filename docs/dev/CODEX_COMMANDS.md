MODEL: GPT-5.3-codex
REASONING: high
COMMAND:
Execute docs/pr/BUILD_PR_SHARED_EXTRACTION_26_SANITIZE_TEXT_TOOLS_DEBUG_BATCH.md exactly.
Edit only these files:
- src/engine/debug/inspectors/shared/inspectorUtils.js (only if minimum export fix is needed)
- tools/dev/canvasDebugHudRenderer.js
- tools/dev/devConsoleCommandRegistry.js
- tools/dev/devConsoleIntegration.js
- tools/dev/interactiveDevConsoleRenderer.js
- tools/dev/advanced/debugMacroExecutor.js
- tools/dev/advanced/debugMacroRegistry.js
- tools/dev/advanced/debugPanelGroupRegistry.js
- tools/dev/commandPacks/groupCommandPack.js
- tools/dev/commandPacks/inspectorCommandPack.js
- tools/dev/commandPacks/macroCommandPack.js
- tools/dev/commandPacks/overlayCommandPack.js
- tools/dev/commandPacks/packUtils.js
- tools/dev/inspectors/inspectorStore.js
- tools/dev/plugins/debugPluginSystem.js
- tools/dev/presets/debugPresetApplier.js
- tools/dev/presets/debugPresetRegistry.js
- tools/dev/presets/registerPresetCommands.js
- tools/shared/devConsoleDebugOverlay.js
Fail fast unless src/engine/debug/inspectors/shared/inspectorUtils.js exists and exposes sanitizeText, or can be fixed with a minimum export-only change.
Do not expand scope.
Package the delta output to <project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_26_SANITIZE_TEXT_TOOLS_DEBUG_BATCH_delta.zip
