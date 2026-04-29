# PR 11.76 — Engine Utils to Shared Utils

## Scope Executed
- Moved all files from `src/engine/utils/` into `src/shared/utils/`.
- Removed old `src/engine/utils/index.js`.
- Updated `src/shared/utils/index.js` exports for moved utilities.
- No engine-runtime exceptions were found.

## Files Moved
- `src/engine/utils/fuzzyMatchScore.js` -> `src/shared/utils/fuzzyMatchScore.js`
- `src/engine/utils/geometry.js` -> `src/shared/utils/geometryUtils.js`
- `src/engine/utils/invariant.js` -> `src/shared/utils/invariantUtils.js`
- `src/engine/utils/normalizeCommandText.js` -> `src/shared/utils/normalizeCommandTextUtils.js`

## Files Updated
- `src/shared/utils/index.js`

## Files Removed
- `src/engine/utils/index.js`

## Validation
- Required import scan command:
  - `Select-String -Path .\src\*.js, .\src\**\*.js, .\samples\**\*.js, .\tools\**\*.js -Pattern "src/engine/utils|engine/utils|../engine/utils|../../engine/utils|../../../engine/utils" -ErrorAction SilentlyContinue`
  - Result: no matches
- Required engine utils directory check:
  - `Get-ChildItem .\src\engine\utils -Recurse -File -ErrorAction SilentlyContinue`
  - Result: no files
- Targeted syntax checks:
  - `node --check src/shared/utils/index.js`
  - `node --check src/shared/utils/geometryUtils.js`
  - `node --check src/shared/utils/invariantUtils.js`
  - `node --check src/shared/utils/normalizeCommandTextUtils.js`
  - `node --check src/shared/utils/fuzzyMatchScore.js`
  - Result: all passed

## Acceptance Summary
- `src/engine/utils/*` now contains no files.
- Moved utilities are under `src/shared/utils/*`.
- No active imports remain in `src/`, `samples/`, or `tools/` for `engine/utils` paths.
