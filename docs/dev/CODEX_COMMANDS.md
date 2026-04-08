MODEL: GPT-5.3-codex
REASONING: high
COMMAND:
Execute docs/pr/BUILD_PR_SHARED_EXTRACTION_12_NETWORK_SAMPLE_C_NUMBER_HELPERS.md exactly.
Edit only these files:
- games/network_sample_c/game/ReconciliationLayerAdapter.js
- games/network_sample_c/game/StateTimelineBuffer.js
- src/shared/utils/numberUtils.js (only if minimum export fix is needed)
Fail fast if src/shared/utils/numberUtils.js does not already exist and export or contain asFiniteNumber and asPositiveInteger.
Do not expand scope.
Package the delta output to <project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_12_NETWORK_SAMPLE_C_NUMBER_HELPERS_delta.zip
