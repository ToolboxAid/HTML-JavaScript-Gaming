# PR_26160_077 DB Viewer Table Classification Report

Generated: 2026-06-09

## Branch Validation

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch is `main` | PASS | `git branch --show-current` returned `main`. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Audit every DB Viewer table | PASS | See Full DB Viewer Table Classification. |
| Classify each table as active runtime, deprecated/history, empty schema-only, or remove candidate | PASS | Every table from `/api/mock-db/snapshot` is listed with row count and classification. |
| Ensure DB Viewer visually separates categories | PASS | `src/engine/api/mock-db-viewer-ui.js` table summaries now include `Active runtime data`, `Deprecated/history`, or `Empty schema-only`, with visible notes in each table body. |
| Run targeted DB Viewer and Colors validation only | PASS | DB Viewer and Colors Playwright lanes passed; no full samples lane was run. |
| Do not use inline script/style/event handlers | PASS | Changes are external JS/test/report only. |

## Classification Rules

| Classification | Rule |
| --- | --- |
| Active runtime data | Non-deprecated table with one or more records in the active DB adapter snapshot. |
| Deprecated/history | Table listed in DB Viewer `DEPRECATED_TABLE_NOTES`. Currently only `palette_source_swatches`. |
| Empty schema-only | Non-deprecated table with zero records; DB Viewer still shows headers for schema/readiness. |
| Remove candidate | No table currently qualifies. Removal requires a later proof-only audit showing no runtime, migration, or history dependency. |

## Full DB Viewer Table Classification

| Table | Row Count | Classification | Notes |
| --- | ---: | --- | --- |
| `asset_import_events` | 0 | Empty schema-only | Asset import event schema is visible, but no baseline records exist. |
| `asset_library_items` | 0 | Empty schema-only | Asset library schema is visible, but no baseline uploaded assets exist. |
| `asset_role_definitions` | 8 | Active runtime data | Asset tool role definitions. |
| `asset_storage_objects` | 0 | Empty schema-only | Asset storage schema is visible, but no baseline storage records exist. |
| `asset_validation_items` | 1 | Active runtime data | Asset validation/checklist data. |
| `game_configuration_records` | 0 | Empty schema-only | Game Configuration schema is visible, but no baseline configuration record exists. |
| `game_configuration_validation_items` | 1 | Active runtime data | Game Configuration validation/checklist data. |
| `game_design_documents` | 3 | Active runtime data | Game Design document records. |
| `game_design_validation_items` | 0 | Empty schema-only | Game Design validation schema is visible, but no baseline rows exist. |
| `palette_colors` | 0 | Empty schema-only | Active Colors table, empty until Project Swatches are added. |
| `palette_source_swatches` | 838 | Deprecated/history | Deprecated source history/reference data only; not active Colors runtime data. |
| `palette_swatch_usages` | 0 | Empty schema-only | Active usage-tracking table, empty until usage records are written. |
| `project_journey_activity` | 2 | Active runtime data | Project Journey activity records. |
| `project_journey_items` | 9 | Active runtime data | Project Journey note item records. |
| `project_journey_note_types` | 7 | Active runtime data | Project Journey note type records. |
| `project_journey_notes` | 4 | Active runtime data | Project Journey note records. |
| `project_journey_templates` | 9 | Active runtime data | Project Journey template SSoT records. |
| `project_workspace_palette_globals` | 1 | Active runtime data | Active Colors workspace metadata/global row. |
| `roles` | 4 | Active runtime data | Users/roles model data. |
| `tool_state_samples` | 47 | Active runtime data | Local/dev sample/tool state rows. |
| `toolbox_tool_metadata` | 43 | Active runtime data | Tool metadata SSoT rows. |
| `toolbox_tool_planning` | 43 | Active runtime data | Tool planning SSoT rows. |
| `toolbox_votes` | 0 | Empty schema-only | Vote schema is visible, but no baseline user votes exist. |
| `user_roles` | 7 | Active runtime data | Users/roles join rows. |
| `users` | 5 | Active runtime data | User rows; Guest remains unauthenticated state only. |
| `workspace_progress` | 1 | Active runtime data | Workspace progress record. |
| `workspace_projects` | 4 | Active runtime data | Workspace project records. |

## Remove Candidate Findings

No table is currently recommended for removal. `palette_source_swatches` remains deprecated/history because PR_076 intentionally kept it for migration/reference inspection in DB Viewer.

## Validation Evidence

| Lane | Status | Evidence |
| --- | --- | --- |
| Branch guard | PASS | `git branch --show-current` returned `main`. |
| Syntax checks | PASS | `node --check src/engine/api/mock-db-viewer-ui.js`; `node --check tests/playwright/tools/AdminDbViewer.spec.mjs`. |
| DB snapshot audit | PASS | Inline Node/server probe listed every table, row count, and classification from `/api/mock-db/snapshot`. |
| DB Viewer Playwright | PASS | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --reporter=line` -> 7 passed. |
| Colors Playwright | PASS | `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs --reporter=line` -> 9 passed. |
| Static validation | PASS | `git diff --check` passed with line-ending warnings only. |

## Impacted Lanes

- Admin DB Viewer runtime/UI lane.
- Colors runtime/UI validation lane.
- Changed-file syntax/static lane.

## Skipped Lanes

| Lane | Reason |
| --- | --- |
| Full samples validation | Samples and sample loaders were not touched. |
| Unrelated Toolbox/Admin metadata migration | Out of scope for this DB Viewer table classification PR. |

## Manual Test Notes

No manual browser walkthrough was required. The targeted DB Viewer Playwright assertions prove visible category separation, and the Colors lane verifies grid behavior remains unchanged.
