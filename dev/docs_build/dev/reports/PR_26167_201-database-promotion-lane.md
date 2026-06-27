# PR_26167_201-database-promotion-lane

Status: PASS

## Branch Validation

PASS - Current branch is `main`.

## Change Summary

- Added `docs_build/database/promotion-lane.md`.
- Linked the promotion lane from `docs_build/database/README.md`.
- Documented DEV -> IST -> UAT -> PRD as a manual copy-source flow.
- Confirmed migration state remains `schema_migrations`.
- Confirmed `platform_settings` is runtime settings only and not a migration gate.

## Requirement Checklist

PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.

PASS - Hard stop branch guard satisfied on `main`.

PASS - Added documented DB promotion lane: DEV -> IST -> UAT -> PRD.

PASS - Documented that runtime/apply scripts use `.env` only.

PASS - Documented `.env.dev`, `.env.ist`, `.env.uat`, and `.env.prd` as manual copy sources only.

PASS - Did not add `--env` or environment parameters.

PASS - Documented `schema_migrations` as authoritative for applied DDL/DML.

PASS - Documented that `platform_settings` must not be used as a migration gate.

## Validation Lane Report

PASS - `node .\scripts\validate-runtime-connections.mjs`

```text
Overall Result: PASS
Database SSL mode: disable
Database connection host=192.168.2.5 port=55431 database=gamefoundry_dev
```

PASS - `node .\scripts\apply-database-ddl.mjs`

```text
schema_migrations table confirmed
Database migrations processed=30; applied=0; skipped=30.
```

PASS - `node .\scripts\validate-runtime-connections.mjs` after apply.

PASS - Promotion docs explain the copy-source flow:

```text
Copy the selected .env.<target> file to .env.
Run validate, apply, validate.
```

## Manual Validation Notes

- No runtime code changed.
- No storage/R2 work performed.
- No full samples smoke run because this PR is database governance/documentation only.
