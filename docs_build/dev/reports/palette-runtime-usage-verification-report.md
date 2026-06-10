# PR_26160_075-palette-runtime-usage-verification

Generated: 2026-06-09

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch | PASS | `git branch --show-current` returned `main`. |
| Expected branch | PASS | Required branch is `main`. |

## Executive Finding

Recommendation: **DEPRECATE**.

`palette_source_swatches` is requested by the live Colors page through the palette repository snapshot path, and it contributes to visible output through the Colors `Repository Tables` panel (`Source Swatches838`). It does **not** affect the current generated Picker Preview grid, project swatch editing, symbol-free validation, import/export, or save/load behavior. Current source-browser UI controls are absent, and current harmony matching is supplied by generated picker swatches even when the user selects source-based match modes.

Do not remove the table in this PR. A removal PR should first remove or replace the dead source-browser and source-harmony code paths, then update DB Viewer grouping and tests.

## Runtime Trace Evidence

Targeted Playwright/Chromium trace opened:

- `/toolbox/colors/index.html`
- `/toolbox/colors/index.html?source=empty`

The trace captured palette API calls, DOM state, grid hexes, edit/save behavior, and reload behavior.

### Normal Source Rows

| Runtime item | Observed value |
| --- | --- |
| Page | `/toolbox/colors/index.html` |
| Source controls rendered | `0` for `[data-palette-source-select]`, `[data-palette-source-search]`, `[data-palette-source-pin-all]`, `[data-palette-source-list]` |
| Initial grid count | `24` |
| First 12 grid hexes | `#245F34`, `#34813E`, `#4C9C4D`, `#80B65C`, `#AFC082`, `#D6CEA2`, `#A36E44`, `#43633A`, `#102A17`, `#1F4D25`, `#346B35`, `#5D8A3E` |
| Rendered source table output | `Source Swatches838` |
| Add picker swatch | Project count changed from `0` to `1`; selected swatch `Nature Forest Full Green #245F34` |
| Reload after add | Project count remained `1`; `Source Swatches838` remained visible |
| Snapshot source values | `sourcePaletteRecordCount=838`, `sourcePaletteOptions=11`, `palette_source_swatches rows=838` |

### Empty Source Rows

| Runtime item | Observed value |
| --- | --- |
| Page | `/toolbox/colors/index.html?source=empty` |
| Source controls rendered | `0` |
| Initial grid count | `24` |
| First 12 grid hexes | Same as normal source rows: `#245F34`, `#34813E`, `#4C9C4D`, `#80B65C`, `#AFC082`, `#D6CEA2`, `#A36E44`, `#43633A`, `#102A17`, `#1F4D25`, `#346B35`, `#5D8A3E` |
| Rendered source table output | `Source Swatches0` |
| Add picker swatch | Project count changed from `0` to `1`; selected swatch `Nature Forest Full Green #245F34` |
| Snapshot source values | `sourcePaletteRecordCount=0`, `sourcePaletteOptions=0`, `palette_source_swatches rows=0` |

Conclusion: emptying source rows changes the diagnostic/table-count output, but not the generated grid.

### Harmony Runtime Trace

The trace selected a picker swatch, then switched Color Harmony Schemes Match to `All Sources Closest Match` and `Current Source Closest Match`.

| Source mode | Match mode | Rendered output |
| --- | --- | --- |
| Normal source rows | All Sources Closest Match | `Showing 1 Complementary colors from All Sources Closest Match.` First title: `Complementary Nature Forest Full Orange #6F4B2E`. |
| Empty source rows | All Sources Closest Match | Same rendered output: `Complementary Nature Forest Full Orange #6F4B2E`. |
| Normal source rows | Current Source Closest Match | `Showing 1 Complementary colors from Current Source Closest Match.` First title: `Complementary Nature Forest Full Orange #6F4B2E`. |
| Empty source rows | Current Source Closest Match | Same rendered output: `Complementary Nature Forest Full Orange #6F4B2E`. |

Conclusion: current harmony output does not depend on `palette_source_swatches` because `toolbox/colors/colors.js` passes generated picker swatches from `currentHarmonyMatchSwatches()` into `repository.createHarmonySuggestions()`. In `harmonyForSwatch()`, provided match swatches win over source palette rows.

## Page Requests

| Page | Runtime request evidence |
| --- | --- |
| `toolbox/colors/index.html` | Requests `/api/toolbox/palette/repositories` and repeated `/api/toolbox/palette/repositories/{id}/methods/getSnapshot`; snapshot responses include source count/options/table data. |
| `toolbox/colors/index.html?source=empty` | Same page route with test option; confirms grid behavior without source rows. |

No current Colors page request directly called the `listSourceSwatches` repository method during the trace.

## API / Service Methods Reading Source Rows

| Method/path | Runtime role | Source-row effect |
| --- | --- | --- |
| `createProjectWorkspacePaletteRepository()` | Repository creation reads `loadedMockDbTables.palette_source_swatches` into `sourcePaletteRows`. | Active initialization read. |
| `getSnapshot()` | Returns `sourcePaletteOptions`, `sourcePaletteRecordCount`, `tableCounts`, and `tables`, all derived from `sourcePaletteRows`/`getTables()`. | Active read; visible only through Repository Tables count on current page. |
| `sourcePaletteOptions()` | Builds source option metadata from `sourcePaletteRows`. | Dead for current UI because source select is absent; still returned in snapshots. |
| `listSourceSwatches()` | Reads source rows by source/filter/sort. | Dead for current Colors page trace; no request to this method occurred. |
| `createHarmonySuggestions()` | Builds `sourcePaletteData` from `sourcePaletteOptions()` and `listSourceSwatches()` before calling `harmonyForSwatch()`. | Dead read in current UI because provided generated picker `matchSwatches` override source palettes. |
| `getTables()` | Emits `palette_source_swatches` rows and table counts. | Active diagnostic/table-count read; also included in persistence snapshots. |

