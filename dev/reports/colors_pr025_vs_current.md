# PR_26159_033 Colors PR025 vs Current Diff Analysis

## Scope

Requested analysis only. No runtime behavior was changed.

Baseline compared:
- PR_26159_025 commit: `1ad83b4c2f144043fc669c6cf10c7a9d5f50f0a2`
- Current commit: `2c761c19a97837aef505e90c269a4d28599d2bd4`

Scoped files compared:
- `toolbox/colors/*`
- `assets/theme-v2/css/forms.css`
- `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js`
- `src/shared/schemas/tools/palette-browser.schema.json`
- `tests/playwright/tools/PaletteToolMockRepository.spec.mjs`

Generated supporting diff:
- `docs_build/dev/reports/colors_pr025_vs_current.diff`

## Executive Summary

The diff does not support the assumption that PR_26159_025 had an available-top / unavailable-bottom picker viewer. The actual PR_025 implementation rendered one generated picker grid and disabled cells only when the old one-character `symbol` pool was exhausted.

The available-top / unavailable-bottom viewer was introduced later by `54b6a5ba6` in `toolbox/colors/colors.js` for PR_26159_031. That same change introduced the uneven column risk because it filtered available and unavailable swatches into separate arrays before rendering rows. Current HEAD `2c761c19a` then fixed that source-level grid collapse by keeping the full swatch matrix and inserting placeholders for cells that belong to the other section.

The active scoped source no longer contains the old `Symbol: Enter a symbol for this swatch.` validation string. The source removal happened in `919cde355`. If that error is still visible in the running app, the most likely cause is stale server/runtime state serving an older `palette-workspace-repository.js` implementation or stale persisted Local DB schema/validation state, not the current committed Colors source.

The red not-allowed behavior came from native disabled picker swatches plus Theme V2 disabled styling. In PR_025 this was tied to symbol exhaustion. A later PR_030/031 transition also used disabled picker buttons for already-selected swatches before PR_031 changed unavailable swatches to a non-disabled `data-palette-generator-unavailable` path.

## Changed Files

| File | PR_025 behavior | Current behavior | Why it changed |
| --- | --- | --- | --- |
| `toolbox/colors/colors.js` | Symbol-based swatch identity; single generated picker grid; disabled generated cells when no one-character symbol remained; selected swatches were named Selected Swatches. | Key-based swatch identity; Theme Collection / Palette Type / Variant metadata; Project Swatches and Picker Swatches workflows; available and already-in-project sections; picker metadata, restore settings, tag filtering, ROYGBIV, and placeholder-preserved grid cells. | PR_026 through PR_032 moved Colors from symbol-era selection into metadata-rich Project Swatches, curated palette variants, and unavailable-section handling. |
| `toolbox/colors/index.html` | Included Symbol inputs/selected Symbol displays and older Selected Swatches / Defined Swatch Selector layout. | Symbol UI removed; Project Swatches and Picker Swatches accordions added; Theme Collection, Palette Type, Variant, tags, metadata, and picker controls reorganized. | PR_026 through PR_028 removed Symbol from user workflow and PR_027 added Project Swatches / Picker Swatches terminology. |
| `toolbox/colors/palette-api-client.js` | `validatePaletteSwatchInput(input, options)` forwarded two arguments. | `validatePaletteSwatchInput(input, existingSwatches, options)` forwards existing swatches plus options. | Repository validation now checks key duplicates against the current swatch set without relying on Symbol. |
| `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js` | `symbol` was the swatch identity and validation could require it; source palette rows used `symbol`; usage rows used `swatchSymbol`. | `key` is the swatch identity; repository normalizes missing keys for generated/user swatches; usage rows use `swatchKey`; Symbol validation and one-character symbol pool are removed from current source. | PR_028 converted palette-browser from Symbol to key and PR_032 added no-Symbol regression coverage. |
| `src/shared/schemas/tools/palette-browser.schema.json` | Direct palette swatches required `symbol`, `hex`, and `name`; `symbol` was max length 1. | Direct palette swatches require `key`, `hex`, and `name`; no `symbol` property exists. | PR_028 removed Symbol from the active palette-browser contract. |
| `assets/theme-v2/css/forms.css` | Project swatch checkboxes were positioned outside the swatch tile; disabled preview swatches had `cursor: not-allowed` and reduced opacity. | Project swatch checkbox moved inside the swatch at the top-left; disabled preview styling still exists for generic disabled buttons, but current unavailable picker swatches are not natively disabled. | PR_027 moved project swatch checkbox into the swatch. Disabled styling remains reusable Theme V2 behavior. |
| `tests/playwright/tools/PaletteToolMockRepository.spec.mjs` | Tests covered symbol-era repository behavior. | Tests assert symbol-free payloads and no-Symbol add/update/remove/pin/unpin behavior, plus picker grid column coverage. | PR_028 and PR_032 added validation evidence for key-based swatches and the grid regression. |

