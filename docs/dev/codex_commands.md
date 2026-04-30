# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

## PR
BUILD_PR_LEVEL_11_130_TOOL_INPUT_CONTRACT_WITH_PALETTE_DEPENDENCY

STRICT SCOPE MODE

ALLOWED FILES:
- docs only

TASK:

1. Document palette dependency rules
2. Validate tools that require palette:
   - payload JSON direct
   - palette JSON direct
3. Ensure:
   - no wrapper accepted
   - no parent JSON accepted
   - no fallback palette
   - no transform

REPORT:
docs/dev/reports/tool_palette_dependency_11_130.txt

FAIL if any tool:
- injects palette
- transforms palette