## UI Consumer List

| UI component | Consumes `palette_source_swatches` data? | Evidence |
| --- | --- | --- |
| Repository Tables panel | YES | `renderTables()` consumes `snapshot.tableCounts`; `displayColorsTableName()` maps `palette_source_swatches` to `Source Swatches`; runtime showed `Source Swatches838`. |
| Source browser controls | NO in current page | HTML has no source select/search/pin/list nodes; trace source control count was `0`; `renderSourceOptions()` and `renderSourceSwatches()` return early. |
| Picker Preview grid | NO | Normal and empty-source runs both rendered 24 grid swatches with the same first 12 hexes. Grid is generated from curated arrays in `toolbox/colors/colors.js`. |
| Color Harmony Schemes | NO for current behavior | Source rows are read by service helper code, but generated picker swatches are passed as `matchSwatches` and determine rendered harmony output. Normal and empty-source traces matched. |
| Project Swatches list/editing | NO | Add/update/remove/tag behavior reads/writes `palette_colors` through active project swatches, not `palette_source_swatches`. |
| Import/export | NO | Current UI does not expose import/export; repository `loadActiveProjectPalettePayload()` validates and loads `tools.palette-browser.swatches` only. |
| Save/load persistence | INDIRECT / redundant | Palette save operations persist current adapter tables through `getTables()`, including unchanged source rows, but source rows do not determine project swatch save/load results. |

## Requested Behavior Questions

| Question | Finding |
| --- | --- |
| Does `palette_source_swatches` contribute to rendered Colors page output? | YES, through Repository Tables row `Source Swatches838`; not through source browser controls. |
| Does it affect grid rendering? | NO. Empty-source trace produced the same grid count and first grid hexes. |
| Does it affect import/export? | NO current import/export UI; repository payload loading uses active project swatches only. |
| Does it affect palette editing? | NO for current manual/picker editing. Picker add/save uses generated swatch data and `palette_colors`. |
| Does it affect save operations? | Not functionally. Saves persist full palette table state including unchanged source rows, but source rows do not change saved project swatches. |

## Dead Read Findings

| Dead read | Evidence |
| --- | --- |
| `sourcePaletteOptions` in current Colors UI | Returned in snapshots but no source select is rendered. |
| `renderSourceOptions()` / `renderSourceSwatches()` source UI path | Functions exist, but no matching DOM nodes exist in `toolbox/colors/index.html`; runtime source control count was `0`. |
| `createHarmonySuggestions()` source palette data build | Service constructs source palette data, but current UI passes generated picker `matchSwatches`, so `harmonyForSwatch()` uses generated swatches instead. Empty-source and normal-source harmony output matched. |
| `listSourceSwatches()` API method for current page | No runtime request to the repository `listSourceSwatches` method appeared in the trace. |

## Dead Write Findings

| Dead/redundant write | Evidence |
| --- | --- |
| Persisting unchanged `palette_source_swatches` during palette edits | `pinSourceSwatch`/save paths persist repository tables through `getTables()`, which includes unchanged source rows. This keeps adapter snapshots complete, but the current edit/save result does not depend on source row content. |

## Removal Path

1. Remove or replace source-browser code paths in `toolbox/colors/colors.js`: `renderSourceOptions()`, `renderSourceSwatches()`, source sort/size/pin-all handlers, and source-only state.
2. Remove `sourcePaletteOptions`, `listSourceSwatches`, and source-data preloading from `createHarmonySuggestions()` unless a real source-backed harmony UX is restored.
3. Update `getSnapshot()` to omit source options/record count/tables from the Colors runtime snapshot, or move them to an admin-only diagnostics endpoint.
4. Remove `palette_source_swatches` from `PALETTE_TOOL_TABLES`, mock DB schemas, DB Viewer Palette grouping, and seed generation.
5. Update Playwright/repository tests that still assert source table behavior.

Until that cleanup is intentionally scoped, keep the physical table but mark it as deprecated/legacy source-browser data.

## Validation

| Lane | Status | Command | Evidence |
| --- | --- | --- | --- |
| Branch guard | PASS | `git branch --show-current` | Returned `main`. |
| Runtime trace | PASS | Inline Playwright/Chromium trace against normal and empty-source Colors pages | Captured API methods, source snapshot counts, source control count, grid hexes, add behavior, reload behavior, and harmony output. |
| Colors Playwright | PASS | `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs --reporter=line` | 9 passed. Covers Colors page load, grid rendering, palette editing, save/load behavior, and symbol-free validation. |
| Static whitespace validation | PASS | `git diff --check` | No whitespace errors after reports were generated. |

## Skipped Lanes

| Lane | Status | Reason |
| --- | --- | --- |
| Full samples validation | SKIP | This PR is evidence-only for Colors runtime usage and does not touch samples. |
| DB Viewer Playwright | SKIP | The request explicitly said not to rely on DB Viewer visibility and asked for targeted Colors runtime validation only. |
| Toolbox/Admin migration validation | SKIP | This PR does not migrate Toolbox/Admin data. |
