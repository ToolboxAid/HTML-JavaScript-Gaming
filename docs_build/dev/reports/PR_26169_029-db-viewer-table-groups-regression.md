# PR_26169_029 DB Viewer Table Groups Regression Report

## Summary

Restored Admin DB Viewer rendering for configured product data snapshots. The viewer now receives schema-backed table arrays and viewer groups even when individual configured database tables are missing, and it displays those missing-table issues as visible source diagnostics instead of falling into the generic Configured Data load-error state.

## Root Cause

The DB Viewer page, route, script imports, and Admin navigation route were intact. PR_26169_023 and PR_26169_027/028 did not replace the DB Viewer route or point navigation at the wrong page.

The regression was caused by the configured DB snapshot path. `admin/db-viewer.js` correctly loaded `src/api/db-viewer-ui.js`, but `/api/product-data/snapshot` called the shared Supabase/Postgres adapter snapshot. That adapter used an all-or-nothing table read, so one missing configured table, observed locally as `membership_limits`, rejected the entire snapshot. The UI then rendered its load-error path, which left the page as the generic Configured Data shell with no filters, table groups, table list, schemas, or relationship diagnostics.

## Changes

- Updated `SupabasePostgresProviderAdapter.getDbViewerSnapshot()` to keep DB Viewer reads schema-aware when a configured table is missing.
- Added table-level `DB_VIEWER_TABLE_UNAVAILABLE` diagnostics for recoverable per-table read failures.
- Preserved fatal behavior for missing/unreachable configured DB sources such as missing server config, connection failure, authentication failure, or timeout.
- Passed configured DB table diagnostics through `/api/product-data/snapshot`.
- Updated DB Viewer UI provider display to honor server-provided `supabase-postgres` provider metadata.
- Rendered configured-source diagnostics in the DB Inspector diagnostics panel while keeping existing audit, bleed, stale-display, and relationship checks.
- Added targeted Node and Playwright coverage for configured DB Viewer snapshots, missing-table diagnostics, empty schema-known sources, and snapshot-load failure diagnostics.

## Requirement Checklist

| Requirement | Status | Notes |
| --- | --- | --- |
| Restore DB Viewer initialization | PASS | Existing route/script load path remained intact; snapshot failure no longer collapses initialization. |
| Restore table group rendering | PASS | `/api/product-data/snapshot` now returns `viewerGroups` even with missing configured tables. |
| Restore configured table listing | PASS | Snapshot maps all shared schema tables to arrays, using empty arrays for unavailable tables. |
| Restore schemas/relationships/diagnostics | PASS | Schema headers remain visible; relationship and existing diagnostics still render. |
| Keep DB Viewer under Admin | PASS | No navigation or route move was made. |
| Do not move DB Viewer to Owner | PASS | Owner navigation untouched. |
| Do not create generic configured-data placeholder | PASS | Provider-aware UI shows `Supabase Postgres` and table groups. |
| Do not hardcode table lists page-locally | PASS | Runtime table list still comes from shared schemas and adapter snapshot; test fixtures only provide deterministic payloads. |
| Read from shared DB adapter/source of truth | PASS | Fix is in `SupabasePostgresProviderAdapter` and `/api/product-data/snapshot`. |
| Missing DB adapter/source visible diagnostic | PASS | Fatal source failures still render visible configured-source load diagnostics. |
| Empty DB source shows meaningful schema state | PASS | Empty arrays render table headers and empty-state text. |
| Preserve Admin/Owner navigation SSoT | PASS | Navigation files were not changed. |
| Avoid unrelated domains | PASS | Memberships, marketplace, AI credits, legal, notes, storage, and Admin/Owner menus were not changed. |

## Validation

- PASS: `git branch --show-current` -> `main`
- PASS: `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --check src/api/db-viewer-ui.js`
- PASS: `node --check tests/dev-runtime/DbViewerConfiguredSnapshot.test.mjs`
- PASS: `node --check tests/playwright/tools/AdminDbViewer.spec.mjs`
- PASS: `node --test tests/dev-runtime/DbViewerConfiguredSnapshot.test.mjs`
- PASS: live route probe: `/api/product-data/snapshot` returned 30 viewer groups and 48 schema-backed tables, with table diagnostics instead of a 500.
- PASS: `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --grep "(Admin DB Viewer restores configured table groups|Admin DB Viewer renders schema headers|Admin DB Viewer shows a visible configured source diagnostic)" --workers=1` (3 passed)
- PASS: `git diff --check`

## Notes

- A broad name-pattern run against `tests/dev-runtime/SupabaseProviderContractStub.test.mjs` timed out and left Node test workers; those validation-only processes were stopped. The final validation uses the dedicated focused Node test instead.
- The existing local API server on port 5501 was observed and left running.
- Playwright V8 coverage was refreshed. Server-side runtime files report advisory WARN coverage only, as expected for browser V8 coverage; `src/api/db-viewer-ui.js` is covered by the focused Playwright run.
