# PR_26159_028-colors-symbol-cleanup-preview-accordion

## Executive Summary

PASS. The active Colors workflow no longer uses Symbol fields, validation, metadata, render output, or test assertions. Project swatches now use key/swatchKey ownership consistently across the Colors repository, active palette mock DB tables, Asset color handoff, DB Viewer relationship diagnostics, and the active palette browser schema.

The picker preview is now inside a Theme V2 vertical accordion while Project Swatches and Picker Swatches accordions remain intact.

Unrelated working-tree note: `docs_build/dev/admin-notes/index.txt` and `docs_build/dev/admin-notes/fonts/` were already dirty during closeout and are intentionally excluded from this PR package.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Read before implementation. |
| Use PR_26159_027 as base context | PASS | Preserved Project Swatches, Picker Swatches, tag typeahead/filtering, metadata retention, and toolbox visibility behavior in `toolbox/colors/index.html` and `toolbox/colors/colors.js`. |
| Fix validation error `Symbol: Enter a symbol for this swatch.` | PASS | `toolbox/colors/colors.js` invalid query fixture now validates Hex/Name only; Palette Playwright invalid-payload test passes. |
| Remove Symbol form field, validation, required rules, metadata, render/output, tests/assertions, and supporting active Colors code | PASS | Focused active scan returned no matches for `symbol`, `Symbol`, `swatchSymbol`, `data-palette-symbol`, `requireSymbol`, and related terms across active Colors/Palette/Asset/DB Viewer files. |
| Deep cleanup active repo Colors-related Symbol usage | PASS | Updated active palette repository, palette source seed, mock DB schema, server invalid fixture, Asset color handoff, DB Viewer diagnostics, shared palette handoff/document contract, and palette browser schema. Remaining broader hits are legacy engine palette internals, archived/historical docs, or Palette Manager V2 references outside active Colors behavior. |
| Do not modify deprecated archive/v1-v2 or start_of_day | PASS | No archive/start_of_day files changed. |
| Add works without Symbol | PASS | `PaletteToolMockRepository.spec.mjs` Add flow passed. |
| Update works without Symbol | PASS | `PaletteToolMockRepository.spec.mjs` Update flow passed. |
| Clear works without Symbol | PASS | `PaletteToolMockRepository.spec.mjs` Clear flow passed. |
| Move `palette-generator-preview` into an accordion | PASS | `toolbox/colors/index.html` adds `data-palette-preview-accordion` using `vertical-accordion accordion-fill-panel`. |
| Preview accordion uses same Theme V2 pattern as Project Swatches and Picker Swatches | PASS | All three use Theme V2 `details.vertical-accordion.accordion-fill-panel`; Playwright validates preview is inside the preview accordion. |
| Preserve Project Swatches accordion | PASS | Palette Playwright validates Project Swatches accordion remains visible and usable. |
| Preserve Picker Swatches accordion | PASS | Palette Playwright validates Picker Swatches accordion remains visible and usable. |
| Preserve tag typeahead | PASS | Palette Playwright validates suggested tag typeahead and accepted tags. |
| Preserve tag checkbox filtering, Any selected tag / All selected tags, and Clear Filters | PASS | Palette Playwright validates tag checkbox filtering, multi-tag modes, and Clear Filters. |
| Preserve swatch metadata retention | PASS | Picker selection/pin tests validate restoreable picker settings and metadata-backed tooltips. |
| Preserve hover tooltip showing only Name, Hex, Theme, Palette Type | PASS | Tooltip rendering remains in `swatchTooltipText()` / `pickerTooltipText()` and Palette Playwright validates tooltip content. |
| Preserve Admin unfiltered toolbox list and non-admin filtered list | PASS | `ToolboxRoutePages.spec.mjs` passed. |
| No console errors | PASS | Playwright `expectNoPageFailures` assertions passed in targeted Palette/Asset/Toolbox/Admin DB Viewer lanes. |
| Playwright impacted | PASS | Targeted Playwright lanes executed. |
| Do not run full samples validation | PASS | Full samples validation skipped by request; changed surfaces were covered by targeted tool/page/static lanes. |

## Validation Evidence

| Lane | Result |
| --- | --- |
| Changed-file syntax checks | PASS: `node --check` passed for changed JS/test files. |
| Active Symbol cleanup scan | PASS: focused `rg` scan returned no active Colors/Palette/Asset/DB Viewer Symbol hits. |
| Palette Tool runtime/UI lane | PASS: `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs --timeout=180000 --trace=off --output=tmp/test-results/colors-pr028` -> 6 passed. |
| Toolbox route/admin visibility lane | PASS: `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --timeout=180000 --trace=off --output=tmp/test-results/toolbox-pr028` -> 2 passed. |
| Asset Tool color handoff lane | PASS: `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --timeout=180000 --trace=off --output=tmp/test-results/assets-pr028` -> 6 passed. |
| Admin DB Viewer relationship lane | PASS: `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --timeout=180000` -> 7 passed. |
| Shared palette handoff probe | PASS: direct Node probe confirmed key-based `createPaletteHandoff()` output. |
| Palette browser schema parse | PASS: direct JSON parse of `src/shared/schemas/tools/palette-browser.schema.json`. |
| `git diff --check` | PASS with line-ending warnings only. |

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | Explicitly skipped by PR request; no shared sample loader/framework was changed. |
| Full historical Node test runner | Not required for this Colors PR. A direct run of older shared tests is currently blocked by pre-existing legacy expectations/server-backed registry behavior, so this PR used targeted schema and handoff probes plus affected Playwright lanes instead. |

## Notes

- `docs_build/dev/admin-notes/index.txt` and `docs_build/dev/admin-notes/fonts/` are dirty in the working tree but unrelated to this Colors PR and not included in the ZIP artifact.
- An earlier Palette full-lane attempt hit Playwright artifact collection errors; the same lane then passed cleanly with a separate output directory and trace disabled.
