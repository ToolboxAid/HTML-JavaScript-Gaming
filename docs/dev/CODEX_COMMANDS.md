MODEL: GPT-5.3-codex
REASONING: medium

COMMAND:
Create BUILD_PR_SVG_PAN_BUTTON_REMOVAL_AND_TILESET_PNG_ASSIGNMENT as an implementation delta. Remove the explicit Pan button from tools/SVG Background Editor/ and standardize canvas panning to middle mouse drag. In tools/Tile Map Editor/, ensure there is a clear `Load Tileset PNG` workflow that lets the user load a PNG tileset, define tile width/height and optional spacing/margin, generate a tile palette/grid, select an active tile, and paint it onto tile layers. Do not modify engine core APIs.

REQUIRED REPORT OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/change_summary.txt
docs/dev/reports/validation_checklist.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_SVG_PAN_BUTTON_REMOVAL_AND_TILESET_PNG_ASSIGNMENT_delta.zip
- Include docs/dev/reports/
- Include only relevant files
