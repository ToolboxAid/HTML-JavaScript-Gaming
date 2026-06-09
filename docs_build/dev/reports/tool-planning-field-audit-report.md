# PR_26160_070 Tool Planning Field Audit Report

## Branch Validation

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| Current git branch | `main` | `main` | PASS |

## Executive Summary

This PR is an audit/report-only pass. No runtime code was changed and no planning fields were removed.

The audited fields are still used as seed/schema/API/UI payload data, so removal is not safe in this PR. They are conceptually mis-owned in the current DB shape: `requiredForTestable`, `requiredForPublish`, `requires`, `progressChecklist`, and related `readiness` data belong in Tool Planning, not long-term Tool Metadata.

## One-Concept Ownership Recommendation

| Domain | Owns |
| --- | --- |
| Tool metadata | Identity, display, routing, grouping, state, and order. Examples: `toolKey`, `toolName`, `shortLabel`, `description`, `group`, `category`, `colorGroup`, `toolboxGroup`, `path`, `order`, `status`, `badge`, `toolImage`, visibility flags. |
| Tool planning | Readiness, dependencies, and checklist. Examples: `readiness`, `requiredForTestable`, `requiredForPublish`, `requires`, `progressChecklist`. |
| Tool voting | Vote totals and current user vote state. Examples: `toolId`, `userKey`, `direction`, computed up/down/total/percent/current vote. |

Recommended follow-up: introduce a DB-backed `toolbox_tool_planning` table keyed by `toolKey`, move planning fields there, and keep Toolbox/Admin reading through the same API/service contract so tool pages do not change when ownership moves.

## Field Audit

### `requiredForTestable`

| Audit Item | Finding |
| --- | --- |
| Current status | Used, duplicated between dev seed inventory and DB-backed metadata rows, should move to Tool Planning. |
| Where it is written | Per-tool seed records in `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`; DB seed rows in `src/dev-runtime/guest-seeds/tool-state-samples.js`; schema field in `src/dev-runtime/persistence/mock-db-store.js`; normalized/synced in `src/dev-runtime/server/mock-api-router.mjs`. |
| Where it is read | `getMissingToolRegistryFields()` and `applyToolRegistryMetadata()` in `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`; `defaultToolboxMetadata()` and `ensureToolboxToolMetadataRows()` in `src/dev-runtime/server/mock-api-router.mjs`; `enrichTool()` and `createToolValues()` in `toolbox/tools-page-accordions.js`. |
| Runtime behavior impact | Does not currently gate launching, filtering, voting, or Build Path ordering. It can indirectly affect seed inventory validity because missing required metadata marks records as incomplete/hidden in the dev seed inventory path. |
| UI display impact | `createToolValues()` has display text for testable/publish requirements, but the active Toolbox card render path does not currently pass `showReadiness`, so the value is not visibly displayed in normal Toolbox tiles today. |
| Ownership recommendation | Move to Tool Planning. Keep until a planning table/API exists. |

### `requiredForPublish`

| Audit Item | Finding |
| --- | --- |
| Current status | Used, duplicated between dev seed inventory and DB-backed metadata rows, should move to Tool Planning. |
| Where it is written | Per-tool seed records in `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`; DB seed rows in `src/dev-runtime/guest-seeds/tool-state-samples.js`; schema field in `src/dev-runtime/persistence/mock-db-store.js`; normalized/synced in `src/dev-runtime/server/mock-api-router.mjs`. |
| Where it is read | `getMissingToolRegistryFields()` and `applyToolRegistryMetadata()` in `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`; `defaultToolboxMetadata()` and `ensureToolboxToolMetadataRows()` in `src/dev-runtime/server/mock-api-router.mjs`; `enrichTool()` and `createToolValues()` in `toolbox/tools-page-accordions.js`. |
| Runtime behavior impact | Does not currently gate publishing, launching, filtering, voting, or Build Path ordering. It only participates in metadata completeness normalization. |
| UI display impact | Same dormant `createToolValues()` readiness display path as `requiredForTestable`; not visibly displayed in default Toolbox tiles today. |
| Ownership recommendation | Move to Tool Planning. Keep until a planning table/API exists. |

### `requires`

