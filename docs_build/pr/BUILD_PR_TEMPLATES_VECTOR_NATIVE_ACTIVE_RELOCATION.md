# BUILD_PR_TEMPLATES_VECTOR_NATIVE_ACTIVE_RELOCATION

## PR Purpose
Execute one narrow active-relocation lane for `vector-native-arcade` template references.

## Scope
This PR is single-purpose:
- relocate the active `vector-native-arcade` template surface from `templates/vector-native-arcade/`
- to `toolbox/templates/vector-native-arcade/`
- update only the exact known blocker files
- do not archive anything
- do not touch `starter-project-template`

## Exact Target Files
### Must modify
- `toolbox/shared/vectorNativeTemplate.js`
- `toolbox/shared/vectorTemplateSampleGame.js`
- `tests/tools/VectorNativeTemplate.test.mjs`
- `games/vector-arcade-sample/README.md`

### Must move if source exists
- `templates/vector-native-arcade/`
- to `toolbox/templates/vector-native-arcade/`

### Must create or overwrite
- `docs/reference/features/docs-system/move-history-preserved.md`
- `docs_build/reports/validation_checklist.txt`

## Required Work
1. Move `templates/vector-native-arcade/` to `toolbox/templates/vector-native-arcade/`.
2. Update the four exact blocker files to use `toolbox/templates/vector-native-arcade/`.
3. Leave `templates/starter-project-template/` untouched.
4. Do not move `templates/` to archive.
5. Do not touch unrelated cleanup targets.
6. Do not change anything under:
   - `docs_build/dev/start_of_day/chatGPT/`
   - `docs_build/dev/start_of_day/codex/`

## Validation
- no references remain to `templates/vector-native-arcade/` in the four target files
- references now point to `toolbox/templates/vector-native-arcade/`
- `templates/starter-project-template/` still exists and is unchanged
- `toolbox/templates/vector-native-arcade/` exists
- `templates/vector-native-arcade/` no longer exists
- protected start_of_day directories untouched

## Expected Output
Package output to:
- `<project folder>/tmp/BUILD_PR_TEMPLATES_VECTOR_NATIVE_ACTIVE_RELOCATION.zip`
