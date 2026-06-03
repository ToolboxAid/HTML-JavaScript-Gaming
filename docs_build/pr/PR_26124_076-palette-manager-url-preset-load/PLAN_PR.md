# PLAN_PR - PR_26124_076-palette-manager-url-preset-load

## Goal
Load a Palette Manager V2 sample preset when the tool opens with a `samplePresetPath` URL parameter.

## Scope
- `tools/palette-manager-v2/main.js`
- `tools/palette-manager-v2/modules/PaletteManagerApp.js`
- `tools/palette-manager-v2/modules/PaletteValidationService.js`
- Required PR workflow docs and review artifacts.

## Boundaries
- Do not modify workspace/toolState behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add fallback/default data.
- Do not add dependencies.
- Do not run the full samples smoke test.

## Implementation Plan
1. Read `URLSearchParams` during Palette Manager V2 startup.
2. When `samplePresetPath` exists, fetch that JSON path.
3. Reject fetch, JSON parse, and schema failures with clear Validation/Error Viewer messages.
4. Reuse the same Palette Manager import validation path used by manual JSON import.
5. Accept direct sample palette documents with top-level `swatches` by normalizing cloned swatches into the active Palette Manager swatch contract without mutating the incoming JSON.
6. Render User Palette, Palette JSON, and validation state from the loaded preset.
7. Preserve manual Import JSON behavior.

## Playwright
- Targeted Palette Manager V2 Playwright validates baseline tool loading and existing palette behaviors.
- Targeted URL preset validation loads sample `0219` through `samplePresetPath` and checks that User Palette and Palette JSON reflect the fetched preset.
- Expected pass behavior: sample preset swatches render in Palette Manager V2 with no runtime errors.
- Expected fail behavior: fetch or validation failure appears in the Validation/Error Viewer and the app does not silently fallback.
- Default requested gate: `npm run test:workspace-v2`

## Manual Validation
1. Open `/tools/palette-manager-v2/index.html?sampleId=0219&sampleTitle=Sprite%20Atlas%20Image%20Rendering&samplePresetPath=/samples/phase-02/0219/sample.0219.palette.json`.
2. Confirm User Palette contains the sample palette swatches.
3. Confirm Palette JSON contains `tools.palette-browser.swatches`.
4. Confirm status indicates the sample preset loaded.
5. Open the same tool with an invalid `samplePresetPath` and confirm a clear validation/error message is shown.