| Audit Item | Finding |
| --- | --- |
| Current status | Used, duplicated between dev seed inventory and DB-backed metadata rows, should move to Tool Planning. |
| Where it is written | Per-tool seed records in `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`; DB seed rows in `src/dev-runtime/guest-seeds/tool-state-samples.js`; schema field in `src/dev-runtime/persistence/mock-db-store.js`; normalized/synced in `src/dev-runtime/server/mock-api-router.mjs`. |
| Where it is read | `cloneToolRegistryEntry()`, `getMissingToolRegistryFields()`, and `applyToolRegistryMetadata()` in `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`; `defaultToolboxMetadata()` and `ensureToolboxToolMetadataRows()` in `src/dev-runtime/server/mock-api-router.mjs`; `enrichTool()` and `createToolValues()` in `toolbox/tools-page-accordions.js`. |
| Runtime behavior impact | Does not currently enforce dependency readiness, launch blocking, filter eligibility, voting, or ordering. It is carried as dependency/planning payload and used for completeness validation. |
| UI display impact | `createToolValues()` can display `Requires: ...`, but no active default Toolbox render path enables that readiness block today. |
| Ownership recommendation | Move to Tool Planning as dependency data. Keep until a planning table/API exists. |

### `progressChecklist`

| Audit Item | Finding |
| --- | --- |
| Current status | Used, duplicated between dev seed inventory and DB-backed metadata rows, should move to Tool Planning. |
| Where it is written | Per-tool seed records in `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`; DB seed rows in `src/dev-runtime/guest-seeds/tool-state-samples.js`; schema field in `src/dev-runtime/persistence/mock-db-store.js`; normalized/synced in `src/dev-runtime/server/mock-api-router.mjs`. |
| Where it is read | `cloneToolRegistryEntry()`, `getMissingToolRegistryFields()`, and `applyToolRegistryMetadata()` in `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`; `defaultToolboxMetadata()` and `ensureToolboxToolMetadataRows()` in `src/dev-runtime/server/mock-api-router.mjs`; `enrichTool()` and `createToolValues()` in `toolbox/tools-page-accordions.js`. |
| Runtime behavior impact | Does not currently affect launch, filtering, voting, order, status, or Build Path calculations. It is carried as planning/checklist payload and used for completeness validation. |
| UI display impact | `createToolValues()` can display checklist text, but no active default Toolbox card path enables that readiness block today. |
| Ownership recommendation | Move to Tool Planning as checklist/readiness data. Keep until a planning table/API exists. |

## Platform Settings / Inventory Verification

API probe evidence:

```json
{
  "activeTools": 43,
  "voteRows": 43,
  "hasMidi": true,
  "hasMusic": true,
  "platformSettings": {
    "adminOnly": true,
    "category": "Platform",
    "id": "platform-settings",
    "toolboxGroup": "Admin",
    "visibleInToolsList": false
  },
  "platformVoteRow": {
    "group": "Platform",
    "order": 43,
    "path": "toolbox/platform-settings/index.html",
    "status": "planned",
    "toolKey": "platform-settings",
    "toolName": "Platform Settings"
  }
}
```

| Requirement | Status | Evidence |
| --- | --- | --- |
| Preserve 43-tool inventory target. | PASS | API probe and `ToolboxAdminMetadataSsot.spec.mjs` show 43 registry tools and 43 vote rows. |
| Preserve MIDI and Music as separate tools. | PASS | API probe reports `hasMidi: true` and `hasMusic: true`. |
| Platform Settings present in DB-backed tool list. | PASS | API probe returned `platform-settings`; Tool Votes snapshot includes Platform Settings. |
| Platform Settings under Admin and not My Stuff. | PASS | API probe reports `toolboxGroup: "Admin"` and `adminOnly: true`; `ToolboxRoutePages.spec.mjs` validates the Admin menu list includes Platform Settings. |

## Validation

| Lane | Command | Result |
| --- | --- | --- |
| Branch guard | `git branch --show-current` | PASS: `main` |
| Static diff whitespace | `git diff --check` | PASS |
| API inventory probe | Node probe against `/api/toolbox/registry/snapshot` and `/api/toolbox/votes/snapshot` | PASS |
| Admin Tool Votes / Toolbox metadata Playwright | `npx playwright test tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs --reporter=line` | PASS: 4/4 |
| Toolbox route/Admin menu Playwright | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --reporter=line` | PASS: 8/8 on rerun |

Validation note: the first `ToolboxRoutePages.spec.mjs` attempt had one Playwright artifact/trace filesystem failure under `tmp/test-results` (`ENOENT` while opening a trace network artifact) and 7/8 tests passed. The clean rerun passed 8/8 with no product-code changes.

## Impacted Lane

Toolbox/Admin Tool Votes validation only.

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | Safe to skip per request; this audit did not touch samples or shared sample loader/framework code. |
| Unrelated tool runtime lanes | Safe to skip; this PR is an audit of Toolbox planning fields plus DB-backed inventory verification. |

## Manual Test Notes

- No runtime code was changed.
- No inline script, inline style, or inline event handlers were added.
- No audited fields were removed because each is still present in seed/schema/API/UI payload paths.
