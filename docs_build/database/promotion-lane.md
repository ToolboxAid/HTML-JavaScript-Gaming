# Database Promotion Lane

This lane promotes database changes through the deployment targets in order:

```text
DEV -> IST -> UAT -> PRD
```

The target name describes where the operator points the configured connection. It must not change application behavior.

This order is mandatory. Do not skip a target, promote backward, or promote a
later target until the current target's `schema_migrations` state has been
validated.

## Copy-Source Flow

Runtime, validation, and migration apply scripts load `.env` only.

The target-specific files are copy sources only:

- `.env.dev`
- `.env.ist`
- `.env.uat`
- `.env.prd`

Promotion is manual:

1. Copy the selected `.env.<target>` file to `.env`.
2. Review that `.env` contains the intended `GAMEFOUNDRY_DATABASE_URL` and `GAMEFOUNDRY_DATABASE_SSL`.
3. Run `node .\scripts\validate-runtime-connections.mjs`.
4. Run `node .\scripts\apply-database-ddl.mjs`.
5. Run `node .\scripts\apply-database-dml.mjs`.
6. Run `node .\scripts\validate-database-drift.mjs`.
7. Run `node .\scripts\validate-runtime-connections.mjs` again.
8. Review `schema_migrations` before promoting the next target.
9. Start or restart the runtime after validation passes.

Do not pass runtime environment parameters such as `--env`, `--environment`, or `ENVIRONMENT=<target>`.

## Migration State

`schema_migrations` is the authoritative record of applied DDL/DML.

The migration apply lane records:

- `key`
- `migrationName`
- `migrationType`
- `checksum`
- `appliedAt`
- `appliedBy`

If an already-applied file changes checksum, the apply lane must fail visibly. Create a new migration file instead of editing applied migration content.

`platform_settings` is runtime product configuration only. It must not control migration apply state, promotion state, or schema drift gates.

## Promotion Gate

Each target is eligible for the next promotion step only after:

- validation passes against the current `.env`
- DDL/DML apply completes without checksum drift
- drift validation confirms required tables, columns, indexes, constraints, and platform setting keys
- `schema_migrations` matches the expected applied DDL/DML state for the target
- repeat validation passes
- the operator confirms the intended target connection without exposing secrets

Codex may validate and apply against the configured current `.env` only. IST, UAT, and PRD promotion remains user-controlled through the manual copy-source flow.