## Functions Changed

### `toolbox/colors/colors.js`

PR_025 functions removed or materially changed:
- `nextGeneratedSymbol(snapshot, reservedSymbols)` existed in PR_025 and allocated one-character symbols for generated swatches.
- `createGeneratorPreviewInput(...)` accepted `options.symbol` and `options.disabled`.
- `renderPaletteGeneratorPreview(...)` built a single grid and disabled cells when no symbol existed.
- `generatedSwatchFromTile(tile)` returned `symbol`.
- `readUserSwatchForm()` returned `symbol`.
- `fillUserSwatchForm(swatch)` populated `elements.symbol`.
- `checkedSwatchSymbolsFromSnapshot(snapshot)` tracked batch-tag checkbox state by symbol.
- `validateUserSwatch()` passed `excludeSymbol`.

Current replacement or expanded functions:
- `swatchKey(swatch)` centralizes key identity.
- `currentPickerSettings(settings)` captures generation settings.
- `metadataFromPickerSettings(swatch, settings)` stores picker metadata.
- `pickerTooltipText(...)` narrows hover text to current tooltip rules.
- `pickerUnavailableReason(pinnedSwatch)` identifies already-in-project swatches.
- `generatedPickerSwatches(settings)` builds metadata-backed generated swatches for matching and suggestions.
- `createPickerGroupLabel(group, count)` adds available/unavailable section labels.
- `createPickerGridPlaceholder(row, column)` preserves grid columns when a cell belongs to the other group.
- `appendPickerGroupRows(fragment, group, allSwatches, settings)` renders each group while preserving the original row/column matrix.
- `renderPaletteGeneratorPreview(action)` now builds `allSwatches`, splits by availability during render, and reports already-in-project behavior.
- `generatedSwatchFromTile(tile)` returns metadata-backed keyless input for repository key generation.
- `applyPickerSettings(settings)` restores a swatch's originating picker settings.

### `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js`

Changed functions and contracts:
- `cloneSwatch` changed from `symbol` to `key`.
- `normalizePaletteSwatchInput` changed from `source.symbol` to `source.swatchKey || source.key`.
- `validatePaletteSwatchInput` no longer requires `symbol`; it validates duplicate `key`.
- `validatePaletteWorkspacePayload` no longer calls swatch validation with `{ requireSymbol: true }`.
- `normalizeSourcePaletteRows` changed source rows from `symbol` to `swatchKey`.
- `replacePaletteColorRows`, `replaceSwatches`, `saveSwatch`, `updateSelectedSwatch`, `updateSelectedSwatchTags`, `addTagToSwatches`, `removeSwatch`, `selectSwatch`, `findSwatch`, `getSwatchUsage`, `recordSwatchUsage`, undo/redo, and import paths moved from symbol identity to key identity.
- `nextAvailableSymbol` was replaced by `nextAvailableSwatchKey`.

### `toolbox/colors/palette-api-client.js`

Changed function:
- `validatePaletteSwatchInput(input, options)` became `validatePaletteSwatchInput(input, existingSwatches, options)`.

