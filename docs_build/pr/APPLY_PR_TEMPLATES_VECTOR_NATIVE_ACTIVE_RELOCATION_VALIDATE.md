# APPLY_PR_TEMPLATES_VECTOR_NATIVE_ACTIVE_RELOCATION_VALIDATE

## Purpose
Validate and lock the completed active relocation of `vector-native-arcade` from `templates/` to `toolbox/templates/`.

## Scope
Verification-only APPLY.
No new structural move in this PR.

## Inputs Already Observed
- `toolbox/templates/vector-native-arcade/` exists
- `templates/starter-project-template/` still exists
- remaining `templates/` references are expected in archived docs/history, roadmap/docs metadata, and starter-project-template files
- active relocation report already exists

## Required Work
1. Verify `toolbox/templates/vector-native-arcade/` exists.
2. Verify `templates/vector-native-arcade/` no longer exists.
3. Verify `templates/starter-project-template/` remains untouched.
4. Verify the four known blocker files now reference `toolbox/templates/vector-native-arcade/`.
5. Verify no protected start_of_day directories were changed.
6. Create:
   - `docs/reference/features/docs-system/move-history-preserved.md`
   - `docs_build/reports/validation_checklist.txt`

## Validation Targets
- `toolbox/shared/vectorNativeTemplate.js`
- `toolbox/shared/vectorTemplateSampleGame.js`
- `tests/tools/VectorNativeTemplate.test.mjs`
- `games/vector-arcade-sample/README.md`

## Expected Output
Package output to:
- `<project folder>/tmp/APPLY_PR_TEMPLATES_VECTOR_NATIVE_ACTIVE_RELOCATION_VALIDATE.zip`
