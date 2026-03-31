MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_SAMPLE_RENUMBERING_AND_INDEX_REORG as an implementation delta. Rename and regroup samples using a four-digit numbering system where the first two digits are the level and the second two digits are the sample number within that level. Move samples into phase folders such as `Phase 01 - Core Engine (0101-0124)/` instead of keeping one long flat list. Update `samples/index.html` so it reflects the new sample locations and names. Add a new empty section between 11 and 12 called `Sample games`, reserved for future tile, parallax, and other sample-game entries. Do not modify engine core APIs.

REQUIRED REPORT OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/change_summary.txt
docs/dev/reports/validation_checklist.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_SAMPLE_RENUMBERING_AND_INDEX_REORG_delta.zip
- Include docs/dev/reports/
- Include only relevant files
