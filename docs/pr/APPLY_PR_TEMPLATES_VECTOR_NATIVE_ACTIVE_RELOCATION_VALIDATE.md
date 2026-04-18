# APPLY_PR_TEMPLATES_VECTOR_NATIVE_ACTIVE_RELOCATION_VALIDATE

## Purpose
Validate and lock the completed active relocation of `vector-native-arcade` from `templates/` to `tools/templates/`.

## Scope
Verification-only APPLY.
No new structural move in this PR.

## Inputs Already Observed
- `tools/templates/vector-native-arcade/` exists
- `templates/starter-project-template/` still exists
- remaining `templates/` references are expected in archived docs/history, roadmap/docs metadata, and starter-project-template files
- active relocation report already exists

## Required Work
1. Verify `tools/templates/vector-native-arcade/` exists.
2. Verify `templates/vector-native-arcade/` no longer exists.
3. Verify `templates/starter-project-template/` remains untouched.
4. Verify the four known blocker files now reference `tools/templates/vector-native-arcade/`.
5. Verify no protected start_of_day directories were changed.
6. Create:
   - `docs/reports/templates_vector_native_active_relocation_validation.md`
   - `docs/reports/validation_checklist.txt`

## Validation Targets
- `tools/shared/vectorNativeTemplate.js`
- `tools/shared/vectorTemplateSampleGame.js`
- `tests/tools/VectorNativeTemplate.test.mjs`
- `games/vector-arcade-sample/README.md`

## Expected Output
Package output to:
- `<project folder>/tmp/APPLY_PR_TEMPLATES_VECTOR_NATIVE_ACTIVE_RELOCATION_VALIDATE.zip`
