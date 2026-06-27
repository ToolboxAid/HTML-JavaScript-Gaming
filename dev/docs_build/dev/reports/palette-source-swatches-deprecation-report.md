# PR_26160_076 Palette Source Swatches Deprecation Report

Generated: 2026-06-09

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch is `main` | PASS | `git branch --show-current` returned `main`. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Implement PR_26160_075 recommendation: DEPRECATE `palette_source_swatches` | PASS | `src/engine/api/mock-db-viewer-ui.js` labels `palette_source_swatches` as deprecated and shows a visible deprecation note. |
| Remove/replace dead source-browser code paths reading `palette_source_swatches` | PASS | `toolbox/colors/colors.js` no longer creates source-mode repositories or binds source select/search/pin/sort/size handlers; `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js` removed source row normalization, source options, source list, source pin-all, and source table output. |
| Remove/replace dead source-harmony code paths implying source table affects current harmony output | PASS | Harmony labels changed to Current/All Picker closest match, and `harmonyForSwatch()` now matches only supplied picker swatches when not calculated. No source table palette fallback remains. |
| Ensure Colors grid rendering does not depend on `palette_source_swatches` | PASS | Targeted Colors Playwright passed; runtime trace rendered 24 picker swatches with no source controls or source table count. |
| Ensure Colors editing does not depend on `palette_source_swatches` | PASS | Targeted Colors Playwright passed Add/Update/Remove/Pin flows; runtime trace added `Trace Blue`. |
| Ensure Colors save/load does not depend on `palette_source_swatches` | PASS | Targeted Colors Playwright covers reload behavior; runtime trace reloaded and found `Trace Blue` persisted. |
| Ensure Colors import/export does not depend on `palette_source_swatches` | PASS | Runtime trace verified import/export UI text is absent from the current Colors page; no active import/export source-table path remains. |
| Remove active Colors runtime reads if safe | PASS | Repository `getSnapshot()` no longer exposes `sourcePaletteOptions`/`sourcePaletteRecordCount`; `getTables()` no longer returns `palette_source_swatches`; Colors Repository Tables now show Project Swatches, Swatch Usage, and Project Swatch Settings only. |
| Keep table only for migration/history if needed | PASS | Server DB snapshot still includes seeded `palette_source_swatches` rows for DB Viewer history/reference via `paletteTables()` in `src/dev-runtime/server/mock-api-router.mjs`. |
| Mark deprecated table in DB Viewer/reporting | PASS | DB Viewer summary displays `palette_source_swatches (deprecated)` and a visible note: current Colors grid rendering, editing, save/load, and import/export do not read this table. |
| Do not migrate unrelated Toolbox/Admin data | PASS | Changes are scoped to Colors repository/runtime, DB Viewer labeling, targeted tests, and reports. |
| Do not use inline script/style/event handlers | PASS | No HTML inline script/style/event handlers were added; `git diff` shows external JS/HTML option text/test/report edits only. |

## Deprecation Evidence

- Active Colors repository tables now exclude `palette_source_swatches`.
- Active Colors runtime no longer has source select/search/pin-all controls.
- Active Colors runtime no longer accepts `?source=empty` / `?source=invalid` source-browser test modes.
- Harmony source wording now refers to picker swatches, not source palettes.
- DB Viewer still shows 838 deprecated source history rows under Palette, with an explicit visible deprecation note.

## Before/After Runtime Dependency Notes

| Area | Before PR_26160_076 | After PR_26160_076 |
| --- | --- | --- |
| Colors repository snapshot | `palette_source_swatches` fed `sourcePaletteOptions`, `sourcePaletteRecordCount`, `listSourceSwatches()`, and Repository Tables counts. | Snapshot no longer exposes source palette options/counts, and active repository `getTables()` no longer returns `palette_source_swatches`. |
| Colors page source browser | The page still carried defensive source select/search/pin/sort/size bindings even though source controls were no longer active UI. | Source-browser bindings and query-mode hooks are removed; no active source controls render or execute. |
| Harmony match source | Source/all harmony wording implied table-backed source palette matching. | Current/All Picker match wording is used, and harmony matching consumes supplied picker swatches only; no deprecated table fallback remains. |
| Diagnostic-only page output | Repository Tables could make `palette_source_swatches` appear to be active Colors runtime data. | Colors Repository Tables omit source rows; deprecated source rows are shown only in DB Viewer as migration/history data. |
| DB Viewer | The table appeared as an ordinary active Palette table. | DB Viewer labels it `palette_source_swatches (deprecated)` and shows a note that current Colors grid rendering, editing, save/load, and import/export do not read it. |
| Migration/history data | Source rows were part of active repository table ownership. | Server DB snapshot keeps the table for deprecated migration/history inspection only; the table is not deleted because migration/history dependency has not been disproven. |

## Validation Evidence

| Lane | Status | Evidence |
| --- | --- | --- |
| Syntax checks | PASS | `node --check` on all changed JS/test files exited 0. |
| Colors Playwright | PASS | `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs --reporter=line` -> 9 passed. |
| DB Viewer Playwright | PASS | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --reporter=line` -> 7 passed. |
| Runtime trace | PASS | Inline Playwright trace: source controls 0; source table absent from Colors table counts; picker swatches 24; reload retained added swatch; DB Viewer deprecated source table visible with 838 rows. |
| Static validation | PASS | `git diff --check` passed with line-ending warnings only. |

## Impacted Lanes

- Colors runtime/UI lane.
- Admin DB Viewer lane.
- Changed-file syntax/static lane.

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | Samples and sample loaders are not touched. |
| Unrelated Toolbox/Admin metadata migration | Explicitly out of scope for PR_26160_076. |

## Manual Test Notes

No additional manual browser walkthrough was required. The targeted Playwright lanes and runtime trace directly covered the requested Colors and DB Viewer behavior.
