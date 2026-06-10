# PR_26160_074-palette-db-legacy-table-audit

Generated: 2026-06-09

## Branch Validation

| Check | Result | Evidence |
| --- | --- | --- |
| Current branch | PASS | `git branch --show-current` returned `main`. |
| Expected branch | PASS | Required branch is `main`. |
| Local branches found | PASS | `git branch --list` returned `main` only. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Audit `palette_source_swatches` reads | PASS | Reads are concentrated in `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js`, `toolbox/colors/colors.js`, `toolbox/colors/palette-api-client.js`, `src/dev-runtime/server/mock-api-router.mjs`, `src/dev-runtime/persistence/mock-db-store.js`, and DB Viewer rendering through `src/engine/api/mock-db-viewer-ui.js`. |
| Audit `palette_source_swatches` writes | PASS | Seed/write paths are `src/dev-runtime/guest-seeds/palette-source-mock-db.js`, `createPaletteToolMockDbTables()`, repository `getTables()`, and mock DB persistence/schema ownership in `src/dev-runtime/persistence/mock-db-store.js`. |
| Determine Colors runtime effect | PASS | The table still affects source palette options, source swatch listing, source pin/unpin, harmony matching against current/all source swatches, table counts, diagnostics, and DB Viewer table visibility. |
| Determine whether 838 records are legacy seed data | PASS | Probe confirmed `createPaletteSourceMockDbRows()` returns 838 rows and a fresh palette repository exposes 838 `palette_source_swatches` rows. They are seed-backed curated source rows, but not orphaned/unused legacy data. |
| Decide remove/rename/archive/migrate | PASS | Do not remove or rename in this PR. Safe future migration would require first replacing source browser/harmony/source-row repository behavior with a new curated source catalog/service. |
| Audit `palette_colors` | PASS | Active DB-owned Project Swatches table. Read/write via palette repository and visible in DB Viewer. |
| Audit `palette_source_swatches` | PASS | Active DB-owned curated source/reference swatch table. Seeded by dev runtime and used by palette source/harmony paths. |
| Audit `palette_swatch_usages` | PASS | Active DB-owned usage/dependency table. Used for swatch usage rows and DB Viewer relationship diagnostics to project swatches/assets. |
| Audit `project_workspace_palette_globals` | PASS | Active DB-owned per-project palette settings/global table. Used for workspace palette records and palette table relationship diagnostics. |
| Keep Colors grid behavior unchanged | PASS | Grid behavior was preserved. A narrow metadata repair in `toolbox/colors/colors.js` prevents generated swatches from storing the internal preview-layout sentinel `default` as user-facing sort metadata; the grid layout/order remains unchanged. |
| Do not migrate unrelated Toolbox/Admin data | PASS | No Toolbox/Admin metadata migration was performed. |
| No inline script/style/event handlers | PASS | No HTML/CSS changes were made. |

## `palette_source_swatches` Usage Audit

### Reads

| File | Read behavior |
| --- | --- |
| `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js` | Loads `loadedMockDbTables.palette_source_swatches`, normalizes rows with `normalizeSourcePaletteRows()`, exposes `sourcePaletteOptions()`, `listSourceSwatches()`, source counts, source row tables, and source-backed harmony matching. |
| `toolbox/colors/palette-api-client.js` | Uses palette API repository constants/contracts that surface the palette repository snapshot and tables to the browser tool. |
| `toolbox/colors/colors.js` | Reads `snapshot.sourcePaletteOptions`, `snapshot.sourcePaletteRecordCount`, `repository.listSourceSwatches()`, source diagnostics, and palette table counts. Source controls are currently hidden from the active UI, but the runtime code path remains present. |
| `src/dev-runtime/server/mock-api-router.mjs` | Provides API-backed palette repository/test modes, including empty/invalid source table setup for palette route behavior. |
| `src/dev-runtime/persistence/mock-db-store.js` | Declares `palette_source_swatches` schema and the Palette DB Viewer group. |
| `src/engine/api/mock-db-viewer-ui.js` | Renders current adapter tables from the API snapshot; Palette filter shows `palette_source_swatches` with schema/records. |
| `tests/playwright/tools/PaletteToolMockRepository.spec.mjs` | Asserts repository table ownership, source options, source swatch pin/unpin, hidden source controls in current UI, and symbol-free palette validation. |
| `tests/playwright/tools/AdminDbViewer.spec.mjs` | Asserts Palette DB Viewer grouping includes `palette_source_swatches` and that raw Palette tables are DB-shaped. |

### Writes / Ownership

