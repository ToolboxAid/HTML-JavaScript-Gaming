# PR_26160_088 MVP Path Validation And Status Alignment Report

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch is `main` | PASS | `git branch --show-current` returned `main`. |
| Expected branch is `main` | PASS | Main branch execution guard satisfied before edits. |
| Local branches found | PASS | `git branch --format "%(refname:short)"` returned `main`. |

## Implementation Summary

- Added authoritative `deprecated` release-channel governance to `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Added `deprecated` to the DB-backed Toolbox release-channel contract and compatibility stub.
- Marked Build Game as DB-backed `status: Deprecated` / `releaseChannel: deprecated`.
- Added a Theme V2 swatch mapping for deprecated status through the server toolbox contract.
- Updated Toolbox rendering so deprecated tools are supported, voteable, filterable, and opt-in visible for non-admin users.
- Updated targeted Playwright coverage for status counts, tooltips, Admin Tool Votes state editing, Build Path ordering, and MVP-path reconciliation.

## PR 085 Completion Review

| Requirement | Status | Evidence |
| --- | --- | --- |
| Add authoritative tool status governance | PASS | `docs_build/dev/PROJECT_INSTRUCTIONS.md` contains `## TOOL STATUS GOVERNANCE`. |
| Define `planned`, `wireframe`, `beta`, `complete` | PASS | Existing governance section defines all four statuses. |
| Add MVP UAT rule requiring beta or complete | PASS | Existing governance section states MVP-path tools must be `beta` or `complete` before UAT. |
| Preserve existing valid values | PASS | Existing values remain; PR088 adds `deprecated` as a new valid value. |

## PR 086 Completion Review

| Requirement | Status | Evidence |
| --- | --- | --- |
| Update Toolbox/Admin status tooltip hover text from governance | PASS | `src/dev-runtime/guest-seeds/tool-metadata-inventory.js` exports shared `TOOL_RELEASE_CHANNEL_HELP_TEXT`; `/api/toolbox/registry/snapshot` exposes it. |
| Tooltip appears in Toolbox Build Path | PASS | `toolbox/tools-page-accordions.js` uses release-channel help text on filter buttons and Build Path status cells. |
| Tooltip appears in Admin Tool Votes | PASS | `admin/tool-votes.js` consumes the same contract; targeted `ToolboxAdminMetadataSsot` and `ToolboxRoutePages` Playwright lanes passed. |
| Avoid duplicate hardcoded definitions where shared metadata exists | PASS | Runtime source remains the shared toolbox contract; `toolbox/toolRegistry.js` remains compatibility-only. |

## PR 087 Completion Review

| Requirement | Status | Evidence |
| --- | --- | --- |
| Update DB-backed order for paddle + ball MVP path | PASS | API probe from `getActiveToolRegistry()` shows Project Workspace, Game Design, Colors, Assets, Game Configuration, Objects, Controls, Hitboxes, Events, Saved Data, Debug, Game Testing, Publish, Project Journey in the expected current DB-backed order. |
| Move Project Journey after Game Testing | PASS | Project Journey order is `14`, after Game Testing order `12` and Publish order `13`. |
| Include Publish in MVP path | PASS | Publish exists as DB-backed tool metadata at order `13`. |
| Move Particles group from Audio to Design | PASS | Targeted `ToolboxAdminMetadataSsot` validates Particles group is `Design`. |
| Preserve MIDI and Music as separate tools | PASS | Targeted `ToolboxAdminMetadataSsot` validates MIDI and Music remain separate Audio rows. |
| Ensure every MVP-path tool is beta or complete before UAT | FAIL for readiness, PASS for no false advancement | Current DB-backed MVP-path records still include planned/wireframe tools that lack evidence for beta. PR088 keeps those statuses honest and reports them as UAT blockers instead of advancing without evidence. |

## Deprecated Status Alignment

| Requirement | Status | Evidence |
| --- | --- | --- |
| Add new status `deprecated` | PASS | `TOOL_RELEASE_CHANNELS` now includes `deprecated`; Admin Tool Votes state select includes Deprecated. |
| Add governance for deprecated status | PASS | `PROJECT_INSTRUCTIONS.md` defines: Tool remains supported but is not recommended for new workflows. Must remain deprecated before removal. |
| Mark Build Game deprecated if Publish + Project Journey now own responsibilities | PASS | `src/dev-runtime/guest-seeds/tool-metadata-inventory.js` marks Build Game `Deprecated` / `deprecated`. Build Game remains supported and opt-in visible. |
| Update Build Path counts to include deprecated | PASS | Targeted Playwright validates `Deprecated (1)` filter/count and Build Game visibility when selected. |
| Do not advance tool status without evidence | PASS | No planned/wireframe MVP-path tool was promoted. |

