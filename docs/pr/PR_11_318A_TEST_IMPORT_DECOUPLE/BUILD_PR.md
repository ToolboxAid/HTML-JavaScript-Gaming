# BUILD_PR_11_318A

## Implementation
- Added non-test helper module:
  - `tests/helpers/runtimeSceneLoaderHotReload.helpers.mjs`
  - contains full runtime scene loader hot reload validation sequence
- Updated `tests/tools/RuntimeSceneLoaderHotReload.test.mjs`:
  - now imports helper and exports `run()` that executes helper validation
- Updated `tests/final/ToolchainEngineIntegrationValidation.test.mjs`:
  - removed import from `../tools/RuntimeSceneLoaderHotReload.test.mjs`
  - now imports helper function from `../helpers/runtimeSceneLoaderHotReload.helpers.mjs`

## Result
- No `*.test.mjs` file imports another `*.test.mjs`.
- Existing validation behavior is preserved via shared helper execution.

## Validation
- `node --check tests/helpers/runtimeSceneLoaderHotReload.helpers.mjs`
- `node --check tests/tools/RuntimeSceneLoaderHotReload.test.mjs`
- `node --check tests/final/ToolchainEngineIntegrationValidation.test.mjs`
- `node --test tests/final/ToolchainEngineIntegrationValidation.test.mjs`
- `node --test tests/tools/RuntimeSceneLoaderHotReload.test.mjs`
