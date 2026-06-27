# PR_26167_200-database-migration-apply-lane

Status: PASS

## Branch Validation

PASS - Current branch is `main`.

## Change Summary

- Updated `scripts/apply-database-ddl.mjs` into a repeatable database migration apply lane.
- Added migration tracking through `schema_migrations`.
- Applied top-level grouped SQL files from `docs_build/database/ddl` and `docs_build/database/dml`.
- Updated `scripts/validate-runtime-connections.mjs` to validate `platform_settings` with the required identity tables.
- Confirmed old script names remain compatibility wrappers only and print deprecation messages.

## Script Rename Evidence

PASS - Active validator is `scripts/validate-runtime-connections.mjs`.

PASS - Active database apply script is `scripts/apply-database-ddl.mjs`.

PASS - `scripts/validate-supabase-dev.mjs` prints:

```text
Deprecated script name. Use validate-runtime-connections.mjs.
```

PASS - `scripts/apply-supabase-dev-ddl.mjs` prints:

```text
Deprecated script name. Use apply-database-ddl.mjs.
```

## Schema Migrations Evidence

PASS - `schema_migrations` exists.

PASS - Required tracking columns exist:

```text
key,fileName,migrationType,checksum,appliedAt,appliedBy
```

PASS - Tracked migration counts:

```text
DDL count=15
DML count=15
```

PASS - Required tables confirmed in the configured database:

```text
users
roles
user_roles
platform_settings
schema_migrations
```

## DDL/DML Apply Evidence

PASS - Initial apply during this PR execution created migration tracking and applied all top-level grouped SQL files:

```text
Database migrations processed=30; applied=30; skipped=0.
```

PASS - Current repeat apply is idempotent and skips already-applied unchanged files:

```text
Database migrations processed=30; applied=0; skipped=30.
```

PASS - Checksum drift is guarded in `scripts/apply-database-ddl.mjs`; an already-applied migration with a different checksum throws a visible error instructing the operator to create a new migration file.

## Requirement Checklist

PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.

PASS - Hard stop branch guard satisfied; current branch is `main`.

PASS - Finished the database DDL/DML apply lane before storage/R2 work.

PASS - Active script names are `validate-runtime-connections.mjs` and `apply-database-ddl.mjs`.

PASS - Compatibility wrappers remain only for continuity and print deprecation messages.

PASS - Validation and DDL apply load `.env` only.

PASS - Database connection behavior uses `GAMEFOUNDRY_DATABASE_URL` and `GAMEFOUNDRY_DATABASE_SSL`.

PASS - `schema_migrations` is created/confirmed.

PASS - Migration tracking records file name, type, checksum, applied timestamp, and applied actor.

PASS - Already-applied unchanged files are skipped.

PASS - Already-applied changed checksums fail visibly.

PASS - No environment parameters were introduced.

PASS - No DEV/IST/UAT/PRD branching was introduced.

PASS - No SQLite/local-db/mock-db fallback was introduced.

PASS - No R2/storage work was included.

## Validation Lane Report

PASS - `node --check scripts\apply-database-ddl.mjs`

PASS - `node --check scripts\validate-runtime-connections.mjs`

PASS - `node .\scripts\validate-runtime-connections.mjs`

```text
Overall Result: PASS
Database SSL mode: disable
Database connection host=192.168.2.5 port=55431 database=gamefoundry_dev
users table PASS
roles table PASS
user_roles table PASS
platform_settings table PASS
```

PASS - `node .\scripts\apply-database-ddl.mjs`

```text
.env loaded for database migration apply
schema_migrations table confirmed
Migration tracking fields: fileName, migrationType, checksum, appliedAt, appliedBy
Database migrations processed=30; applied=0; skipped=30.
```

PASS - `node .\scripts\validate-runtime-connections.mjs` after apply.

PASS - Direct configured database query confirmed required tables and migration counts.

PASS - Compatibility wrapper validation:

```text
node .\scripts\validate-supabase-dev.mjs
node .\scripts\apply-supabase-dev-ddl.mjs
```

PASS - Changed script forbidden-marker scan found no provider variables, old database URL, SQLite/local-db/mock-db fallback, environment parameter markers, or R2/storage references in the PR200 script scope.

SKIP - Full samples smoke was not run because this PR only changes database validation/apply scripts and does not touch sample runtime behavior.

## Manual Validation Notes

- Migration apply reads only top-level `.sql` files directly under `docs_build/database/ddl` and `docs_build/database/dml`.
- Nested archived or legacy SQL folders were not pulled into the active migration lane.
- No secrets were written to reports; database evidence uses host, port, and database name only.
- No browser, UI, Playwright, storage/R2, or runtime product feature files were changed.
