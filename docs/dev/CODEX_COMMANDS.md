MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_SVG_BACKGROUND_EDITOR_PALETTE_AND_ENABLEMENT_RULES as an implementation delta. Update tools/SVG Background Editor/ so Paint and Stroke use the existing palette select-and-draw workflow. Active Paint and Stroke values must be stored in editor state and remain locked/unchanged after selection until the user intentionally changes them. Most editing functionality must remain disabled until the required selection exists, except startup/file actions such as New, Load, and Load Sample. Add a used-color swatch strip above the main palette that shows colors already used in the current document for fast re-selection. Do not modify engine core APIs.

REQUIRED REPORT OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/change_summary.txt
docs/dev/reports/validation_checklist.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_SVG_BACKGROUND_EDITOR_PALETTE_AND_ENABLEMENT_RULES_delta.zip
- Include docs/dev/reports/
- Include only relevant files
