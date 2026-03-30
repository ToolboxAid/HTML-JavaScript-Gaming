MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_PARALLAX_EDITOR_COMPANION as an implementation delta. Build a separate Parallax Editor companion tool. Support parallax layer management, image assignment, draw order, scroll factors, repeat/wrap controls, preview against the same project/level format as the Tile Map Editor, and load/save for parallax-only data. Keep it separate from the Tile Map Editor UI and do not modify engine core APIs.

REQUIRED REPORT OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/change_summary.txt
docs/dev/reports/validation_checklist.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_PARALLAX_EDITOR_COMPANION_delta.zip
- Include docs/dev/reports/
- Include only relevant files
