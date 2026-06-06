# Project Journey ULID DB Table Polish Report

PR: PR_26157_007-project-journey-ulid-db-table-polish

## Scope
- Updated Project Journey Statistics mini-stats so each value and label render inline.
- Removed Project Journey-only Status Legend callout markup and `statusLegend` runtime code.
- Preserved Admin Notes legend behavior; Admin Notes files were not modified.
- Updated Project Journey DB Viewer tables to preserve actual field casing and show a short `Key` column with full-key hover titles.
- Migrated Project Journey mock DB primary keys and relationship keys to ULID-style IDs.

## Implementation Notes
- Added reusable Theme V2 `.mini-stat--inline` for inline value/label mini-stat layout.
- Added reusable Theme V2 `.data-table--preserve-casing` because DB dump tables need exact field names such as `createdAt`, not uppercase headings.
- Project Journey mock records now use ULID-style primary keys for notes, note types, items, templates, activity, and the Project Journey project relationship key.
- Human-readable note/type/template descriptors are stored separately as names, `noteKey`, `typeKey`, or `templateKey`, not as primary keys.
- `demo-project` remains only as the Project Workspace route alias so existing workspace handoff URLs still work; Project Journey table `projectId` values use the ULID-style Project Journey key.
- Generated user note, note type, item, activity, and diagnostic records now receive ULID-style IDs.

## Verification
- Statistics tiles render `strong` and `span` on one row with no status/pill styling inside the tile.
- Project Journey Status Legend callout and `data-journey-status-legend` are removed from Project Journey.
- Admin Notes legend remains outside this PR scope and was not changed.
- DB Viewer headers display exact field casing.
- Every DB Viewer table has a `Key` column; the Key cell shows the last 8 characters and its `title` contains the complete primary key.
- Full primary key/id fields remain visible in each DB Viewer table.
- Project Journey mock primary keys match the ULID-style pattern and no seeded Project Journey primary key uses `activity-*`, `demo-project`, `note-*`, `item-*`, `template-*`, or `custom-type-*`.
- Relationship checks still report no missing links and no table bleed.

## Validation
- `node --check toolbox/project-journey/project-journey-mock-repository.js`
- `node --check toolbox/project-journey/project-journey.js`
- `node --check admin/db-viewer.js`
- `node --check tests/playwright/tools/ProjectJourneyTool.spec.mjs`
- `node --check tests/playwright/tools/AdminDbViewer.spec.mjs`
- `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs tests/playwright/tools/AdminDbViewer.spec.mjs --reporter=list --workers=1` - PASS, 12 passed.
- `npm run test:playwright:static -- --static-report docs_build/dev/reports/static_validation_report.md` - PASS.

## Skipped
- Full samples smoke was not run because this PR only affects Project Journey, Admin DB Viewer, targeted Theme V2 classes, and targeted tests.
