MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_SVG_BACKGROUND_EDITOR_FOUNDATION as an implementation delta. Build a separate tool at tools/SVG Background Editor/ for authoring SVG background art. Support creating/loading/saving SVG files, local samples, shape tools (rectangle, ellipse/circle, line, polyline/path), fill and stroke editing, element selection, move/resize, element list, and canvas zoom/pan. Keep it focused on background art authoring only, store samples under tools/SVG Background Editor/samples/, and do not modify engine core APIs.

REQUIRED REPORT OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/change_summary.txt
docs/dev/reports/validation_checklist.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_SVG_BACKGROUND_EDITOR_FOUNDATION_delta.zip
- Include docs/dev/reports/
- Include only relevant files
