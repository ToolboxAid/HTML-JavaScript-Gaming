MODEL: GPT-5.3-codex
REASONING: high

CONSTRAINTS:
- DO NOT scan repo
- ONLY modify listed files
- NO engine API changes
- NO new files unless explicitly listed

TASK:
Implement Level 11.7 promotion gate INLINE only in:
src/advanced/state/createWorldGameStateSystem.js

RULES:
- Do NOT add new exports
- Do NOT expand public API
- Do NOT create new files
- Do NOT modify any other files

OUTPUT:
Create ZIP at:
<project folder>/tmp/BUILD_PR_LEVEL_11_7_FINAL_PROMOTION_GATE_clean.zip
