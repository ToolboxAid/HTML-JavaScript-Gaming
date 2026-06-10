# PR_26160_080 Page-Local Product Data Audit

Generated: 2026-06-09

## Branch Validation

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| Current branch | `main` | `main` | PASS |

## Scope

Audited active page/browser-side product arrays, hardcoded counts, lookup maps, duplicated status/group/path/order data, and duplicated metadata. The audit focused on active Toolbox/Admin/Colors/Workspace browser files and did not migrate unrelated game/sample data.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Audit page-local product arrays, hardcoded counts, lookup maps, and duplicated metadata | PASS | Static scans and targeted file reads are summarized below. |
| Report violations by page/file | PASS | See `Findings By File`. |
| Migrate only safe active product data behind API/service contract | PASS | No safe scoped migration was found; deferred items need dedicated behavior PRs. |
| Leave unrelated game/sample data untouched | PASS | No game/sample data files were modified. |
| Produce per-PR reports, diff, changed files, validation notes, ZIP | PASS | Report and package artifacts generated for this PR. |

## SSoT Confirmation

| Area | Status | Evidence |
| --- | --- | --- |
| Toolbox metadata/order/group/path/status | PASS | `toolbox/tool-registry-api-client.js` reads `/api/toolbox/registry/snapshot`; `toolbox/tools-page-accordions.js` consumes that API snapshot and `readToolboxVoteSnapshot()`. |
| Admin Tool Votes metadata edits | PASS | `admin/tool-votes.js` writes through `updateToolboxVoteMetadata()` / `reorderToolboxVoteRows()` in `src/engine/api/toolbox-votes-api-client.js`. |
| Tool metadata DB adapter source | PASS | `src/dev-runtime/server/mock-api-router.mjs` builds registry/vote snapshots from `toolbox_tool_metadata`, `toolbox_tool_planning`, and `toolbox_votes`. |
| Hardcoded Toolbox counts | PASS | Static scan found no active hardcoded 43/42 Toolbox count in browser pages; `Tool Count` is computed in `toolbox/tools-page-accordions.js`. |

## Findings By File

| File | Finding | Classification | Runtime Effect | Recommendation |
| --- | --- | --- | --- | --- |
| `assets/theme-v2/js/gamefoundry-partials.js` | `routeMap`, `adminMainItems`, and `localAdminMyStuffItems` are browser-local navigation maps containing Toolbox/Admin route metadata. | DEFERRED VIOLATION | Drives header/partial route resolution and Admin menu rendering. | Move to a navigation/API or server-rendered partial contract in a focused navigation PR. Not migrated here because it touches every site header and local/admin route handling. |
| `toolbox/colors/colors.js` | `CURATED_PALETTE_COLLECTIONS` and `SUGGESTED_TAGS` are active browser-local Colors catalog data. | DEFERRED VIOLATION | Generates Colors picker swatches and tag help/typeahead. | Move to a Colors catalog/service contract in a focused Colors data PR. Not migrated here because it would change palette generation, names, variants, tag UX, and tests. |
| `toolbox/project-journey/project-journey.js` | `suggestionsByType` maps note types to suggested tool names in browser code. | DEFERRED VIOLATION | Affects Suggested Tools output for Project Journey notes. | Move guidance to Project Journey templates/server data so note type guidance is DB/API-owned. Not migrated here because it changes Project Journey guidance ownership. |
| `toolbox/project-workspace/project-workspace.js` | `CREATOR_USER_ID = "creator-user"` hardcodes the active project user. | DEFERRED VIOLATION | Scopes Project Workspace list/member behavior to a static demo user. | Move to session user from the auth/session API in a dedicated Workspace user-scoping PR. |
| `assets/theme-v2/js/account-achievements.js` | `CREATOR_USER_ID = "creator-user"` hardcodes the Achievements Build project source user. | DEFERRED VIOLATION | Scopes Achievements Build rows to static demo user data. | Move to session user from the auth/session API together with Project Workspace user scoping. |
| `toolbox/project-workspace/index.html` | Static table row references `creator-user`. | DEFERRED VIOLATION | Displays static demo user identity in the page. | Replace with API/session-driven project member display when Workspace user scoping is migrated. |
| `toolbox/toolRegistry.js` | Compatibility stub still defines release-channel constants/labels/help text while active pages use `tool-registry-api-client.js`. | WATCH | Does not own active 43-tool metadata; active browser pages do not import it for the Toolbox page. Some validation scripts still reference it. | Preserve until script/validation compatibility is cleaned up or converted to API-backed checks. |
| `src/dev-runtime/server/mock-api-router.mjs` | Contains release channel defaults, swatches, role-focus defaults, DB Viewer grouping constants. | ALLOWED SERVER/DEV CONTRACT | Server/dev API constructs contract data from DB-backed rows. | Keep. This is server/dev runtime, not page-local browser ownership. |
| `toolbox/tools-page-accordions.js` | Local arrays are derived from `toolboxContract` or current DOM controls; no hardcoded tool count/status/group map found. | PASS | Renders Toolbox from API snapshot and vote snapshot. | Keep. |
| `admin/tool-votes.js` | `GROUP_OPTIONS` and release state options are derived from `getToolboxContract()`. | PASS | Edits DB-backed tool metadata through API client. | Keep. |

