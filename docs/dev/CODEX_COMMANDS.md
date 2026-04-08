MODEL: GPT-5.3-codex
REASONING: high
COMMAND:
Execute docs/pr/BUILD_PR_SHARED_EXTRACTION_27_AS_OBJECT_AS_ARRAY_DEBUG_BATCH.md exactly.
Edit only these files:
- src/engine/debug/inspectors/shared/inspectorUtils.js (only if minimum export fix is needed)
- games/Asteroids/debug/asteroidsShowcaseDebug.js
- games/network_sample_a/debug/networkSampleADebug.js
- games/network_sample_b/debug/networkSampleBDebug.js
- games/network_sample_c/debug/networkSampleCDebug.js
- tools/dev/inspectors/inspectorStore.js
- tools/dev/plugins/debugPluginSystem.js
Fail fast unless src/engine/debug/inspectors/shared/inspectorUtils.js exists and exposes asObject and asArray, or can be fixed with a minimum export-only change.
Do not expand scope.
Package the delta output to <project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_27_AS_OBJECT_AS_ARRAY_DEBUG_BATCH_delta.zip