| File | Write/ownership behavior |
| --- | --- |
| `src/dev-runtime/guest-seeds/palette-source-mock-db.js` | `createPaletteSourceMockDbRows()` creates the curated source seed rows. |
| `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js` | `createPaletteToolMockDbTables()` seeds/clones source rows; `getTables()` returns normalized `palette_source_swatches` rows for persistence/snapshot output. |
| `src/dev-runtime/persistence/mock-db-store.js` | Owns schema/table grouping and audit field normalization expectations for `palette_source_swatches`. |

### Runtime Impact

`palette_source_swatches` still affects active service behavior. The current Colors grid is the primary picker workflow, but the palette repository still uses source swatches for source palette options, source listing, source pinning, source-backed harmony suggestions, diagnostics, table counts, and DB Viewer visibility. Removing the table now would break those paths or force browser/server fallbacks, which would violate the current DB SSoT direction.

### 838-Record Finding

Targeted Node probe:

```text
seedRows: 838
tableRows: 838
sourceOptions: 11
sourcePaletteRecordCount: 838
tableCounts: palette_colors=0, palette_source_swatches=838, palette_swatch_usages=0, project_workspace_palette_globals=1
```

Conclusion: the 838 rows are dev/runtime seed-backed curated source swatches. They are legacy in the sense that they support the older source palette browser/harmony model, but they are not currently unused.

## Palette Table Ownership Recommendation

| Table | Current owner | Recommendation |
| --- | --- | --- |
| `palette_colors` | DB-backed Colors Project Swatches | Keep. It is the active project swatch table and is written/read by the Colors repository and DB Viewer. |
| `palette_source_swatches` | DB-backed curated source/reference swatches | Keep for now. Do not delete until source browser/harmony matching is intentionally migrated to a new curated source catalog/service or retired. |
| `palette_swatch_usages` | DB-backed swatch usage/dependency rows | Keep. It supports usage/dependency tracking and DB Viewer relationship diagnostics. |
| `project_workspace_palette_globals` | DB-backed per-project palette settings/global records | Keep. It supports project palette settings and relationship checks for project swatches. |

Future migration option: if the product direction is to remove source-browser behavior entirely, first remove or replace `sourcePaletteOptions()`, `listSourceSwatches()`, source pinning, and source-backed harmony matching. After that, migrate any still-useful curated swatches into a clearly named source catalog service/table or archive the seed file with a migration report.

## Colors Metadata Repair

During the requested Colors grid validation, the first run failed because generated picker swatches stored `sortField: "default"` when the preview grid was in default spatial order. That value is an internal layout sentinel, not a useful user-facing stored sort setting. `toolbox/colors/colors.js` now stores the active Project Swatches sort (`hue`, ascending by default) when the preview layout is `default`, while preserving the actual Picker Preview grid order and duplicate behavior.

## Validation

| Lane | Status | Command | Evidence |
| --- | --- | --- | --- |
| Branch guard | PASS | `git branch --show-current`; `git branch --list` | Current branch `main`; local branch list `main`. |
| Palette DB audit probe | PASS | Inline Node import of palette seed and repository | Confirmed 838 seeded source rows, 838 repository table rows, 11 source options, and table counts. |
| Changed JS syntax | PASS | `node --check toolbox/colors/colors.js` | Changed Colors JS parsed successfully. |
| Colors grid/runtime Playwright | PASS | `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs --reporter=line` | 9 passed after metadata repair. Initial run exposed the `sortField: default` metadata drift. |
| DB Viewer palette grouping Playwright | PASS | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --reporter=line` | 7 passed. Covers Palette filter, `palette_source_swatches` visibility, raw DB-shaped Palette tables, Local Mem, and Local DB inspection. |
| Static whitespace validation | PASS | `git diff --check` | No whitespace errors after report generation. |

## Impacted Lane

- Palette/Colors DB audit and runtime lane.
- Admin DB Viewer Palette grouping lane.

## Skipped Lanes

| Lane | Status | Reason |
| --- | --- | --- |
| Full samples validation | SKIP | This PR does not touch sample loaders, game runtime, sample assets, or the shared sample framework. |
| Broad Toolbox/Admin migration validation | SKIP | The request explicitly scoped this PR to Palette/Colors DB audit and DB Viewer palette grouping. |
| Unrelated Toolbox/Admin data migration | SKIP | The request said not to migrate unrelated Toolbox/Admin data. |

## Manual Test Notes

No manual browser walkthrough was required beyond the targeted Playwright lanes. The audit found `palette_source_swatches` is still active and should not be deleted in this PR.
