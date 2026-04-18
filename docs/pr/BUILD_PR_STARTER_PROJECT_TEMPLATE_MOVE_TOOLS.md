# BUILD_PR_STARTER_PROJECT_TEMPLATE_MOVE_TOOLS

## PR Purpose
Execute one narrow active-relocation lane for `starter-project-template`.

## Scope
This PR is single-purpose:
- move `templates/starter-project-template/`
- to `tools/templates/starter-project-template/`
- update only exact references if any are required for correctness
- do not archive anything
- do not touch `tools/templates/vector-native-arcade/`

## Exact Target Paths
### Must move if source exists
- `templates/starter-project-template/`
- to `tools/templates/starter-project-template/`

### Must create or overwrite
- `docs/reference/features/docs-system/move-history-preserved.md`
- `docs/reports/validation_checklist.txt`

### May modify only if required for correctness
- direct references to `templates/starter-project-template/`

## Required Work
1. Move `templates/starter-project-template/` to `tools/templates/starter-project-template/`.
2. Update only exact references that must change for correctness after the move.
3. Leave `tools/templates/vector-native-arcade/` untouched.
4. Do not archive anything.
5. Do not touch unrelated cleanup targets.
6. Do not change anything under:
   - `docs/dev/start_of_day/chatGPT/`
   - `docs/dev/start_of_day/codex/`

## Validation
- `tools/templates/starter-project-template/` exists
- `templates/starter-project-template/` no longer exists
- `tools/templates/vector-native-arcade/` remains untouched
- any required references now point to `tools/templates/starter-project-template/`
- protected start_of_day directories untouched

## Expected Output
Package output to:
- `<project folder>/tmp/BUILD_PR_STARTER_PROJECT_TEMPLATE_MOVE_TOOLS.zip`
