MODEL: GPT-5.3-codex
REASONING: high
COMMAND:
Execute docs/pr/BUILD_PR_SHARED_EXTRACTION_11_CONSUMER_EDGE_VALIDATION.md exactly.
Edit only these files if needed:
- src/advanced/promotion/createPromotionGate.js
- src/advanced/state/createWorldGameStateSystem.js
- games/network_sample_c/game/ReconciliationLayerAdapter.js
- src/shared/utils/numberUtils.js
- src/shared/utils/objectUtils.js
- src/shared/state/createPromotionStateSnapshot.js
Fail fast if any required shared file is missing or a required helper/export is absent entirely.
Do not expand scope.
Package the delta output to <project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_11_CONSUMER_EDGE_VALIDATION_delta.zip
