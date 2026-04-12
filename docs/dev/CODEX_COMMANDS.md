MODEL: GPT-5.3-codex
REASONING: medium

COMMAND:
Execute BUILD_PR_TEMPLATES_VECTOR_NATIVE_ACTIVE_RELOCATION.

Do the work in this PR. Do not ask for clarification.

Required actions:
1. Move:
   templates/vector-native-arcade/
   ->
   tools/templates/vector-native-arcade/
2. Update only these files:
   - tools/shared/vectorNativeTemplate.js
   - tools/shared/vectorTemplateSampleGame.js
   - tests/tools/VectorNativeTemplate.test.mjs
   - games/vector-arcade-sample/README.md
3. Change path references from:
   templates/vector-native-arcade/
   to:
   tools/templates/vector-native-arcade/
4. Do NOT touch:
   - templates/starter-project-template/
   - docs/dev/start_of_day/chatGPT/
   - docs/dev/start_of_day/codex/
   - docs/archive/

Create:
- docs/dev/reports/templates_vector_native_active_relocation_report.md
- docs/dev/reports/validation_checklist.txt

Validation required:
- old vector-native template path no longer referenced in the four target files
- new tools/templates path is referenced in the four target files
- templates/starter-project-template remains untouched
- tools/templates/vector-native-arcade exists
- templates/vector-native-arcade no longer exists
- protected start_of_day directories untouched

Package output to:
<project folder>/tmp/BUILD_PR_TEMPLATES_VECTOR_NATIVE_ACTIVE_RELOCATION.zip
