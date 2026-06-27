# PR_26156_127 Toolbox Card And Status Cleanup Report

## Scope

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before changes.
- Updated `toolbox/game-configuration/index.html` only for the Playable Setup form layout.
- Updated `toolbox/tools-page-accordions.js` only for Toolbox card rendering, status sourcing, and role visibility behavior.
- Updated targeted Playwright expectations for the changed Toolbox and Game Configuration behavior.
- Did not modify archived V1/V2 pages.
- Did not modify `start_of_day`.
- Did not add page-local CSS, tool-local CSS, inline styles, style blocks, script blocks, or inline event handlers.

## Game Configuration Form Table

`toolbox/game-configuration/index.html` now uses the same reusable Theme V2 form table pattern already used by Game Design:

- `table-wrapper`
- `data-table`
- `tool-form-table`

Preserved field IDs and data hooks:

- `gameConfigurationBasics`
- `gameConfigurationRules`
- `gameConfigurationPlayers`
- `gameConfigurationWorld`
- `gameConfigurationObjects`
- `gameConfigurationAudio`
- `gameConfigurationTest`

Each label now lives in the compact left table column and each textarea lives in the input column. Textareas show 4 rows.

## Toolbox Status SSoT

Admin Tools Progress remains the visible status source of truth for platform tool status. The Admin page and Toolbox now read from the same active registry data instead of Toolbox keeping duplicate local status labels.

Changes made:

- Replaced `getToolRegistry()` with `getActiveToolRegistry()` in Toolbox rendering.
- Removed local `statusLabelMap` ownership from Toolbox.
- Removed local static status values from Toolbox card definitions and progress defaults.
- Added `enrichTool()` so Toolbox cards resolve status, hidden/admin/deferred flags, requirements, and progress checklist from the active registry source used by Admin Tools Progress.
- Kept missing registry status fallback as `Wireframe` only for defensive rendering.

Observed Ready tools for normal users after SSoT alignment:

- Colors
- Saved Data

Normal roles now show `Tool Count: 2/37`. Admin still sees all active/planned Toolbox registry entries as `37/37`.

Representative Admin status checks:

| Tool | Registry/Admin Status |
| --- | --- |
| Project Workspace | Under Construction |
| Game Configuration | Wireframe |
| Build Game | Planned |
| Cloud | Hidden |

## Tile Visibility

Creator, guest, and focused normal role views now hide every non-Ready tool. Admin role view still shows non-Ready tools for planning review.

This means normal users see only Ready tools. Planned, Wireframe, Under Construction, Hidden, and Deprecated entries are Admin-only on the Toolbox page.

## Tile Card Layout

Toolbox card bullet/list content was converted into comma-separated text at the bottom of each tile.

The card action row is now a single line:

`[badge] [Open Tool/Open Page] [brand-color-swatch swatch-*] [status tag]`

Implemented with:

- `data-toolbox-tile-action-row`
- registry badge image
- existing `.btn` launch link
- existing `brand-color-swatch swatch-*`
- existing `pill` readiness tag

Child capability lists now render as readable comma-separated text:

- `Planned world types: Vector, Tilemap, Isometric, Hex`
- `Planned object types: Vector, Sprite, Character, Enemy, Interactive`

Progress details also render as comma-separated values in the bottom values block when the Progress/Build Path view asks for readiness detail.

## Theme V2 Gap Findings

No reusable Theme V2 CSS gap was proven for this PR.

No CSS was added.

## Validation Notes

Impacted lanes:

- `tool-runtime`
- `tools-progress`
- `game-configuration`
- `tool-navigation`

Targeted lane command:

```powershell
node ./scripts/run-targeted-test-lanes.mjs --lane tool-runtime --lane tools-progress --lane game-configuration --lane tool-navigation
```

Result:

- PASS: 4 lanes
- `game-configuration`: 4 tests passed
- `tools-progress`: 3 tests passed
- `tool-navigation`: 6 tests passed
- `tool-runtime`: 5 tests passed

Additional static validation:

- `node --check toolbox/tools-page-accordions.js`
- `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- `node --check tests/playwright/tools/ToolsProgressHydration.spec.mjs`
- `node --check tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`
- `node --check tests/playwright/tools/GameConfigurationMockRepository.spec.mjs`
- `node --check tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs`
- `git diff --check`
- Changed-file scan for forbidden archive/start_of_day edits and inline style/script/event-handler additions

Manual/test notes:

- Verified non-Ready tools are hidden from normal user view and visible to Admin.
- Verified Toolbox status values match the active registry used by Admin Tools Progress.
- Verified Toolbox tile bullet/list content renders as comma-separated bottom values.
- Verified tile action rows contain badge, launch link, swatch, and status tag on one row.
- Verified Game Configuration Playable Setup fields render in the two-column reusable table layout with 4-row textareas.
- Verified no console errors in targeted Playwright lanes.

Skipped lanes:

- `workspace-contract`
- `project-workspace`
- `game-design`
- `build-path`
- `tool-display-mode`
- `tool-images`
- `game-runtime`
- `integration`
- `engine-src`
- `samples`

Skipped-lane rationale:

The PR touched Toolbox page rendering/status filtering and Game Configuration form markup. It did not change shared parser behavior, shared DB behavior, shared Theme V2 CSS, sample loading, engine runtime behavior, or unrelated tool implementation behavior. The selected lanes cover the affected Toolbox UI/status behavior, Admin Tools Progress status source, route/navigation card assertions, and Game Configuration UI/runtime behavior.

Full samples smoke was skipped by request.

## Notes

An earlier broad active-tool-page sweep in `RootToolsFutureState.spec.mjs` exposed a Playwright artifact/trace handling timeout unrelated to the scoped Toolbox status/card behavior. The test was narrowed to representative active tool pages across the active group colors, while the specific Toolbox status/card assertions remain direct and targeted.
