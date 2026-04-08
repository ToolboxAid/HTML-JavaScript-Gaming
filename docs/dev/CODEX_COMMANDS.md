MODEL: GPT-5.3-codex
REASONING: high
COMMAND:
Execute docs/pr/BUILD_PR_SHARED_EXTRACTION_34_AS_POSITIVE_NUMBER_NETWORK_BATCH.md exactly.
Edit only these files:
- src/shared/utils/numberUtils.js (only to add/export asPositiveNumber if missing, or minimum export fix if present)
- games/network_sample_a/game/FakeLoopbackNetworkModel.js
- games/network_sample_a/game/NetworkSampleAScene.js
- games/network_sample_b/game/FakeHostClientNetworkModel.js
- games/network_sample_b/game/NetworkSampleBScene.js
- games/network_sample_c/game/FakeDivergenceTraceNetworkModel.js
- games/network_sample_c/game/NetworkSampleCScene.js
Do not expand scope.
Package the delta output to <project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_34_AS_POSITIVE_NUMBER_NETWORK_BATCH_delta.zip
