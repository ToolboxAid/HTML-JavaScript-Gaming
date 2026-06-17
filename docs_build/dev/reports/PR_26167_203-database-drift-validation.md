# PR_26167_203-database-drift-validation

Status: PASS

## Branch Validation

PASS - Current branch is `main`.

## Change Summary

- Added `scripts/validate-database-drift.mjs`.
- Added `npm run validate:database-drift`.
- Drift validation parses top-level grouped DDL files under `docs_build/database/ddl`.
- Drift validation compares expected tables, columns, and indexes to the current database loaded from `.env`.
- Missing objects fail visibly with remediation to run the database apply lane.

## Requirement Checklist

PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.

PASS - Hard stop branch guard satisfied on `main`.

PASS - Added drift validation comparing expected DDL tables, columns, and indexes to the current database.

PASS - Missing required objects fail visibly with actionable diagnostics.

PASS - `schema_migrations` remains the DDL/DML apply SSoT and is reported as migration-state evidence only.

PASS - Did not use `platform_settings` as a migration gate.

## Validation Lane Report

PASS - `node --check scripts\validate-database-drift.mjs`

PASS - `node .\scripts\validate-database-drift.mjs`

```text
PASS - Expected DDL objects loaded from docs_build/database/ddl: tables=34; indexes=115.
PASS - schema_migrations is the migration-state SSoT; applied records=30.
PASS - Database drift validation found no missing required tables, columns, or indexes.
```

PASS - `node .\scripts\validate-database-drift.mjs --diagnostic-self-test`

```text
PASS - Missing/changed schema diagnostic self-test produced actionable output.
PASS - Example diagnostic: Missing table users expected from docs_build/database/ddl/account.sql. Run node .\scripts\apply-database-ddl.mjs against the current .env, then rerun drift validation.
```

PASS - `git diff --check -- scripts\validate-database-drift.mjs package.json`

## Manual Validation Notes

- No database schema was modified by drift validation.
- No platform settings rows were read or used as migration control state.
- No full samples smoke run because this PR changes only database validation tooling.