## Validation Changes

PR_025 relied on symbol-era validation:
- Missing `symbol` failed swatch validation.
- Direct palette schema required `symbol`.
- Generated swatches were blocked when no one-character symbol was available.

Current validation:
- Schema requires `key`, `hex`, `name`.
- Repository validation accepts swatches without Symbol and can generate a key during repository save paths.
- `tests/playwright/tools/PaletteToolMockRepository.spec.mjs` includes symbol-free payload validation and no-Symbol behavior tests.
- Current scoped source search finds no active `Enter a symbol for this swatch` string.

Important caveat:
- A running API server can still serve old in-memory code until it is restarted. If the UI still reports `Symbol: Enter a symbol for this swatch. tools.palette-browser.swatches`, that error matches the PR_025/pre-PR_028 repository validator, not current scoped source.

## Picker Viewer Changes

### PR_025 picker viewer

PR_025 did not have explicit available and unavailable sections. It rendered:
- one `palette-generator-preview` grid
- one row element per generated row
- one button per generated swatch
- disabled buttons only when no one-character Symbol could be allocated and the swatch was not already pinned

Relevant PR_025 source:
- `toolbox/colors/colors.js`
- `nextGeneratedSymbol(snapshot, reservedSymbols)`
- `renderPaletteGeneratorPreview(...)`
- `createGeneratorPreviewInput(..., { disabled, symbol })`

### PR_031 picker viewer

Commit `54b6a5ba6` introduced:
- `createPickerGroupLabel(group, count)`
- `appendPickerGroupRows(fragment, group, items, settings)`
- `availableSwatches = allSwatches.filter((swatch) => swatch.available)`
- `unavailableSwatches = allSwatches.filter((swatch) => !swatch.available)`
- available section label: `Available Picker Swatches`
- unavailable section label: `Already in Project`

This is the commit that introduced the requested top/bottom grouping.

### Current picker viewer

Commit `2c761c19a` changed `appendPickerGroupRows` to accept `allSwatches` instead of a pre-filtered group array and added `createPickerGridPlaceholder(row, column)`. That keeps the column count stable even when some cells are unavailable/already in project.

## Selection Changes

PR_025:
- Generated picker click toggled a generated swatch into Selected Swatches using `symbol`.
- Selected/project swatches were tracked by `symbol`.
- Batch checkbox state was tracked by `checkedSwatchSymbols`.

Current:
- Picker click adds available swatches to Project Swatches using repository-generated or supplied `key`.
- Already-in-project swatches are marked unavailable unless the include-already-in-project override is active.
- Selected project swatches are tracked by `key`.
- Batch checkbox state is tracked by `checkedSwatchKeys`.

## Pin Mode Changes

PR_025:
- Pin state was inferred from an exact hex match against selected swatches.
- Generated swatches carried a red/green pin indicator via `createPinIndicator`.
- Disabled state could block pinning when the symbol pool was exhausted.

Current:
- Pin state is still inferred from exact hex match with project swatches.
- Pinned swatches retain picker settings and metadata.
- The user can restore picker settings from selected/pinned swatch metadata.
- Already-in-project picker swatches are separated into the bottom section and are blocked from adding unless included through the specifically named override.

## Tag Changes

PR_025:
- Tags existed on selected swatches.
- Sorting included `Tag`.
- Batch tag checkboxes existed from PR_025 recovery work.

Current:
- Tags remain user-defined.
- Tag filters use checkbox state and match mode.
- Tag typeahead suggestions exist.
- Project Swatches filtering can show any selected tag or all selected tags.
- Batch tagging now uses swatch keys.

## Project Swatches Changes

PR_025:
- User-facing selected color area was still primarily `Selected Swatches`.
- Symbol was part of form and selected swatch identity.

Current:
- User-facing workflow is `Project Swatches`.
- Project Swatches accordion appears above Picker Swatches.
- Swatches store picker metadata and can restore originating picker settings.
- Checkbox is inside the swatch tile at top-left.

