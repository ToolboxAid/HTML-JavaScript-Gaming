# PR_26160_078 Colors DB Table Ownership Report

Generated: 2026-06-09

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch is `main` | PASS | `git branch --show-current` returned `main`. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Audit `palette_colors` | PASS | Active Colors Project Swatches DB table. |
| Audit `palette_swatch_usages` | PASS | Active usage tracking DB table; empty in baseline until usage records are written. |
| Audit `project_workspace_palette_globals` | PASS | Active per-project Colors workspace metadata table. |
| Audit deprecated `palette_source_swatches` | PASS | Deprecated/history DB Viewer table only; no active Colors runtime/repository dependency remains. |
| Confirm active Colors runtime tables | PASS | `PALETTE_TOOL_TABLES` contains `palette_colors`, `project_workspace_palette_globals`, and `palette_swatch_usages` only. |
| Remove active dependency on deprecated `palette_source_swatches` if any remains | PASS | Static audit found no active Colors page/repository source-table dependency; removed the final unused Colors display-name fallback for `palette_source_swatches`. |
| Do not delete tables unless proven safe | PASS | No table was deleted; `palette_source_swatches` remains deprecated/history data. |

## Palette Table Ownership

| Table | Ownership | Active Runtime Use | Reader Evidence | Writer Evidence | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `palette_colors` | Colors Project Swatches | Active | Repository loads `loadedMockDbTables.palette_colors`; `getTables()` emits current project swatches; Colors UI renders Project Swatches from repository snapshot data. | `replaceSwatches()`, `addSwatch()`, `updateSelectedSwatch()`, `removeSwatch()`, and `loadActiveProjectPalettePayload()` update swatch rows. | KEEP |
| `palette_swatch_usages` | Colors usage tracking | Active service/runtime table, empty by default | Repository loads `loadedMockDbTables.palette_swatch_usages`; `getSwatchUsage()` reads usage rows; DB Viewer validates usage links. | `recordSwatchUsage()` writes usage rows; clear/reset flows clear usage rows. | KEEP |
| `project_workspace_palette_globals` | Colors workspace metadata | Active | Repository loads globals into `workspaceRecords`; `syncWorkspaceRecordFromColors()` maintains active project palette metadata and swatch counts. | `replaceSwatches()`, `loadActiveProjectPalettePayload()`, seed/reset flows, and `getTables()` emit/update global rows. | KEEP |
| `palette_source_swatches` | Deprecated migration/history | Not active Colors runtime data | DB Viewer/server snapshot only; PR_078 static audit found no active Colors page/repository dependency. | Seed/history rows from `src/dev-runtime/guest-seeds/palette-source-mock-db.js`; no active user write path. | DEPRECATE |

## Static Audit Evidence

Command:

```text
rg -n "palette_source_swatches|sourcePalette|listSourceSwatches|sourcePaletteOptions|sourcePaletteRecordCount|data-palette-source" toolbox/colors src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js
```

Result: no active Colors page or Colors repository hits after removing the final dead display fallback.

Remaining `palette_source_swatches` references are outside active Colors runtime ownership:

- DB Viewer deprecation note and relationship/reporting display.
- Server DB snapshot seeding for deprecated history/reference inspection.
- Mock DB table schema/group registration.
- Tests asserting the table is absent from active Colors repository tables and deprecated in DB Viewer.

## Validation Evidence

| Lane | Status | Evidence |
| --- | --- | --- |
| Branch guard | PASS | `git branch --show-current` returned `main`. |
| Syntax check | PASS | `node --check toolbox/colors/colors.js`. |
| Static source-table audit | PASS | `rg` command above returned no active Colors page/repository hits. |
| Colors Playwright | PASS | `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs --reporter=line` -> 9 passed. |
| Static validation | PASS | `git diff --check` passed. |

## Impacted Lanes

- Colors runtime/UI validation lane.
- Changed-file syntax/static lane.

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | Samples and sample loaders were not touched. |
| DB Viewer Playwright | DB Viewer runtime/UI was not changed in PR_078. |
| Unrelated Toolbox/Admin migration | Out of scope for Colors palette table ownership. |

## Manual Test Notes

No manual browser walkthrough was required. Colors Playwright covered grid rendering, editing, save/load behavior, and source-browser absence.
