# Database Artifact Ownership

Database schema, DML review, and seed artifacts are grouped under `docs_build/database/`.

## Ownership

- DEV database DDL belongs in `docs_build/database/ddl/`.
- DEV setup or DML review artifacts belong in `docs_build/database/dml/`.
- Seed artifacts belong in `docs_build/database/seed/`.
- Guest seed artifacts belong in `docs_build/database/seed/guest/` and are read-only.
- DDL/DML/seed artifacts must not be placed under `src/` or `docs/`.
- Identity records use `key` as the primary identifier. Shared audit ownership uses `createdBy` and `updatedBy` references to `users.key`.

## Grouping

Each product area/tool owns one grouped file in `ddl/`, `dml/`, and `seed/`. Account tables stay in `account.sql` / `account.json`; tool metadata, planning, and votes remain separate grouped files.

## Execution Boundary

Runtime DEV setup and reseed actions must call server-side APIs. Browser pages must not directly seed authoritative DB records or generate authoritative DB keys.

Codex may execute DEV database setup only. UAT and production SQL execution is user-controlled. Codex may prepare review artifacts, but it must not execute UAT or production SQL.

## Apply Lanes

Database setup is split into separate lanes:

- DDL: `node .\scripts\apply-database-ddl.mjs`
- DML: `node .\scripts\apply-database-dml.mjs`
- DEV seed: `node .\scripts\apply-database-seed.mjs --dry-run`

DDL and DML use `schema_migrations` for applied file tracking. DEV seed is separate from migration tracking and refuses non-DEV database targets.

## Promotion

The database promotion lane is documented in [promotion-lane.md](promotion-lane.md). Promotion uses manual `.env.<target>` copy-source files, validates and applies against `.env` only, and uses `schema_migrations` as the authoritative DDL/DML migration state.

## Backup And Restore

The operator-controlled backup and restore lane is documented in [backup-restore-lane.md](backup-restore-lane.md). Backup uses `GAMEFOUNDRY_DATABASE_URL` from `.env`, temporary server-side `pg_dump --format=custom` staging, and the configured R2 backup prefix for final artifacts. Restore remains scaffold-only until safe R2 restore is explicitly implemented and still requires an operator checklist and confirmation phrase before any future destructive command can run.

## Runbook

The consolidated operator runbook is documented in [runbook.md](runbook.md). It covers validation, DDL apply, DML apply, DEV seed, backup, restore, promotion, and rollback guidance while keeping `schema_migrations` as migration state and `platform_settings` as runtime settings only.
