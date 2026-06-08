# PR_26159_032-colors-symbol-grid-fix Report

Playwright impacted: Yes

## Summary

Fixed the Colors picker grid so available and unavailable picker sections preserve the generated column count when swatches move between sections. Added regression coverage proving active `tools.palette-browser.swatches` validation and Colors add/remove/pin/unpin/update/clear flows work without Symbol.

## Root Cause: Symbol

Active `tools.palette-browser.swatches` validation is owned by `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js` through `validatePaletteWorkspacePayload()` and `validatePaletteSwatchInput()`. That path requires `key`, `hex`, and `name`; it does not require Symbol. The blocking regression was not covered by a direct no-Symbol payload/lifecycle assertion, so stale or adjacent validation could reappear unnoticed.

Exact fixed file:
- `tests/playwright/tools/PaletteToolMockRepository.spec.mjs`

Evidence:
- Added direct `validatePaletteWorkspacePayload()` coverage for a `tools.palette-browser.swatches` payload with no Symbol field.
- Added repository lifecycle coverage for add, update, remove, pin, unpin, and clear with no Symbol field.
- Active Symbol scan found no active Colors `Symbol: Enter a symbol`, `data-palette-symbol`, `requireSymbol`, `swatchSymbol`, or `paletteSwatchSymbol` requirement. The only remaining hit is `tests/tools/PaletteManagerV2Baseline.test.mjs`, which is a separate Palette Manager V2 baseline test and not active Colors `palette-browser` validation.

## Root Cause: Picker Grid

`appendPickerGroupRows()` previously rendered rows from filtered group arrays. When one generated swatch moved from Available to Already in Project, that cell disappeared from the Available row, so rows could collapse below the selected Colors column count.

Exact fixed file:
- `toolbox/colors/colors.js`

Fix:
- `appendPickerGroupRows()` now receives the full generated swatch set, filters per section for counts, and inserts placeholder cells for positions owned by the other section.
- Available and unavailable rows now keep `settings.colors` cells per rendered row.
- Unavailable swatches remain true color, are not disabled, do not use a not-allowed cursor, and still block add-clicks through the existing availability guard.

## Requirement Checklist

| Requirement | Status | Evidence |
|---|---|---|
| Remove remaining active Symbol requirement from `tools.palette-browser.swatches` validation | PASS | `validatePaletteWorkspacePayload()` no-Symbol assertion in `tests/playwright/tools/PaletteToolMockRepository.spec.mjs`; targeted Symbol scan |
| Add works without Symbol | PASS | Playwright `Palette Tool adds, updates, validates, and shows project-owned swatches` |
| Remove works without Symbol | PASS | Repository lifecycle assertion for `removeSwatch()` |
| Pin works without Symbol | PASS | Repository lifecycle assertion for `pinSourceSwatch()` and Playwright picker add |
| Unpin works without Symbol | PASS | Repository lifecycle assertion removing a pinned source swatch |
| Update works without Symbol | PASS | Playwright update flow and repository `updateSelectedSwatch()` assertion |
| Clear works without Symbol | PASS | Playwright Clear control and repository `clearProjectData()` assertion |
| Search active source/schemas/validators/fixtures for Symbol | PASS | `rg` scan; only out-of-scope Palette Manager V2 baseline hit remains |
| Colors = 8 renders exactly 8 columns per picker row | PASS | New Playwright test `Palette Tool preserves eight-column picker rows when swatches are unavailable` |
| Missing/unavailable/already-in-project swatches do not collapse grid | PASS | Placeholder cells in `toolbox/colors/colors.js`; Playwright row child-count assertions |
| Available and unavailable sections preserve column count | PASS | Playwright asserts 8-column and 16-column available/unavailable rows |
| Unavailable swatches keep true color and occupy cells | PASS | Playwright opacity/value assertions |
| No red dot/not-allowed cursor for unavailable swatches | PASS | Playwright cursor assertions |
| Unavailable swatches do not add when clicked | PASS | Playwright count remains unchanged and log reports not added |
| Available swatches add when clicked | PASS | Playwright count increases after available picker click |
| Preserve PR025 available top/unavailable bottom viewer | PASS | Existing Available/Already in Project labels and sections preserved |
| Preserve current controls/options and ROYGBIV | PASS | Existing selector/ROYGBIV Playwright assertions still pass |
| Preserve Project Swatches and Picker Swatches accordions | PASS | Existing accordion assertions still pass |
| No console errors | PASS | `expectNoPageFailures()` across targeted Colors Playwright lane |

## Validation

| Lane | Status | Evidence |
|---|---|---|
| Changed JS syntax | PASS | `node --check toolbox/colors/colors.js`; `node --check tests/playwright/tools/PaletteToolMockRepository.spec.mjs` |
| Targeted Colors Playwright | PASS | `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs` -> 7 passed |
| Changed-file static validation | PASS | `git diff --check -- toolbox/colors/colors.js tests/playwright/tools/PaletteToolMockRepository.spec.mjs` |
| Active Symbol scan | PASS | No active Colors Symbol requirement found; out-of-scope Palette Manager V2 baseline hit documented |

## Skipped Lanes

Full samples validation was skipped because this PR only changes the Colors tool runtime and its targeted Playwright coverage. No sample loader, shared sample framework, or production game sample path changed.

Full repo Playwright was skipped because the impacted lane is the Colors/Palette Tool lane and no shared Theme V2, server API, DB adapter, or cross-tool integration behavior changed.

## Artifacts

- Review diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- ZIP: `tmp/PR_26159_032-colors-symbol-grid-fix_delta.zip`
