MODEL: GPT-5.3-codex
REASONING: high
COMMAND:
Execute docs/pr/BUILD_PR_SHARED_EXTRACTION_15B_ALIAS_CONFIG_BOOTSTRAP_JSCONFIG_ONLY.md exactly.
Edit only these files:
- jsconfig.json (new file)
- src/advanced/promotion/createPromotionGate.js
- src/advanced/state/createWorldGameStateSystem.js
Fail fast if any required shared target file is missing.
Do not expand scope.
Package the delta output to <project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_15B_ALIAS_CONFIG_BOOTSTRAP_JSCONFIG_ONLY_delta.zip
