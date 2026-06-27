# PR_26160_065 Toolbox Vote Review SSoT Report

## Branch validation

| Check | Result | Evidence |
| --- | --- | --- |
| Current branch is `main` before changes | PASS | `git branch --show-current` returned `main`. |

## Requirement checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Remove `admin/tools-progress.html` and active navigation links | PASS | Removed `admin/tools-progress.html`, `admin/tools-progress.js`, `admin-tools-progress` route mapping, and local Admin menu entry. Static search only finds negative Playwright assertions. |
| Audit the old 42-tool Tools Progress list before removal | PASS | `getActiveToolRegistry()` source used by the old page returned 42 active tools. Current visible Toolbox/Vote Review list returned 38 tools. |
| Report missing tools from the current list | PASS | Missing tools are listed in the comparison section below. |
| Verify one SSoT for tool order, group, path, status, and vote metadata | PASS | `toolbox_tool_metadata` owns order/group/path/release channel fields; `toolbox_votes` owns per-user vote direction. `toolbox_vote_order` is removed from active schema/seed/API use. |
| Make Admin > Tool Votes / Vote Review the SSoT used by Toolbox Build Path | PASS | `admin/tool-votes.js` writes metadata through `/api/toolbox/votes/metadata`; `toolbox/tools-page-accordions.js` reads Build Path order/group/path/status from the vote snapshot metadata rows. |
| Vote Review edits affect Toolbox Build Path ordering/group/path/status after reload | PASS | Playwright updates Colors metadata in Admin Tool Votes, reloads Toolbox Build Path, and verifies `data-build-path-group`, `data-build-path-path`, `data-build-path-release-channel`, and link href. |
| Grouping is stored in database-backed tool metadata | PASS | Seed/API now include `toolbox_tool_metadata.group`; Toolbox renders groups from the metadata-backed vote snapshot rather than a separate Toolbox hardcode for Build Path. |
| Remove or stop using duplicate tool metadata sources when safe | PASS | Removed active `toolbox_vote_order` schema/seed/API path and retired Tools Progress page/tests that duplicated the active tool list surface. Registry remains only as seed/default source for missing metadata rows. |
| Do not change visual styling beyond required SSoT behavior | PASS | Only form controls needed to edit metadata in Admin Tool Votes were added. No CSS changes. |
| No inline script/style/event handlers | PASS | Targeted HTML guard for `admin/tool-votes.html` and `toolbox/index.html` found no inline script/style/event-handler matches. |

## 42-tool comparison

Old Tools Progress source:
- `admin/tools-progress.js` rendered from `getActiveToolRegistry()`.
- Count before removal: 42 active registry tools.

Current Toolbox/Vote Review source:
- Visible Toolbox/Vote Review rows are registry tools where `visibleInToolsList === true`, backed by `toolbox_tool_metadata`.
- Count: 38 visible tools.

Tools present in the old 42-tool registry list but missing from the current visible Toolbox/Vote Review list:

| Tool | Registry id | Registry group | Status | Reason |
| --- | --- | --- | --- | --- |
| Users | `users` | Admin / Platform | Planned | `visibleInToolsList: false`, admin-only hidden planned tool. |
| Environments | `environments` | Admin / Platform | Planned | `visibleInToolsList: false`, admin-only hidden planned tool. |
| Game Migration | `game-migration` | Admin / Platform | Planned | `visibleInToolsList: false`, admin-only hidden planned tool. |
| Platform Settings | `platform-settings` | Admin / Platform | Planned | `visibleInToolsList: false`, admin-only hidden planned tool. |

## SSoT source confirmation

Current SSoT tables:
- `toolbox_tool_metadata`: tool id/name/order/group/path/releaseChannel/releaseChannelLabel/audit fields.
- `toolbox_votes`: current user vote direction and all-user vote counts.

Data flow:
- Local seed creates `toolbox_tool_metadata` from the active visible registry.
- Server API `/api/toolbox/votes/snapshot` ensures missing metadata rows and returns the combined metadata/vote snapshot.
- Admin Tool Votes updates metadata through `/api/toolbox/votes/metadata`.
- Toolbox Build Path consumes the same snapshot and renders metadata-backed order/group/path/status.

Registry role:
- The registry remains the bootstrapping/default source for new rows and route/image details.
- It is no longer a separate active Build Path metadata authority for order/group/path/status once `toolbox_tool_metadata` exists.

## Validation evidence

| Lane | Command | Result |
| --- | --- | --- |
| Branch guard | `git branch --show-current` | PASS, `main`. |
| Changed JS syntax | `node --check` on changed JS/MJS files | PASS. |
| Static diff check | `git diff --check -- <PR_26160_065 scoped files>` | PASS, line-ending warnings only. |
| Removed page/link audit | `rg -n "admin-tools-progress|tools-progress|Tools Progress|data-tools-progress" admin assets src toolbox tests docs_build/dev/toolbox` | PASS, only negative assertions remain. |
| Removed duplicate table audit | `rg -n "toolbox_vote_order|toolboxVoteOrder" src admin toolbox tests` | PASS, no matches. |
| Inline guard | Node scan for inline `<script>`, `<style>`, event handlers, and `style=` in changed active HTML | PASS. |
| Targeted Playwright | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs tests/playwright/tools/BuildPathProgressSimplification.spec.mjs` | PASS, 12/12. |

## Impacted lane

- Admin Tool Votes / Vote Review.
- Toolbox Build Path.

## Skipped lanes

- Full samples validation: skipped because this PR only changes Toolbox/Admin metadata surfaces and does not touch shared sample loading/runtime.
- Full repo Playwright: skipped per request; targeted Admin Tool Votes and Toolbox Build Path lanes passed.

## Manual notes

- The working tree already contained unrelated Admin Notes deletions/untracked files. They were not reverted and are excluded from this PR report/ZIP scope.
- SQLite experimental warnings appeared during Playwright, but the targeted tests passed and no repo-owned console/page failures were reported.
