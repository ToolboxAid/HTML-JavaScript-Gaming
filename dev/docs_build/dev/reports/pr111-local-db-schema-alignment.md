# PR_26164_111-local-db-schema-alignment

## Branch Validation

- PASS: Current branch is `main`.
- PASS: Expected branch is `main`.

## Requirement Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| Scope to Local DB schema alignment only | PASS | Runtime behavior was not changed for PR111; a docs_build SQLite schema map was added. |
| Do not introduce Supabase | PASS | No Supabase code or configuration added. |
| Do not change UAT/PROD behavior | PASS | DEV SQLite traceability docs only. |
| Audit LocalDbAdapter schema creation against grouped DDL | PASS | `src/dev-runtime/server/local-api-router.mjs` creates Local DB tables from `getMockDbTableSchemas()`. |
| Identify generic TEXT-only logical tables | PASS | Runtime SQLite adapter creates `key TEXT PRIMARY KEY` and other fields as `TEXT`; report documents this intentionally. |
| Align Local DB schema ownership to grouped DDL intent | PASS | Added `docs_build/database/ddl/sqlite/local-db-schema-map.sql`. |
| Add grouped SQLite schema map if grouped DDL cannot be directly used | PASS | Map added under `docs_build/database/ddl/sqlite/`. |
| Do not place DDL under docs/ or src/ | PASS | Validation found no `.sql` files under `docs/` or `src/`. |
| Keep grouped ownership by required groups | PASS | SQLite map lists Account, Admin, Game Workspace, Game Design, Game Configuration, Objects, Controls, Game Journey, Palette, Tags, Asset, Tool Metadata, Tool Planning, Toolbox Votes, Support Tickets. |
| Ensure key/audit fields are present | PASS | Map is generated from current Local DB schema registry; validation executes 33 table definitions with `key`, `createdAt`, `updatedAt`, `createdBy`, and `updatedBy`. |
| Ensure ownership fields reference users.key | PASS | SQLite map uses `REFERENCES users("key")` for `createdBy` and `updatedBy`. |
| Do not use id-based ownership | PASS | Ownership fields remain key-based. |
| Preserve DEV static ULID exception | PASS | No seed user or user-role changes in PR111. |

## Local DB Schema Alignment Audit

- Runtime Local DB schema owner: `getMockDbTableSchemas()` in `src/dev-runtime/persistence/mock-db-store.js`.
- Runtime Local DB table creation: `LocalSqliteStore.ensureTable()` in `src/dev-runtime/server/local-api-router.mjs`.
- Current runtime behavior:
  - `key` is created as `TEXT PRIMARY KEY`.
  - Non-key values are stored as serialized JSON-compatible `TEXT`.
  - Runtime schemas are logical table contracts for current DEV Local DB, not direct execution of grouped Postgres/Supabase DDL.

## SQLite/Postgres DDL Compatibility Audit

- Grouped DDL under `docs_build/database/ddl/*.sql` uses Postgres/Supabase-style SQL:
  - `timestamptz`
  - JSON-ish logical fields
  - indexes and foreign keys shaped for server DB review
  - DB default timestamp expressions
- Node SQLite Local DB currently serializes logical tool rows to TEXT for compatibility with existing tool records.
- Because of that dialect/data-shape difference, PR111 does not execute the grouped DDL directly in the DEV SQLite adapter.
- Added docs_build-only SQLite map:
  - `docs_build/database/ddl/sqlite/local-db-schema-map.sql`
  - It is executable SQLite and traceable to grouped DDL ownership.
  - It documents the current DEV Local DB logical field shape without changing runtime behavior.

## Validation

- PASS: `git diff --check`
  - Windows LF/CRLF checkout warnings only.
- PASS: SQLite schema map execution:
  - `docs_build/database/ddl/sqlite/local-db-schema-map.sql`
  - Executed in `node:sqlite` in-memory database.
  - Result: 33 tables.
- PASS: Local API / Local DB initialization:
  - `startLocalApiServer({ port: 5501 })`
  - `/api/local-db/snapshot`
  - Result: 33 tables and 15 viewer groups.
- PASS: No DDL `.sql` files under `docs/` or `src/`.
- PASS: `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --reporter=line`
  - 7 passed.

## Playwright Impact

- Playwright impacted: Yes for validation of DB Viewer route/group behavior.
- Runtime JavaScript did not change in PR111, but the stacked PR110 runtime changes remain covered.

## V8 Coverage

- PASS/WARN: Existing `docs_build/dev/reports/playwright_v8_coverage_report.txt` remains present.
- WARN: PR111 is docs/schema-map focused; browser V8 coverage is advisory.

## Impacted Lanes

- contract: DDL/SQLite schema traceability.
- runtime validation: Local API initialization and DB Viewer snapshot route.

## Skipped Lanes

- samples: SKIP. Samples were not in scope.
- engine: SKIP. Engine runtime behavior was not changed.

## Manual Validation Steps

1. Open `docs_build/database/ddl/sqlite/local-db-schema-map.sql` and confirm each Local DB table maps to a grouped DDL owner.
2. Run `npm run dev:local-api`.
3. Open `http://127.0.0.1:5501/admin/db-viewer.html`.
4. Confirm the grouped Local DB tables render with key/audit fields.

