# PR_26156_148-150 Asset Import Dropdown and Layout Fix Report

Generated: 2026-06-05

## Scope

Stacked PRs:
- `PR_26156_148-asset-import-dropdown-layout-fix`
- `PR_26156_149-asset-import-help-row-fix`
- `PR_26156_150-asset-import-validation-coverage`

Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first.

Reference use:
- Read `archive/v1-v2/tools/old_asset-manager-v2/js/assetManagerMetadata.js`.
- Used it only to confirm the role-to-usage relationship.
- Did not copy archive/reference code.
- Did not modify archived V1/V2 files.

## PR_26156_148 Dropdown Values

Restored the Asset Role to Usage relationship in `toolbox/assets/assets-mock-repository.js`:

| Asset Role | Usage options |
| --- | --- |
| Audio | sound, music |
| Color | hud, text, background, border, accent, warning, success, danger, shadow, highlight |
| Data | config, table |
| Font | ui, display |
| Image | sprite, background, bezel, preview, ui |
| Localization | strings, dialogue |
| Shader | fragment, vertex, compute |
| Video | cutscene, loop |

Implementation notes:
- Added `usageRoles` to each active Asset role definition.
- Added `ASSET_USAGE_BY_ROLE` as the active role-to-usage source.
- Removed the generic mixed `ASSET_USAGE_ROLES` dropdown source.
- Updated `toolbox/assets/assets.js` so changing Asset Role refreshes Usage options immediately.
- Validation now checks Usage against the selected Asset Role instead of a mixed global list.

## PR_26156_149 Import Form Layout

Updated `toolbox/assets/index.html`:
- `Asset Role` label renders as two lines.
- `Storage Path` label renders as two lines.
- File label and file picker remain in the same row.
- Upload explanatory text moved below the file row.
- Upload help row spans both columns.
- File input keeps `aria-describedby="assetToolFileHelp"`.

Theme V2 gap:
- Existing `.tool-form-table` made controls `width: 100%`, but browser validation showed the left-panel table could still shrink select controls to about 74px.
- Added a reusable Theme V2 rule in `assets/theme-v2/css/tables.css`:
  - normal form value cells get a reusable `12rem` minimum width
  - `colspan` helper rows opt out so help text can span naturally
- No page-local CSS, tool-local CSS, inline styles, or style blocks were added.

## PR_26156_150 Validation Coverage

Updated `tests/playwright/tools/AssetToolMockRepository.spec.mjs`:
- Validates each Asset Role exposes its exact Usage options.
- Validates changing Asset Role changes Usage options.
- Validates two-line labels are present for Asset Role and Storage Path.
- Validates upload help text uses a `colspan="2"` table row.
- Validates file picker remains in the File row.
- Validates import form controls stay usable at narrow left-panel width.
- Existing upload/preview/failure coverage was updated to use role-specific usage values.

## Validation

Impacted lane:
- `asset-tool`

Executed:
- `node --check toolbox/assets/assets-mock-repository.js`
- `node --check toolbox/assets/assets.js`
- `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `node ./scripts/run-targeted-test-lanes.mjs --lane asset-tool`
- `git diff --check`
- `rg -n 'ASSET_USAGE_ROLES|usage:\s*"(Sprite|Music|UI|Sound Effect|Background|Character|World|Font|Data|Tile)"' toolbox/assets tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `rg -n '<style|style=|onclick=|onchange=|oninput=|<script' toolbox/assets/index.html toolbox/assets/assets.js`

Results:
- Asset Tool lane: PASS, 5 tests.
- `git diff --check`: PASS. Git reported line-ending warnings only for edited files.
- Generic usage source check: PASS, no matches.
- Inline style/event-handler check: PASS; only expected external `src` script tags were found.

Skipped lanes:
- Full samples smoke skipped by request and because no sample JSON, sample loader, or sample runtime framework behavior changed.
- Project Workspace, Game Design, Game Configuration, Build Path, Tools Progress, tool navigation, tool images, tool runtime, engine, integration, games, and samples lanes were skipped because this stack only changed Asset Tool dropdown/layout behavior plus a reusable Theme V2 form-table rule validated by the Asset Tool lane.