## Picker Swatches Changes

PR_025:
- Picker Swatches were a single generated preview grid.
- Disabled cells meant no Symbol was available.

Current:
- Picker Swatches are grouped as available and already-in-project/unavailable.
- Available swatches can be clicked to add.
- Unavailable swatches preserve their true color and are blocked by data state, not by native disabled buttons.
- Current source preserves grid columns with placeholders.

## Symbol-Related Changes

Symbol was removed in PR_028:
- Commit: `919cde35518ef730ef53b30e5842b38b4c545807`
- Files:
  - `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js`
  - `src/shared/schemas/tools/palette-browser.schema.json`
  - `toolbox/colors/colors.js`
  - `toolbox/colors/index.html`

The current schema requires:
- `key`
- `hex`
- `name`

The PR_025 schema required:
- `symbol`
- `hex`
- `name`

Why the Symbol validation returned after removal:
- No current scoped file reintroduced the active `Symbol: Enter a symbol for this swatch.` string.
- The exact historical source of that error is PR_025/pre-PR_028 `validatePaletteSwatchInput()` in `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js`.
- If still observed in the app, the server/API process is likely stale or persisted validation/schema state is stale. Restart the API-backed local server and, if needed, reseed/clear stale Local DB state before retesting.

## Disabled and Unavailable Swatch Changes

PR_025 disabled reason:
- A generated swatch was disabled when no one-character symbol could be allocated.
- This came from `createGeneratorPreviewInput(... options.disabled ...)` and `swatch.disabled = Boolean(options.disabled)`.
- The visible not-allowed cursor and dimming came from `.palette-generator-preview-swatch:disabled` in `assets/theme-v2/css/forms.css`.

PR_030/031 unavailable reason:
- The disabled subset changed from symbol exhaustion to already-in-project swatches.
- Commit `54b6a5ba6` formalized the reason as `Already in Project`.

Current unavailable reason:
- `pickerUnavailableReason(pinnedSwatch)` returns `Already in Project`.
- Unavailable buttons are not natively disabled in current source.
- Click handling checks `data-palette-generator-unavailable="true"` and reports the reason without adding the swatch.

Red-dot behavior:
- The small red dot is the unpinned `palette-swatch-pin` indicator, not the unavailable reason itself.
- The not-allowed cursor came from native disabled buttons.
- Current source no longer uses native disabled buttons for unavailable picker swatches.

## Grid Generation Changes

PR_025:
- Generated grid was rows x columns directly from current Colors and Steps settings.
- Each generated swatch occupied one cell.
- Disabled cells still occupied their grid slots.

PR_031:
- The renderer filtered `allSwatches` into `availableSwatches` and `unavailableSwatches`.
- Rows were built from the filtered arrays.
- This caused available rows to collapse when a column moved to unavailable.

Current:
- `allSwatches` remains the full generated matrix.
- `appendPickerGroupRows(fragment, group, allSwatches, settings)` filters internally but loops across all `settings.colors` columns.
- `createPickerGridPlaceholder(row, column)` occupies cells that belong to the other group.
- Current source should render exactly the selected column count per row for any group that has at least one item in that row.

## Regression Trace

| Regression / question | Exact source trace | Introduced by | Current status |
| --- | --- | --- | --- |
| "Why did PR_025 have available at top and unavailable at bottom?" | It did not in the committed PR_025 source. PR_025 had a single grid with disabled symbol-exhausted cells. | Not applicable to PR_025. Top/bottom grouping was introduced by `54b6a5ba6` in `toolbox/colors/colors.js`. | Current source keeps top/bottom grouping. |
| Uneven picker column counts | `54b6a5ba6` filtered available/unavailable arrays before row rendering, so cells removed from one group collapsed that row. | `54b6a5ba6`, `toolbox/colors/colors.js`, `appendPickerGroupRows(fragment, group, items, settings)`. | Fixed in source by `2c761c19a`, which added placeholders and passes `allSwatches`. |
| Symbol validation returned | Historical validator required `symbol` in PR_025/pre-PR_028. PR_028 removed it. No current scoped source reintroduces it. | Original Symbol validation existed before and at `1ad83b4c2`; PR_026 changed it to optional `requireSymbol`; PR_028 removed it. If still visible after PR_032, it is stale served code or stale DB state. | Current source has no active `Enter a symbol for this swatch` string in scoped files. |
| Red dot / not-allowed behavior | Red dot is `palette-swatch-pin` default red for unpinned; not-allowed cursor came from native disabled swatches and `.palette-generator-preview-swatch:disabled`. | Disabled behavior existed in PR_025 `toolbox/colors/colors.js`; already-in-project disabled handling existed during PR_030/031 transition before PR_031 changed to data-unavailable. | Current unavailable swatches are not natively disabled in source. |

