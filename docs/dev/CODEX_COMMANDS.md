MODEL: GPT-5.3-codex
REASONING: medium

COMMAND:
Validate the completed move of:
tools/SpriteEditor_old_keep/
→ docs/archive/tools/SpriteEditor_old_keep/

Steps:
1. Confirm old path does not exist
2. Confirm new archive path exists with identical structure
3. Search repo for any remaining references to old path
4. Confirm no runtime imports reference the old path
5. Generate validation report:
   docs/dev/reports/spriteeditor_archive_move_validation.md
6. If any broken references are found, list them (DO NOT FIX)

Package results to:
<project folder>/tmp/APPLY_PR_SPRITEEDITOR_ARCHIVE_VALIDATE_v2.zip