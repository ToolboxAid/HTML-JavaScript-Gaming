MODEL: GPT-5.3-codex
REASONING: high
COMMAND:
Execute docs/pr/BUILD_PR_SHARED_EXTRACTION_08_IS_PLAIN_OBJECT_ADVANCED_ONLY.md exactly.
Edit only these files:
- src/advanced/promotion/createPromotionGate.js
- src/advanced/state/createWorldGameStateSystem.js
- src/shared/utils/objectUtils.js (only if minimum export change is needed)
Fail fast if src/shared/utils/objectUtils.js does not already exist and export or contain isPlainObject.
Do not expand scope.
Package the delta output to <project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_08_IS_PLAIN_OBJECT_ADVANCED_ONLY_delta.zip