## MVP Path Reconciliation From DB-Backed Inventory

Source: `getActiveToolRegistry()` from `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`.

DB-backed inventory count: 43.

Release-channel counts:

| Status | Count |
| --- | ---: |
| planned | 33 |
| wireframe | 3 |
| beta | 5 |
| complete | 1 |
| deprecated | 1 |

Intended MVP-path count: 15.

Resolved MVP-path entries: 15.

Unique current tool records used: 14, because Vector Asset Studio is currently merged into Assets.

| Intended MVP Tool | Actual DB-Backed Tool Record | Mapping | Status | Valid Status | UAT Readiness |
| --- | --- | --- | --- | --- | --- |
| Project Workspace | Project Workspace | exact | beta | PASS | PASS |
| Game Design | Game Design | exact | beta | PASS | PASS |
| Colors | Colors | exact | complete | PASS | PASS |
| Assets | Assets | exact | beta | PASS | PASS |
| Vector Asset Studio | Assets | merged | beta | PASS | PASS through Assets vector ownership |
| Game Configuration | Game Configuration | exact | beta | PASS | PASS |
| Objects | Objects | exact | planned | PASS | BLOCKER |
| Controls | Controls | exact | planned | PASS | BLOCKER |
| Hitboxes | Hitboxes | exact | planned | PASS | BLOCKER |
| Events | Events | exact | planned | PASS | BLOCKER |
| Saved Data | Saved Data | exact | wireframe | PASS | BLOCKER |
| Debug | Debug | exact | planned | PASS | BLOCKER |
| Game Testing | Game Testing | exact | planned | PASS | BLOCKER |
| Publish | Publish | exact | planned | PASS | BLOCKER |
| Project Journey | Project Journey | exact | beta | PASS | PASS |

## Renamed/Merged/Missing Tool Report

| Requested Tool | Result | Evidence |
| --- | --- | --- |
| Vector Asset Studio | MERGED | No active DB-backed record or active route exists. Current Assets tool owns vector creation scope in its DB-backed description and status. |
| Objects | FOUND | DB-backed record exists with status `planned`. |
| Controls | FOUND | DB-backed record exists with status `planned`. |
| Hitboxes | FOUND | DB-backed record exists with status `planned`. |
| Events | FOUND | DB-backed record exists with status `planned`. |
| Publish | FOUND | DB-backed record exists with status `planned`. |
| Project Journey | FOUND | DB-backed record exists with status `beta`. |

No requested MVP-path entry is unresolved after applying the Vector Asset Studio -> Assets merge mapping.

## Validation

| Lane | Status | Notes |
| --- | --- | --- |
| Branch guard | PASS | Current branch `main`. |
| Changed-file syntax | PASS | `node --check` passed for changed JS and spec files. |
| API/DB inventory probe | PASS | Confirmed 43 tools, deprecated channel, Build Game deprecated, and 15 MVP-path mappings. |
| Toolbox/Admin Tool Votes Playwright | PASS | `npx playwright test tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs --reporter=line` passed 4/4 after standalone rerun. |
| Build Path Playwright | PASS | `npx playwright test tests/playwright/tools/BuildPathProgressSimplification.spec.mjs --reporter=line` passed 4/4. |
| Toolbox status/count/ordering Playwright | PASS | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --reporter=line` passed 8/8. |
| Static diff check | PASS | `git diff --check` passed with Windows line-ending warnings only before generated review artifacts were staged. Source/report files excluding generated `codex_review.diff` also passed `git diff --cached --check -- . ':!docs_build/dev/reports/codex_review.diff'`. |
| Playwright V8 coverage | PASS advisory | `docs_build/dev/reports/playwright_v8_coverage_report.txt` updated; `toolbox/tools-page-accordions.js` covered at 84%. Server/dev-runtime changed files are not browser-collected and are listed as advisory warnings. |

One parallel rerun of `ToolboxAdminMetadataSsot` hit a Playwright artifact cleanup race (`ENOENT` trace zip). The same lane was immediately rerun standalone and passed 4/4.

## Impacted Lanes

- Toolbox Build Path status counts and ordering.
- Admin Tool Votes status contract and state select.
- Toolbox tile status tooltips, deprecated visibility, and voting support.

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | Explicitly out of scope; no sample loader/framework changes. |
| Unrelated tool runtime lanes | PR changes are scoped to Toolbox/Admin Tool Votes status inventory and tests. |

## Manual Test Notes

- Deprecated tools are not default-visible for non-admin users.
- Selecting the Deprecated filter reveals Build Game as a supported but not recommended workflow.
- Build Game remains linkable and voteable; planned/wireframe MVP blockers were not promoted without evidence.
