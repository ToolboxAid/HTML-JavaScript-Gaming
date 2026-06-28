# Database Runbook

This runbook is the operator path for the database configured by `.env`.

Runtime, validation, DDL apply, DML apply, seed, backup, and restore use `.env`
only. Files such as `.env.dev`, `.env.ist`, `.env.uat`, and `.env.prd` are
manual copy sources only.

Do not pass runtime environment parameters such as `--env`, `--environment`, or
`ENVIRONMENT=<target>`. Deployment targets describe the selected connection, not
application behavior.

## State Authority

`schema_migrations` is the authoritative migration state for DDL and DML apply
history.

Required `schema_migrations` fields are:

- `key`
- `migrationName`
- `migrationType`
- `checksum`
- `appliedAt`
- `appliedBy`

`platform_settings` is runtime settings data only. It may hold settings such as
platform banners and future maintenance toggles, but it must not track, gate, or
control migration apply state.

The optional current database version report is derived from
`schema_migrations`; it is not stored in `platform_settings`.

## Validate

Run connection validation before and after apply work:

```powershell
node .\scripts\validate-runtime-connections.mjs
```

Run drift validation when schema shape needs to be compared with expected DDL:

```powershell
node .\scripts\validate-database-drift.mjs
```

Validation reports must include host, port, database name, and SSL mode only.
They must not include passwords, full connection strings, service role keys, or
access tokens.

## Apply DDL

Apply DDL from `docs_build/database/ddl/`:

```powershell
node .\scripts\apply-database-ddl.mjs
```

The apply lane records each file in `schema_migrations` with `key`,
`migrationName`, `migrationType`, `checksum`, `appliedAt`, and `appliedBy`
metadata. If an applied file checksum changes, the apply lane must fail visibly.
Create a new migration file instead of editing an already-applied file.

## Apply DML

Apply DML from `docs_build/database/dml/`:

```powershell
node .\scripts\apply-database-dml.mjs
```

DML uses the same `schema_migrations` tracking contract as DDL. Repeat runs must
skip unchanged already-applied files and fail on checksum drift.

## Seed DEV

Seed is separate from DDL and DML migration apply. Use the seed dry run first:

```powershell
node --use-system-ca .\scripts\apply-database-seed.mjs --dry-run
```

Run the DEV seed only after the dry run passes:

```powershell
node --use-system-ca .\scripts\apply-database-seed.mjs
```

The DEV seed target keeps User 1, User 2, and User 3 as creator-only identities.
DavidQ remains owner, admin, and creator. The seed script must refuse IST, UAT,
and PRD targets and must confirm the owner role assignment before seed
execution. A later approved operator lane is required before any non-DEV seed
execution is allowed.

## Backup

Use the backup operation path documented in
[backup-restore-lane.md](backup-restore-lane.md). Backups use
`GAMEFOUNDRY_DATABASE_URL` from `.env`, write `pg_dump --format=custom` only
to temporary server-side staging, and upload the final `.dump` artifact to the
configured R2 backup prefix.

Minimum backup checklist:

- Confirm `.env` points at the intended database.
- Confirm `pg_dump` is installed.
- Confirm `GAMEFOUNDRY_DB_BACKUP_STORAGE_PROVIDER=r2`.
- Confirm `GAMEFOUNDRY_DB_BACKUP_PREFIX` matches the active target:
  `/dev/backups/postgres/`, `/ist/backups/postgres/`,
  `/uat/backups/postgres/`, or `/prd/backups/postgres/`.
- Record backup metadata: `backupName`, `databaseName`, `createdAt`, and
  `migrationVersion`.
- Confirm R2 prefixes require no manual folder creation.
- Confirm temporary local staging is deleted after successful upload.
- Record R2 key, filename, size, timestamp, environment, and checksum only.
- Do not write secrets, full URLs, service role keys, or dump contents to
  reports.

## Restore

Use the restore path documented in
[backup-restore-lane.md](backup-restore-lane.md). Restore is destructive,
remains scaffold-only until safe R2 restore is explicitly implemented, and must
require explicit operator confirmation before any future destructive command can
run.

Minimum restore checklist:

- Confirm `.env` points at the intended target database.
- Validate the current `schema_migrations` state before applying restore.
- Confirm the R2 backup key, filename, size, timestamp, and checksum.
- Confirm backup metadata, including `migrationVersion`.
- Stop the application or enter a maintenance window.
- Confirm owner approval.
- Record the confirmation phrase `RESTORE CONFIRMED`.
- Run restore from the operator machine.
- Run connection validation after restore.
- Run drift validation after restore.

## Promote DEV -> IST -> UAT -> PRD

Promotion is manual and must move in this order:

```text
DEV -> IST -> UAT -> PRD
```

Exact operator workflow for each target:

1. Copy the selected `.env.<target>` file to `.env`.
2. Confirm `.env` contains the intended database host, port, database name, and
   SSL mode without exposing secrets.
3. Run `node .\scripts\validate-runtime-connections.mjs`.
4. Create a backup and record backup metadata.
5. Run `node .\scripts\apply-database-ddl.mjs`.
6. Run `node .\scripts\apply-database-dml.mjs`.
7. Run `node .\scripts\validate-database-drift.mjs`.
8. Run `node .\scripts\validate-runtime-connections.mjs` again.
9. Review `schema_migrations` for the expected DDL/DML files.
10. Start or restart the runtime.
11. Promote the next target only after the current target passes.

Do not use `platform_settings` as a migration gate or promotion gate.

## Owner Operations Boundary

Owner Operations remains status-first and execute-later until the database lanes
are stable. It may show validation, apply, backup, restore, and migration
history status, but it must not execute database operations from the browser.

The status surface currently routes through
`api/server/local-api-router.mjs`. That local API filename is retained for now;
do not infer local database behavior from it.

## Rollback Guidance

Prefer forward-fix migrations for application schema corrections. Do not edit an
already-applied DDL or DML file; checksum drift must remain a visible failure.

When restore-based rollback is required:

1. Stop runtime traffic or enter a maintenance window.
2. Confirm the target `.env` and backup checksum.
3. Follow the restore checklist and confirmation phrase.
4. Run connection validation.
5. Run drift validation.
6. Review `schema_migrations` against the expected migration state.
7. Restart runtime only after validation passes.

Runtime settings in `platform_settings` may be adjusted after rollback as normal
product configuration, but they must not be treated as migration state.
