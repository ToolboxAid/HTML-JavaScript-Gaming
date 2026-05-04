# BUILD_PR - PR_26124_076-palette-manager-url-preset-load

## Purpose
Add one scoped Palette Manager V2 startup path that loads and validates sample palette JSON from the `samplePresetPath` URL parameter.

## Scope
- `tools/palette-manager-v2/main.js`
- `tools/palette-manager-v2/modules/PaletteManagerApp.js`
- `tools/palette-manager-v2/modules/PaletteValidationService.js`
- Required PR workflow docs and review artifacts.

## Implementation
1. Add startup URL parameter handling in `main.js`.
2. If `samplePresetPath` is absent, preserve current startup behavior.
3. If `samplePresetPath` is present:
   - fetch the JSON path,
   - reject failed fetches with a visible validation/error message,
   - reject invalid JSON with a visible validation/error message,
   - pass parsed JSON to `PaletteManagerApp.importPaletteDocument`.
4. Extend `PaletteValidationService.extractImportedPaletteDocument` so it still accepts wrapped `tools.palette-browser` import JSON and also accepts direct sample palette documents with top-level `swatches`.
5. For direct sample palette documents, clone swatches and populate missing `source` from direct palette metadata before validation; do not mutate the incoming JSON object.
6. Add optional status text parameters to import/reject methods only where needed for startup preset messages.
7. Preserve manual Import JSON behavior and existing export shape.

## Boundaries
- Do not modify workspace/toolState behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add fallback/default data.
- Do not add dependencies.
- Do not modify Palette Manager CSS or layout.
- Do not run the full samples smoke test.

## Validation
- Syntax check changed JavaScript files.
- Run targeted Palette Manager V2 Playwright baseline test if present.
- Run targeted URL preset load validation for sample `0219`.
- Run `npm run test:workspace-v2`.
- Run `git diff --check`.
- Skip the full samples smoke test.
