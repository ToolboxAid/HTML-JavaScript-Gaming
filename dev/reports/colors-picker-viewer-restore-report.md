# PR_26159_031 Colors Picker Viewer Restore Report

## Executive Summary

Status: PASS
Playwright impacted: Yes
Full samples validation: Skipped, not impacted.

Colors Picker Preview now renders available picker swatches first and already-in-project picker swatches in a separate bottom section. ROYGBIV was added as a curated Defined Swatch Selector source, and active Colors Symbol validation remains removed.

## Root Cause: Unavailable Picker Swatches

Some picker swatches are unavailable because their normalized RGB value already exists in Project Swatches. The exact rule is `pinnedSwatchForHex(hex)`: compare the generated picker swatch hex against Project Swatches using the first seven normalized hex characters, ignoring alpha.

Unavailable swatches are not unavailable because of contrast/filter rules, missing metadata, or generic disabled picker state. They are RGB duplicates of an existing Project Swatches color.

This PR places available swatches in the top `Available Picker Swatches` section and places duplicates in the bottom `Already in Project` section. The unavailable section preserves the real color, does not use disabled buttons, does not change opacity, and click attempts do not add duplicates. The override checkbox is now named `Include already in Project swatches` and only affects that already-in-project subset.

## Root Cause: Symbol Regression

The returned `Symbol: Enter a symbol for this swatch.` error came from older/stale Colors validation paths where swatches required a one-character symbol. The current active Colors flow is key/hex/name based. Active Colors source no longer has Symbol fields, Symbol validation, or `data-palette-symbol` controls.

This PR also corrected the browser API helper for `validatePaletteSwatchInput` so it forwards the same input, existing-swatches, and options contract used by the server-side palette validation. Add, Update, picker selection, Project Swatches, and `tools.palette-browser.swatches` all operate without Symbol input.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `PROJECT_INSTRUCTIONS.md` first | PASS | Read before implementation. |
| Inspect PR_26159_025 behavior/history | PASS | Inspected commit `1ad83b4c2` and current picker render code. |
| Available picker swatches grouped at top | PASS | Playwright validates `Available Picker Swatches` top group and counts. |
| Unavailable picker swatches grouped at bottom | PASS | Playwright validates `Already in Project` bottom group and counts. |
| Preserve subset unavailable behavior | PASS | Unavailable subset is only RGB duplicates already in Project Swatches. |
| Keep newer Defined Swatch Selector controls/options | PASS | Existing Theme Collection, Palette Type, Variant controls and curated options remain; Playwright iterates all expected collections/types. |
| Add ROYGBIV curated selector option | PASS | Added ROYGBIV collection/type with Red, Orange, Yellow, Green, Blue, Indigo, Violet base swatches; Playwright validates generated names. |
| Report why swatches are unavailable | PASS | Root-cause section above. |
| Report exact bottom-section rule | PASS | `pinnedSwatchForHex(hex)` normalized RGB match against Project Swatches. |
| Do not gray out unavailable swatches | PASS | Unavailable swatches do not use disabled button opacity; Playwright validates opacity remains `1`. |
| Remove red not-allowed cursor behavior | PASS | Unavailable swatches are not disabled and Playwright validates cursor is not `not-allowed`. |
| Unavailable swatches preserve true color | PASS | Playwright validates unavailable color input value matches the generated hex. |
| Unavailable swatches do not add on click | PASS | Playwright clicks unavailable swatch and verifies Project Swatches count stays unchanged. |
| Available swatches add on click | PASS | Playwright clicks available picker swatches and verifies Project Swatches count increases. |
| Remove global enable/disable checkbox behavior | PASS | Old global picker checkbox strings are absent; remaining checkbox only affects already-in-project swatches. |
| Fix Symbol validation error | PASS | Active Symbol validation scan is clean; Add/Update Playwright passes without Symbol field. |
| `tools.palette-browser.swatches` accepts swatches without Symbol | PASS | Repository and UI tests add swatches using key/hex/name payloads with no Symbol input. |
| Validate no console errors | PASS | Palette Playwright captures page errors/console errors and passed. |
| Do not run full samples validation | PASS | Full samples skipped; no sample JSON or shared sample loader changed. |

## Validation Evidence

- `node --check toolbox/colors/colors.js` - PASS
- `node --check toolbox/colors/palette-api-client.js` - PASS
- `node --check tests/playwright/tools/PaletteToolMockRepository.spec.mjs` - PASS
- `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs` - PASS, 6 passed
- `git diff --check` - PASS with line-ending warnings only
- Active `rg` scan for Symbol validation/control strings - PASS, no matches
- Active `rg` scan for old global picker checkbox strings - PASS, no matches

## Skipped Lanes

- Full samples validation: skipped because this PR only changes the Colors tool runtime/test path and does not change sample JSON, sample launcher code, or shared sample framework behavior.
- Broad Playwright suite: skipped because targeted Palette Playwright validates the affected picker viewer, Add/Update, validation, and console-error behavior.

## Artifacts

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `tmp/PR_26159_031-colors-picker-viewer-restore_delta.zip`
