MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_EDITOR_FIXES_AND_WORKFLOW_UPDATES as an implementation delta. In tools/SVG Background Editor/, fix the bounded-box/selection-box placement bug so lines and other bounded objects align correctly with their visible geometry and selection handles. Add a Palette dropdown to the SVG editor while keeping Active Paint and Active Stroke stored and unchanged until intentionally changed. In the Sprite Editor, compute the used-color swatch strip from all frames in the current sprite/document, not just the active frame. In tools/Tile Map Editor/, support loading multiple individual PNG tile assets as well as sliced tileset PNGs, with imported PNGs appearing as selectable tile entries. Do not modify engine core APIs.

REQUIRED REPORT OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/change_summary.txt
docs/dev/reports/validation_checklist.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_EDITOR_FIXES_AND_WORKFLOW_UPDATES_delta.zip
- Include docs/dev/reports/
- Include only relevant files
