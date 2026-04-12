MODEL: GPT-5.3-codex
REASONING: medium

COMMAND:
Execute BUILD_PR_STARTER_PROJECT_TEMPLATE_MOVE_TOOLS.

Do the work in this PR. Do not ask for clarification.

Required actions:
1. Move:
   templates/starter-project-template/
   ->
   tools/templates/starter-project-template/
2. Update only exact references that must change for correctness after the move.
3. Do NOT touch:
   - tools/templates/vector-native-arcade/
   - docs/dev/start_of_day/chatGPT/
   - docs/dev/start_of_day/codex/
   - docs/archive/

Create:
- docs/dev/reports/starter_project_template_move_report.md
- docs/dev/reports/validation_checklist.txt

Validation required:
- new tools/templates starter-project-template path exists
- old templates/starter-project-template path no longer exists
- vector-native template location remains untouched
- protected start_of_day directories untouched

Package output to:
<project folder>/tmp/BUILD_PR_STARTER_PROJECT_TEMPLATE_MOVE_TOOLS.zip
