# PR_26160_072 Toolbox DB Contract Enforcement Report

Generated: 2026-06-09

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch | PASS | `git branch --show-current` returned `main`. |
| Expected branch | PASS | Required branch is `main`. |
| Local branches found | PASS | `git branch --list` returned `* main`. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Audit active Toolbox/Admin pages for UI-owned product arrays, counts, maps, status/group/path/order duplication, and browser-storage SSoT use. | PASS | Static scans covered `toolbox/`, `admin/`, `src/engine/api`, and `src/dev-runtime/server/mock-api-router.mjs`. Active local status/group arrays were found in `toolbox/tools-page-accordions.js` and `admin/tool-votes.js`; no active `localStorage`/`sessionStorage` product SSoT matches were found. |
| Move remaining Toolbox/Admin product data reads/writes behind API/service contract backed by DB adapter. | PASS | `src/dev-runtime/server/mock-api-router.mjs` now returns `toolboxContract` from `/api/toolbox/registry/snapshot`; `toolbox/tool-registry-api-client.js` exposes `getToolboxContract()`; `toolbox/tools-page-accordions.js` and `admin/tool-votes.js` consume that contract. |
| Ensure Tool Metadata flows through Web UI -> API/Service Contract -> DB Adapter. | PASS | `/api/toolbox/registry/snapshot` and `/api/toolbox/votes/snapshot` read `toolbox_tool_metadata`; Playwright verified 43 metadata rows and Admin edits reflected in Toolbox after reload. |
| Ensure Tool Planning flows through Web UI -> API/Service Contract -> DB Adapter. | PASS | `ToolboxAdminMetadataSsot.spec.mjs` verifies planning fields are absent from `toolbox_tool_metadata`, present in `toolbox_tool_planning`, and merged into registry tools as `planningSource: toolbox_tool_planning`. |
| Ensure Tool Voting flows through Web UI -> API/Service Contract -> DB Adapter. | PASS | `admin/tool-votes.js` continues to call `readToolboxVoteSnapshot`, `updateToolboxVoteMetadata`, and `reorderToolboxVoteRows`; Playwright verified vote rows and Admin/Toolbox parity. |
| Ensure Tool Order flows through Web UI -> API/Service Contract -> DB Adapter. | PASS | Admin reorder API remains `/api/toolbox/votes/order-list`; Playwright verified order changes propagate to Toolbox Build Path after reload. |
| Keep Toolbox and Admin Tool Votes behavior unchanged. | PASS | `ToolboxAdminMetadataSsot.spec.mjs` passed 4/4; `ToolboxRoutePages.spec.mjs` passed 8/8. |
| Do not migrate unrelated game/sample data. | PASS | Changes are limited to Toolbox/Admin contract wiring, one targeted Playwright spec, and generated reports. |
| Do not use inline script/style/event handlers. | PASS | No changed file adds inline script, inline style, or inline event handlers. |

## Remaining UI-Owned Data Audit

| Area | Finding | Status | Action |
| --- | --- | --- | --- |
| Toolbox status/default filters | Page-local arrays previously owned release channels and defaults. | PASS | Moved to `toolboxContract.releaseChannels` and `toolboxContract.defaultReleaseChannels`. |
| Toolbox status labels/help/swatches | Page-local maps previously duplicated release labels/help and state swatches. | PASS | Moved to `toolboxContract.releaseChannelLabels`, `releaseChannelHelpText`, and `releaseChannelSwatches`. |
| Toolbox group order/swatches | Page-local group order and group swatch maps duplicated DB-backed metadata. | PASS | `toolboxContract.toolboxGroupOrder`, `groups`, and `groupSwatches` are derived from active registry tools. |
| Toolbox role focus lists | Page-local role focus lists were UI-owned product display data. | PASS | Moved behind the registry API contract as `toolboxContract.roleFocusTools`. |
| Admin Tool Votes state/group editors | Page-local status and group option arrays duplicated registry metadata. | PASS | Admin now uses `getToolboxContract()` for status labels and group options. |
| Hardcoded counts | No active source hardcoded visible Toolbox counts. Test constants remain validation expectations only. | PASS | `Tool Count` is computed at runtime; Playwright verifies DB-backed counts. |
| Browser storage SSoT | No active Toolbox/Admin product SSoT use of `localStorage` or `sessionStorage` found. | PASS | Session/storage test helpers are validation-only. |
| `toolbox/toolRegistry.js` compatibility shell | Not loaded by active Toolbox/Admin pages; retained as a compatibility stub for older tests/scripts. | PASS | Existing Playwright test asserts active pages do not request `/toolbox/toolRegistry.js`. |

## Validation

| Lane | Status | Command | Evidence |
| --- | --- | --- | --- |
| Branch guard | PASS | `git branch --show-current` | Returned `main`. |
| Changed JS syntax | PASS | `node --check` for changed JS/spec files | `admin/tool-votes.js`, `toolbox/tool-registry-api-client.js`, `toolbox/tools-page-accordions.js`, `src/dev-runtime/server/mock-api-router.mjs`, and `ToolboxAdminMetadataSsot.spec.mjs` all parsed. |
| DB/API contract probe | PASS | Inline Node server probe | Registry returned 43 active tools, votes returned 43 rows, metadata/planning returned 43 rows each, and contract defaults were present. |
| Toolbox/Admin Tool Votes Playwright | PASS | `npx playwright test tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs --reporter=line` | 4 passed. |
| Toolbox route/UI Playwright | PASS | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --reporter=line` | 8 passed. |
| Static whitespace | PASS | `git diff --check` | No whitespace errors; Git printed line-ending warnings only. |
| V8 coverage | PASS | Playwright reporter output | `playwright_v8_coverage_report.txt` updated; changed browser files covered at 89%, 92%, and 96%. |

## Impacted Lane

- Toolbox/Admin Tool Votes DB contract and UI behavior.

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | This PR does not touch sample loaders, game runtime, or shared sample framework behavior. |
| Unrelated game/sample DB migration lanes | Request is scoped to Toolbox/Admin tool metadata, planning, voting, and order contracts. |
| Broad all-Playwright suite | Targeted Toolbox/Admin lanes cover the changed service contract and active UI surfaces. |

## Manual Test Notes

No extra manual browser walkthrough was required. Targeted Playwright covered 43-tool inventory, planning load, votes, order, status/group metadata, filters, admin edits, and reload behavior.
