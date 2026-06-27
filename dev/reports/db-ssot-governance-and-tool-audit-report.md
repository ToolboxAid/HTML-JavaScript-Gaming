# PR_26160_068 DB SSoT Governance And Tool Audit

Date: 2026-06-09

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch is `main` | PASS | `git branch --show-current` returned `main`. |

## Governance Location

| Requirement | Status | Evidence |
| --- | --- | --- |
| Add DB-backed product data SSoT governance | PASS | `docs_build/dev/PROJECT_INSTRUCTIONS.md` now contains `## DB-BACKED PRODUCT DATA SSOT GOVERNANCE`. |
| Production flow is Web UI -> API/Service Contract -> Server DB | PASS | Governance section lists the allowed production flow. |
| Dev/UAT/test flow is Web UI -> API/Service Contract -> DB Adapter | PASS | Governance section lists DB Adapter options: MEM DB, Local DB, Test DB, Server DB. |
| Prohibited browser/page-local ownership is documented | PASS | Governance section prohibits page-local product arrays, metadata registries, hardcoded counts, duplicated status/group/path/order data, duplicated lookup maps, browser storage as product SSoT, UI-only vote/order/status state, and direct DB-shaped product data in HTML/browser JS. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Audit Toolbox/Admin tool metadata sources | PASS | Audit findings below identify fixed and deferred sources. |
| Move scoped Toolbox/Admin metadata into shared DB-backed source | PASS | `toolbox_tool_metadata` schema/seed/API now own `toolKey`, `toolName`, `group`, `path`, `order`, and `status`. |
| Seed DB-backed metadata from 43-tool inventory | PASS | API contract probe and Playwright verified 43 rows, including original inventory plus AI Assistant and restored Creator Learning. |
| Toolbox Build Path and Admin Tool Votes read same metadata | PASS | `ToolboxAdminMetadataSsot.spec.mjs` verifies Admin rows and Toolbox Build Path rows match the same API snapshot. |
| Admin edits affect Toolbox after reload | PASS | Playwright changes Creator Learning state in Admin Tool Votes and verifies Toolbox Build Path shows Beta after reload. |
| Environments, Users, Game Migration, Platform Settings included under Admin | PASS | Existing Admin menu source keeps all four in `ADMIN_MAIN_ITEMS`; `AdminPlatformToolsWireframes.spec.mjs` passed. |
| Game Migration not under My Stuff | PASS | `gamefoundry-partials.js` has Game Migration in main Admin items; My Stuff remains DB Viewer, Design System, Grouping Colors, Notes. |
| Do not migrate unrelated game/sample data | PASS | Changes are scoped to Toolbox/Admin metadata, docs, and tests. |
| Do not use inline script/style/event handlers | PASS | `rg --pcre2 "onclick=|onchange=|oninput=|<script(?![^>]+src)|<style[\\s>]" toolbox/index.html admin/tool-votes.html` returned no matches. |

## Metadata Inventory

| Item | Status | Evidence |
| --- | --- | --- |
| Total active tool metadata rows | PASS | API probe returned `count: 43`. |
| Status counts | PASS | API probe returned planned 33, wireframe 4, beta 5, complete 1. |
| Required restored/current tools | PASS | API/Playwright verified AI Assistant, Creator Learning, Users, Environments, Game Migration, and Platform Settings are present. |
| Key fields present | PASS | Playwright asserts every row has `toolKey`, `toolName`, `group`, `path`, whole-number `order`, and allowed `status`. |

## Audit Findings

