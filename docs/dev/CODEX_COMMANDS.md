MODEL: GPT-5.3-codex
REASONING: high

CONSTRAINTS:
- DO NOT scan repo
- ONLY modify listed targets
- NO engine API changes
- NO new files unless explicitly listed

TASK:
Staged, non-destructive engine move.

1) Create directory:
   src/engine/

2) Copy ALL files and folders from:
   engine/**

   to:
   src/engine/**

3) Preserve relative structure exactly (1:1 mirror).

RULES:
- Do NOT delete or modify anything under engine/
- Do NOT change any import paths
- Do NOT edit file contents
- Do NOT create files outside src/engine/**
- If any ambiguity, STOP and report

OUTPUT:
Create ZIP at:
<project folder>/tmp/BUILD_PR_REPO_STRUCTURE_NORMALIZATION_01_ENGINE_MOVE.zip
