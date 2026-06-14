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
