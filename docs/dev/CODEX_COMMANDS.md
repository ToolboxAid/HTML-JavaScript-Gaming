MODEL: GPT-5.3-codex
REASONING: high
COMMAND:
Execute docs/pr/BUILD_PR_SHARED_EXTRACTION_16_ALIAS_IMPORTS_NETWORK_SAMPLE_C.md exactly.
Edit only these files:
- games/network_sample_c/game/ReconciliationLayerAdapter.js
- games/network_sample_c/game/StateTimelineBuffer.js
Fail fast if jsconfig.json is missing, the @shared alias is not present, or required shared target files are missing.
Do not expand scope.
Package the delta output to <project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_16_ALIAS_IMPORTS_NETWORK_SAMPLE_C_delta.zip
