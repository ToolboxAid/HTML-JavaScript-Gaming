# PR_26160_067 Admin Tool Vote Template Conversion Report

## Branch Validation

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| Current git branch | main | main | PASS |

## Requirement Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Convert Admin > Tool Votes from standalone page into Tool Template V2-based admin tool. | `admin/tool-votes.html` now uses `container--tool-wide`, `tool-workspace tool-workspace--wide`, left/right `tool-column` panels, `tool-center-panel`, and `tool-display-mode.js`. | PASS |
| Preserve Admin placement and left-column Admin navigation. | Left Admin Tools accordion keeps Tool Votes, Environments, Users, Game Migration, and Platform Settings with Tool Votes active. | PASS |
| Fullscreen keeps header and footer visible. | Reusable `tool-workspace--fullscreen-chrome` rules in `assets/theme-v2/css/layout.css`; Playwright asserts `header.site-header` and `footer.footer` visible in focus mode. | PASS |
| In fullscreen, only the data/table area should scroll. | Reusable `tool-workspace--table-scroll-focus` plus `tool-table-scroll-region`; Playwright asserts side/center panels are hidden overflow and table region owns `overflow-y:auto`. | PASS |
| Remove old page-specific table width controls. | Removed Expand Table Width, Standard table width, and old `data-toolbox-votes-expanded` CSS. Static search found no active page/script/CSS matches. | PASS |
| Remove old selected metadata controls. | Removed Selected Order, Selected Group, Selected Path, Group field, Path field, Status field, and Update Metadata from HTML/JS. Static search found no active page/script/CSS matches. | PASS |
| Keep table rows, votes, ordering, sorting, and tool links. | `admin/tool-votes.js` preserves row rendering, vote columns, drag/drop ordering, sort buttons, and tool link cells; Playwright verified row links, sorting, and drag/drop reorder. | PASS |
| Make State editable in the Tool Vote table. | `stateCell()` renders a row-level State `<select>` with `data-toolbox-votes-state`. | PASS |
| State values limited to planned, wireframe, beta, complete. | `RELEASE_CHANNEL_OPTIONS` contains only `planned`, `wireframe`, `beta`, `complete`; Playwright verifies the option labels. | PASS |
| State edits update same DB-backed metadata used by Toolbox Build Path. | State change calls `updateToolboxVoteMetadata()` with preserved group/path and new `releaseChannel`; Playwright changed Colors to beta and verified Toolbox Build Path used `toolbox_tool_metadata`. | PASS |
| Do not start Web > API > DB migration. | Only the existing `toolbox-votes-api-client.js` contract is consumed; no API route or DB migration files changed. | PASS |
| No inline script, inline style, or inline event handlers. | Static `rg --pcre2` check on changed active runtime files found no inline script/style/event attributes. | PASS |

## Impacted Lane

Targeted Admin Tool Vote validation only:
- `node --check admin/tool-votes.js`
- `node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`
- `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs --grep "Tool Votes"`
- `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --grep "toolbox status kickers"`
- `git diff --check`
- Static `rg` checks for removed controls and inline script/style/event handlers

## Skipped Lanes

Full samples validation was skipped as requested. No samples, shared sample loader, or sample runtime framework files changed.

## Manual Test Notes

The targeted Playwright lane verified the converted Tool Template V2 structure, Admin navigation, fullscreen chrome/table-scroll behavior, removed controls, editable State, sorting, ordering, and tool links. It also verified State edits flow into Toolbox Build Path through the existing DB-backed metadata source.
