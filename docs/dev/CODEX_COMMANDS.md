MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_TOOL_THEME_AND_SHARED_SWATCH_WORKFLOW as an implementation delta. Ensure all tools use the shared theme system. In tools/SVG Background Editor/, make palette selection explicit: the user selects Active Paint or Active Stroke, then chooses a palette color or used-color swatch, and that value remains stored until intentionally changed. Add the used-color swatch strip concept above the palette in the Sprite Editor as well, with behavior aligned to the SVG Background Editor. Do not modify engine core APIs.

REQUIRED REPORT OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/change_summary.txt
docs/dev/reports/validation_checklist.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_TOOL_THEME_AND_SHARED_SWATCH_WORKFLOW_delta.zip
- Include docs/dev/reports/
- Include only relevant files
