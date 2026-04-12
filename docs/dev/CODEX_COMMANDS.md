MODEL: GPT-5.3-codex
REASONING: low

COMMAND:
Execute APPLY_PR_TEMPLATES_VECTOR_NATIVE_ACTIVE_RELOCATION_VALIDATE.

Do not make new structural changes in this PR.

Validation steps:
1. Confirm `tools/templates/vector-native-arcade/` exists.
2. Confirm `templates/vector-native-arcade/` does not exist.
3. Confirm `templates/starter-project-template/` still exists and is unchanged.
4. Check these files now use `tools/templates/vector-native-arcade/`:
   - tools/shared/vectorNativeTemplate.js
   - tools/shared/vectorTemplateSampleGame.js
   - tests/tools/VectorNativeTemplate.test.mjs
   - games/vector-arcade-sample/README.md
5. Confirm no file changes under:
   - docs/dev/start_of_day/chatGPT/
   - docs/dev/start_of_day/codex/

Create:
- docs/dev/reports/templates_vector_native_active_relocation_validation.md
- docs/dev/reports/validation_checklist.txt

If inconsistencies are found, report them and do not fix them in this APPLY.

Package output to:
<project folder>/tmp/APPLY_PR_TEMPLATES_VECTOR_NATIVE_ACTIVE_RELOCATION_VALIDATE.zip
