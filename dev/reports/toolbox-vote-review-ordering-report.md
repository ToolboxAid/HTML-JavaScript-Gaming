# PR_26160_060 Toolbox Vote Review Ordering

## Branch Validation

| Check | Expected | Actual | Status | Evidence |
| --- | --- | --- | --- | --- |
| Current git branch | main | main | PASS | `git branch --show-current` |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Preserve Toolbox order while normalizing order values to whole numbers. | PASS | `toolbox/toolRegistry.js` changes `project-journey` from `2.5` to `3` and shifts following visible tools forward without changing relative order. |
| Remove fractional order values such as `2.5`. | PASS | `node -e` registry check confirmed 38 visible tool orders are whole numbers; `rg` found no active `2.5` order in changed Toolbox/Admin/API files. |
| Replace editable Admin Vote Review order inputs with read-only order text. | PASS | `admin/tool-votes.html`; `admin/tool-votes.js` renders `data-toolbox-votes-order` cells and no longer creates `data-toolbox-votes-order-input`. Playwright asserts input count is 0. |
| Add drag/drop row ordering in Admin Vote Review. | PASS | `admin/tool-votes.js` adds row drag/drop handlers and calls `reorderToolboxVoteRows`. |
| Dropping a row updates affected order numbers to whole numbers. | PASS | `src/dev-runtime/server/mock-api-router.mjs` adds `reorderToolboxVoteRows()` and assigns `index + 1`; Playwright moved Build Game to order `2` and verified all persisted vote order rows are integers. |
| Add Votes Up and Votes Down count columns. | PASS | `admin/tool-votes.html` headers are `Votes Up` and `Votes Down`; Playwright verifies Build Game vote counts. |
| Make all Vote Review columns sortable. | PASS | All table headers use `data-toolbox-votes-sort`; `admin/tool-votes.js` updates `aria-sort`, active button styling, and sorted rows. |
| Allow drag/drop only when sorted by Order. | PASS | `admin/tool-votes.js` sets row `draggable` only when `sortState.key === "order"`; Playwright verifies non-Order sort disables dragging and Order sort enables it. |
| Non-Order sort disabled state is visually clear. | PASS | `admin/tool-votes.html` includes `data-toolbox-votes-drag-status`; Playwright verifies message changes to disabled while sorted by Tool. |
| No inline script/style/event handlers. | PASS | Changes use external `admin/tool-votes.js`; no inline handlers/styles were added. |

## Validation

| Lane | Command | Status |
| --- | --- | --- |
| Branch guard | `git branch --show-current` | PASS |
| Changed-file syntax | `node --check admin/tool-votes.js`; `node --check src/engine/api/toolbox-votes-api-client.js`; `node --check src/dev-runtime/server/mock-api-router.mjs`; `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs` | PASS |
| Toolbox/Admin Vote Review Playwright | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs -g "toolbox status kickers"` | PASS |
| Toolbox Build Path guardrail | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs -g "Build Path status filters"` | PASS |
| Registry whole-number order check | `node -e "...visible tool orders are whole numbers..."` | PASS |
| Static diff check | `git diff --check` | PASS with CRLF normalization warnings only |

## Impacted Lane

Toolbox/Admin Vote Review validation was impacted and run.

## Skipped Lanes

Full samples validation was skipped because this PR only changes Toolbox registry order, Toolbox vote API/client behavior, Admin Vote Review UI, and targeted Toolbox Playwright coverage. No shared sample loader/framework code changed.

## Manual Test Notes

- Admin Vote Review now shows read-only order values.
- Sorting by Tool disables row drag/drop and shows the disabled ordering message.
- Sorting by Order enables row drag/drop.
- Dragging Build Game before Project Workspace renumbers the server-backed order list with whole-number values.

## Artifact

- Repo-structured delta ZIP: `tmp/PR_26160_060-toolbox-vote-review-ordering_delta.zip`
