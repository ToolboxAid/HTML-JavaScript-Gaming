# APPLY_PR - PR_26124_076-palette-manager-url-preset-load

## Summary
Palette Manager V2 now loads sample palette JSON from a `samplePresetPath` URL parameter during startup.

## Applied Changes
- Added startup URL parameter handling in `toolbox/palette-manager-v2/main.js`.
- Fetches `samplePresetPath` when present and reports visible fetch/JSON failures.
- Reuses `PaletteManagerApp.importPaletteDocument` for URL-loaded preset JSON.
- Extended `PaletteValidationService.extractImportedPaletteDocument` to accept:
  - existing wrapped `tools.palette-browser` import/export JSON,
  - direct sample palette documents with top-level `swatches`.
- Direct sample palette swatches are cloned and given missing `source` from palette metadata before validation.
- Manual Import JSON behavior remains unchanged.

## Runtime/Data Result
- Launching Palette Manager V2 with sample `0219` URL parameters loads `sample.0219.palette.json` into active Palette Manager V2 memory.
- User Palette renders the loaded sample swatches.
- Palette JSON renders the loaded swatches under `tools.palette-browser`.
- Incoming sample JSON is not mutated.
- Failed fetch or schema validation shows a clear Validation/Error Viewer message and does not silently fallback.

## Validation
- PASS: `node --check toolbox/palette-manager-v2/main.js`
- PASS: `node --check toolbox/palette-manager-v2/modules/PaletteManagerApp.js`
- PASS: `node --check toolbox/palette-manager-v2/modules/PaletteValidationService.js`
- PASS: `node tests/tools/PaletteManagerV2Baseline.test.mjs`
- PASS: targeted Palette Manager V2 URL preset validation for sample `0219`
- PASS: targeted invalid `samplePresetPath` validation shows fetch failure
- PASS: `git diff --check`
- FAIL: `npm run test:workspace-v2` is unavailable because `package.json` does not define a `test:workspace-v2` script.
- SKIPPED: full samples smoke test, by instruction.

## Manual Test
1. Open `/toolbox/palette-manager-v2/index.html?sampleId=0219&sampleTitle=Sprite%20Atlas%20Image%20Rendering&samplePresetPath=/samples/phase-02/0219/sample.0219.palette.json`.
2. Confirm User Palette contains six sample swatches.
3. Confirm Palette JSON shows `tools.palette-browser.swatches`.
4. Confirm status says the sample preset loaded.
5. Open `/toolbox/palette-manager-v2/index.html?samplePresetPath=/samples/missing-palette.json`.
6. Confirm Validation/Error Viewer shows a sample preset fetch failure.
