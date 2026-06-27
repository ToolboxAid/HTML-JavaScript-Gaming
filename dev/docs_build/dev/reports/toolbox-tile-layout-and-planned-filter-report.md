# PR_26160_064-toolbox-tile-layout-and-planned-filter

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS

## Summary

- Split Toolbox tile action, group, and status into separate card lines.
- Preserved existing group colors and group assignments.
- Fixed Planned tile visibility for normal users when the Planned status filter is selected.
- Added regression coverage proving Planned (28) renders 28 planned tiles and Tool Count reflects visible cards.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Tile line 1 is badge icon and Open Tool/Planned Details action | PASS | `toolbox/tools-page-accordions.js` now keeps `createToolActionRow()` to badge + action link only; Playwright validates action row order. |
| Tile line 2 is group color marker and group name | PASS | `createToolCard()` now appends `createGroupLabel(tool.group)` as its own card child after the action row; Playwright validates group badge is not inside the action row. |
| Tile line 3 is status badge | PASS | `createToolCard()` appends `stateBadge` immediately after the group line; Playwright validates group and status are separate lines. |
| Do not render group and status on same line | PASS | Playwright checks the status badge top position is below the group badge top position. |
| Preserve group colors and assignments | PASS | No registry/group mapping files changed; existing group color/assignment Playwright validation passed. |
| Fix Planned filter regression | PASS | `baseVisibleForCreator()` now permits planned tools only when the Planned filter is active. |
| Tool Count reflects visible tiles when Planned is selected | PASS | Playwright validates `Tool Count: 38/38` after selecting Planned with default active non-planned filters. |
| Support multiple active status filters without hiding Planned tools | PASS | Existing multi-filter Build Path test passed; new normal tile assertion validates Planned + default filters show all 38 tiles. |
| Keep Complete as the only default active Build Path filter | PASS | Existing Build Path Playwright assertions still validate Complete-only default. |
| Add regression validation so Planned (28) displays 28 planned tiles | PASS | `tests/playwright/tools/ToolboxRoutePages.spec.mjs` asserts 28 planned tile cards after selecting Planned. |
| No inline script/style/event handlers | PASS | Static `rg` checks found no runtime/page inline additions; only existing Playwright source assertions matched. |

## Validation

- PASS: `node --check toolbox/tools-page-accordions.js`
- PASS: `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright` (8 passed)
- PASS: `git diff --check` (line-ending warning only, no whitespace errors)
- PASS: Inline handler/style/script scan on changed active Toolbox files.

## Impacted Lane

- Targeted Toolbox validation: Toolbox index tile layout, Planned status filtering, Tool Count, and multi-filter behavior.

## Skipped Lanes

- Full samples validation: skipped because no sample runtime or shared sample loader changed.
- Full repo smoke: skipped per request; targeted Toolbox coverage exercised the affected page behavior.

## Manual Test Notes

- Default Toolbox tile view still shows Wireframe, Beta, and Complete tools.
- Selecting Planned displays all 28 planned tools while keeping the default visible status filters active.
- Tile metadata now appears as action row, group row, then status row.
