MODEL: GPT-5.3-codex
REASONING: high

CONSTRAINTS:
- DO NOT scan repo
- ONLY modify files that explicitly import from engine/
- NO engine API changes
- NO new files

TASK:
Replace import paths:
engine/... → src/engine/...

RULES:
- Do not modify anything else
- Do not change logic
- Do not delete engine/ yet

OUTPUT:
<project folder>/tmp/BUILD_PR_REPO_STRUCTURE_NORMALIZATION_02_IMPORT_SWITCH.zip
