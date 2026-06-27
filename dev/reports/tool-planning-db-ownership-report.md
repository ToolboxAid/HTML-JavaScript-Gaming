# PR_26160_071 Tool Planning DB Ownership Report

## Branch Validation

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| Current git branch | `main` | `main` | PASS |

## Ownership Summary

| Data Area | DB Table / Contract | Owned Fields |
| --- | --- | --- |
| Tool Metadata | `toolbox_tool_metadata` via `/api/toolbox/registry/snapshot` and `/api/toolbox/votes/snapshot` | Identity, display, routing, grouping, state, and order: `toolKey`, `toolName`, labels/descriptions, `group`, `category`, `colorGroup`, `toolboxGroup`, `path`, `order`, `status`, images, visibility/access fields. |
| Tool Planning | `toolbox_tool_planning`, merged into `/api/toolbox/registry/snapshot` | Readiness/dependency/checklist data: `readiness`, `requiredForPlayable`, `requiredForTestable`, `requiredForPublish`, `requires`, `progressChecklist`. |
| Tool Voting | `toolbox_votes` via `/api/toolbox/votes/snapshot` | Vote totals and current-user vote state: `toolId`, `userKey`, `direction`, computed up/down/total/percent/current vote. |

## Implementation Notes

- Added DB-backed `toolbox_tool_planning` schema in `src/dev-runtime/persistence/mock-db-store.js`.
- Seeded one planning row per active tool in `src/dev-runtime/guest-seeds/tool-state-samples.js`.
- Removed planning fields from `toolbox_tool_metadata` schema and seed rows.
- Updated `src/dev-runtime/server/mock-api-router.mjs` to:
  - populate/sync planning rows from the dev inventory;
  - migrate old planning values out of existing metadata rows when present;
  - strip planning fields from active metadata rows after planning rows are populated;
  - merge planning rows into the existing registry snapshot API so Toolbox behavior remains unchanged.
- Kept Admin Tool Votes unchanged for users: order/group/path/status/votes still come from metadata/vote contracts.

## API / DB Probe Evidence

```json
{
  "activeTools": 43,
  "voteRows": 43,
  "metadataRows": 43,
  "planningRows": 43,
  "metadataHasPlanning": false,
  "planningSchemaHasFields": true,
  "metadataSchemaHasPlanning": false,
  "colorsPlanningSource": "toolbox_tool_planning",
  "colorsRequiredForPublish": true,
  "hasMidi": true,
  "hasMusic": true,
  "platformToolboxGroup": "Admin"
}
```

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Create DB-backed Tool Planning ownership for `requiredForTestable`. | PASS | `toolbox_tool_planning` schema/seed/API merge owns `requiredForTestable`; Playwright asserts registry values merge from planning. |
| Create DB-backed Tool Planning ownership for `requiredForPublish`. | PASS | `toolbox_tool_planning` schema/seed/API merge owns `requiredForPublish`; Colors registry snapshot still exposes `requiredForPublish: true`. |
| Create DB-backed Tool Planning ownership for `requires`. | PASS | `toolbox_tool_planning` schema/seed/API merge owns `requires`; registry snapshot keeps an array for existing UI behavior. |
| Create DB-backed Tool Planning ownership for `progressChecklist`. | PASS | `toolbox_tool_planning` schema/seed/API merge owns `progressChecklist`; registry snapshot keeps an array for existing UI behavior. |
| Keep Tool Metadata limited to identity, display, routing, grouping, state, and order. | PASS | `toolbox_tool_metadata` schema no longer includes planning fields; API probe reports `metadataHasPlanning: false`. |
| Add/update API service contract so Tool Planning data is read through Web UI -> API/Service Contract -> DB Adapter. | PASS | Existing `/api/toolbox/registry/snapshot` now merges DB-backed `toolbox_tool_planning` rows into tool records consumed by Toolbox. |
| Remove planning fields from active Tool Metadata rows after Tool Planning is populated. | PASS | Server sync migrates planning fields first and then strips `progressChecklist`, `readiness`, `requiredForPlayable`, `requiredForPublish`, `requiredForTestable`, and `requires` from metadata rows. |
| Keep Toolbox and Admin Tool Votes behavior unchanged. | PASS | Targeted Playwright lanes passed; Admin edits still update Toolbox after reload. |
| Do not use page-local arrays, hardcoded counts, or duplicated planning metadata. | PASS | Planning ownership is DB-backed; Toolbox still reads through API clients. Existing UI constants are display maps, not duplicated planning records. |
| Preserve 43-tool inventory, MIDI/Music separation, and Platform Settings Admin placement. | PASS | API probe confirms 43/43 rows, `hasMidi: true`, `hasMusic: true`, and `platformToolboxGroup: "Admin"`. |
| No inline script/style/event handlers. | PASS | No HTML was changed; JS remains external. |

## Validation

| Lane | Command | Result |
| --- | --- | --- |
| Changed-file syntax | `node --check` on changed JS/MJS files | PASS |
| Static diff whitespace | `git diff --check` | PASS |
| DB adapter/API probe | Node probe against `/api/toolbox/registry/snapshot`, `/api/toolbox/votes/snapshot`, and `/api/mock-db/snapshot` | PASS |
| Admin Tool Votes / Toolbox SSoT Playwright | `npx playwright test tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs --reporter=line` | PASS: 4/4 |
| Toolbox route/Admin menu Playwright | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --reporter=line` | PASS: 8/8 on rerun |

Validation note: the first `ToolboxRoutePages.spec.mjs` attempt encountered Playwright artifact zip `ENOENT` errors under `tmp/test-results` while writing trace artifacts. The clean rerun passed 8/8 without product-code changes.

## Impacted Lane

DB adapter/API, Toolbox, and Admin Tool Votes.

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | Safe to skip per request; this PR did not touch samples or shared sample loader/framework code. |
| Unrelated tool runtime lanes | Safe to skip; Toolbox consumes the same registry snapshot shape and targeted Toolbox/Admin validation passed. |

## Manual Test Notes

- Confirmed current branch was `main` before changes.
- Confirmed Tool Metadata rows no longer carry planning fields after registry snapshot sync.
- Confirmed Tool Planning rows preserve the planning fields and are merged into the Toolbox registry snapshot.
- Confirmed Admin Tool Votes still shows the 43 DB-backed tools and metadata edits still flow to Toolbox.
