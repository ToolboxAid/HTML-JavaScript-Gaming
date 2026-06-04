# PR_11_318A Report

## Purpose
Fix test runner coupling by removing test-to-test imports and moving shared Runtime Scene Loader hot reload validation logic into a non-test helper module.

## Files Changed
- `tests/helpers/runtimeSceneLoaderHotReload.helpers.mjs`
- `tests/tools/RuntimeSceneLoaderHotReload.test.mjs`
- `tests/final/ToolchainEngineIntegrationValidation.test.mjs`
- `archive/v1-v2/docs_build/pr/PR_11_318A_TEST_IMPORT_DECOUPLE/PLAN_PR.md`
- `archive/v1-v2/docs_build/pr/PR_11_318A_TEST_IMPORT_DECOUPLE/BUILD_PR.md`
- `docs_build/dev/reports/PR_11_318A_report.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`

## Implementation Summary
- Extracted shared hot reload validation logic into:
  - `tests/helpers/runtimeSceneLoaderHotReload.helpers.mjs`
- Updated tool test to consume helper:
  - `tests/tools/RuntimeSceneLoaderHotReload.test.mjs` now calls helper `runRuntimeSceneLoaderHotReloadValidation()`
- Updated final integration test to avoid importing `*.test.mjs` directly:
  - removed direct `../toolbox/*.test.mjs` imports
  - runs scoped stage tests via child `node --test` execution
  - keeps runtime scene loader stage via helper import

## Validation Commands
- `node --check tests/helpers/runtimeSceneLoaderHotReload.helpers.mjs` -> **PASS**
- `node --check tests/tools/RuntimeSceneLoaderHotReload.test.mjs` -> **PASS**
- `node --check tests/final/ToolchainEngineIntegrationValidation.test.mjs` -> **PASS**
- `node --test tests/final/ToolchainEngineIntegrationValidation.test.mjs` -> **PASS**
- `node --test tests/tools/RuntimeSceneLoaderHotReload.test.mjs` -> **PASS**

## Extra Verification
- `rg -n "from .*\\.test\\.mjs" tests/final/ToolchainEngineIntegrationValidation.test.mjs tests/tools/RuntimeSceneLoaderHotReload.test.mjs tests/helpers/runtimeSceneLoaderHotReload.helpers.mjs` -> **PASS** (no matches)