| Finding | Status | Files |
| --- | --- | --- |
| Missing governance for DB-backed product data SSoT | FIXED | `docs_build/dev/PROJECT_INSTRUCTIONS.md` |
| `toolbox_tool_metadata` schema did not expose `toolKey` and `status` as first-class metadata fields | FIXED | `src/dev-runtime/persistence/mock-db-store.js` |
| Tool metadata seed covered only `visibleInToolsList` tools, omitting Admin tools | FIXED | `src/dev-runtime/guest-seeds/tool-state-samples.js` |
| Server Toolbox vote snapshot and metadata updates only considered visible public tools | FIXED | `src/dev-runtime/server/mock-api-router.mjs` |
| Toolbox Build Path counts/rows used public-visible registry rows only, not the Admin 43-tool metadata inventory | FIXED | `toolbox/tools-page-accordions.js` |
| Toolbox page contained an unused page-local `buildPathGroups` metadata array | FIXED | Removed from `toolbox/tools-page-accordions.js`. |
| Toolbox page had hardcoded `Tool Count: 0/0` placeholder | FIXED | `toolbox/index.html` now uses `Tool Count: loading`. |
| Admin Tool Votes read/write path only looked at `releaseChannel` | FIXED | `admin/tool-votes.js` now reads `status` first and submits `status` with compatibility `releaseChannel`. |
| Admin-only registry bucket was not included in Toolbox Admin card inventory | FIXED | `toolbox/tools-page-accordions.js` includes the `Admin` toolbox group for Admin sessions. |
| Previous tests encoded old public counts | FIXED | Targeted Toolbox Playwright expectations updated to 39 public / 43 admin inventory. |
| Static `toolbox/toolRegistry.js` remains as bootstrap route/image/default seed registry | DEFERRED | Runtime metadata now comes from DB-backed API rows, but full removal of the bootstrap registry is a larger server registry/data-source migration. Browser code consumes it through the `/api/toolbox/registry/snapshot` service client rather than direct static import. |
| Compatibility aliases `toolId` and `releaseChannel` remain in API rows | DEFERRED | Kept to avoid breaking existing vote rows and clients while `toolKey` and `status` become first-class metadata fields. |

## Validation

| Lane | Status | Command | Evidence |
| --- | --- | --- | --- |
| Branch guard | PASS | `git branch --show-current` | Returned `main`. |
| Changed JS syntax | PASS | `node --check` on changed JS/test files | All parsed successfully. |
| API contract probe | PASS | Inline Node mock API probe | Snapshot returned 43 rows and required tools; counts planned 33, wireframe 4, beta 5, complete 1. |
| Toolbox/Admin SSoT Playwright | PASS | `npx playwright test tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs` | 3 passed. |
| Adjacent Toolbox/Admin Playwright | PASS | `npx playwright test tests/playwright/tools/BuildPathProgressSimplification.spec.mjs tests/playwright/tools/ToolboxRoutePages.spec.mjs tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs` | 17 passed. |
| Static count/local metadata scan | PASS | `rg "Tool Count: [0-9]|Planned \\([0-9]+\\)|Wireframe \\([0-9]+\\)|Beta \\([0-9]+\\)|Complete \\([0-9]+\\)|buildPathGroups|sourceToolByTitle" toolbox admin src/dev-runtime` | No matches. |
| Inline handler/style scan | PASS | `rg --pcre2 "onclick=|onchange=|oninput=|<script(?![^>]+src)|<style[\\s>]" toolbox/index.html admin/tool-votes.html` | No matches. |
| Whitespace/static diff | PASS | `git diff --check` | No whitespace errors; Git printed line-ending warnings only. |

## Impacted Lane

Toolbox Build Path, Admin Tool Votes, shared dev mock API metadata, Toolbox registry seed data, governance docs, and targeted Playwright coverage.

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | This PR does not touch samples, sample loaders, playable game runtime, or shared sample framework code. |
| Broad all-Playwright suite | Targeted Toolbox/Admin lanes cover the changed UI/API behavior. |
| Unrelated game/sample DB migrations | Explicitly out of scope for this PR. |

## Manual Test Notes

No separate manual browser walkthrough was required beyond Playwright. The API probe and Playwright assertions verify the 43-row inventory, counts, Admin edit propagation, Admin menu placement, no page-local count usage, and no inline script/style/event handlers.
