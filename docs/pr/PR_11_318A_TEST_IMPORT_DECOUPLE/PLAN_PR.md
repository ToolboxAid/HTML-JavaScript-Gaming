# PLAN_PR_11_318A

## Purpose
Remove test-to-test import coupling by moving shared Runtime Scene Loader hot reload validation logic into a non-test helper module.

## Scope
- `tests/helpers/runtimeSceneLoaderHotReload.helpers.mjs`
- `tests/tools/RuntimeSceneLoaderHotReload.test.mjs`
- `tests/final/ToolchainEngineIntegrationValidation.test.mjs`
- `docs/dev/reports/PR_11_318A_report.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`

## Steps
1. Extract shared runtime scene loader hot reload validation logic to `tests/helpers/runtimeSceneLoaderHotReload.helpers.mjs`.
2. Update `tests/tools/RuntimeSceneLoaderHotReload.test.mjs` to call helper run function.
3. Update `tests/final/ToolchainEngineIntegrationValidation.test.mjs` to import helper run function instead of importing another `*.test.mjs`.
4. Run targeted syntax + targeted tests only.