## Safe Migration Decision

No product-data migration was made in PR_26160_080.

The remaining violations are real but not safe as a bundled cleanup because each changes a separate product behavior surface:

- navigation/header route ownership
- Colors curated catalog ownership
- Project Journey guidance ownership
- Workspace/Achievements session-user scoping

Those should become separate focused PRs.

## Validation

| Lane | Status | Command | Evidence |
| --- | --- | --- | --- |
| Branch guard | PASS | `git branch --show-current` | Returned `main`. |
| Active page-local array/lookup scan | PASS | `rg -n "const\s+[a-zA-Z0-9_]+\s*=\s*\[|const\s+[a-zA-Z0-9_]+\s*=\s*Object\.freeze\(\[|const\s+[a-zA-Z0-9_]+\s*=\s*\{" account admin toolbox assets/theme-v2/js --glob '!**/node_modules/**' --glob '!toolbox/colors/colors.js'` | Findings classified above. |
| Targeted product-data terms scan | PASS | `rg -n "creator-user\|suggestionsByType\|routeMap\|adminMainItems\|localAdminMyStuffItems\|CURATED_PALETTE_COLLECTIONS\|SUGGESTED_TAGS" account admin toolbox assets/theme-v2/js src/shared/toolbox` | Findings classified above. |
| Toolbox/Admin SSoT scan | PASS | `rg -n "\b(toolbox_tool_metadata\|toolbox_tool_planning\|toolbox_votes\|releaseChannel\|toolboxContract\|groupSwatches\|toolboxGroupOrder\|roleFocusTools)\b" toolbox admin src/engine/api src/dev-runtime/persistence` | Toolbox/Admin active pages use API/client data, not page-local metadata ownership. |
| Hardcoded count scan | PASS | `rg -n "\b43\b\|\b42\b\|Planned \(\|Wireframe \(\|Beta \(\|Complete \(\|Tool Count:\|toolCount\|statusCounts" toolbox admin src/engine/api src/dev-runtime` | No active hardcoded browser count; 42/43 appears only as seed inventory order values. |
| Static diff validation | PASS | `git diff --check` | No whitespace errors. |

## Skipped Lanes

| Lane | Status | Reason |
| --- | --- | --- |
| Playwright | SKIP | PR_080 is audit/report-only and does not change runtime or UI behavior. |
| Full samples validation | SKIP | Samples and sample loaders were not changed. |

## Manual Test Notes

No manual browser walkthrough was required. The audit confirms Toolbox/Admin metadata behavior remains API/DB-backed and documents deferred page-local product data ownership issues for future focused PRs.