## Recommended Files To Revert

Do not wholesale revert these files:
- `toolbox/colors/colors.js`
- `toolbox/colors/index.html`
- `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js`
- `src/shared/schemas/tools/palette-browser.schema.json`

Reason:
- A wholesale revert would restore Symbol-era behavior and break newer required behavior: Theme Collection, Palette Type, Variant, ROYGBIV, Project Swatches, Tags, Metadata, and key-based palette-browser validation.

Targeted revert candidates only if a future fix is needed:
- In `toolbox/colors/colors.js`, avoid returning to the PR_031 filtered-array rendering path.
- Keep the PR_032 placeholder-based `appendPickerGroupRows` behavior.
- If runtime still shows uneven rows, restart the local API/static server and confirm the browser is serving `2c761c19a` assets before changing code.

## Recommended Files To Keep

Keep:
- `src/shared/schemas/tools/palette-browser.schema.json` current `key` contract.
- `src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js` current key-based repository behavior.
- `toolbox/colors/index.html` current Symbol-free controls, Project Swatches, Picker Swatches, tag controls, and metadata affordances.
- `toolbox/colors/colors.js` current Theme Collection / Palette Type / Variant / ROYGBIV data, metadata retention, tag workflow, and PR_032 placeholder grid fix.
- `tests/playwright/tools/PaletteToolMockRepository.spec.mjs` current no-Symbol and picker grid regression coverage.

## Minimal Change Path For Future Runtime Fix

If the goal is to restore PR_025-like picker reliability while preserving newer behavior:

1. Keep the current key-based repository and schema. Do not reintroduce Symbol.
2. Keep current Theme Collection, Palette Type, Variant, ROYGBIV, Project Swatches, Tags, and Metadata structures.
3. Keep the PR_032 `allSwatches` matrix plus placeholder rendering so unavailable cells do not collapse rows.
4. If a future visual change is required, adjust only `toolbox/colors/colors.js` picker rendering and avoid changing repository contracts.
5. If Symbol validation appears, restart the API-backed local server and clear/reseed stale Local DB state before editing source.
6. Add one Playwright assertion that posts a swatch without `symbol` to the same live API path used by Colors, then adds/updates through the UI.

## Validation Performed

Commands/evidence:
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- `git diff --name-status 1ad83b4c2..HEAD -- <scoped files>`
- `git diff --stat 1ad83b4c2..HEAD -- <scoped files>`
- `git log --oneline --decorate -n 12 -- <scoped files>`
- `git log --oneline -S "Enter a symbol" -- <scoped files>`
- `git log --oneline -S "requireSymbol" -- <scoped files>`
- `rg -n "Symbol|symbol|paletteSymbol|swatchSymbol|Enter a symbol|data-palette-symbol" <scoped files>`
- Generated `docs_build/dev/reports/colors_pr025_vs_current.diff` from the actual scoped diff.

Validation result:
- PASS: Report references actual file diffs.
- PASS: Each requested Colors regression is traced to a file/change or documented as stale runtime state not present in current scoped source.
- PASS: No runtime behavior was changed.
- PASS: Playwright impacted: No.
- PASS: Samples validation skipped because this PR is analysis/report only.

