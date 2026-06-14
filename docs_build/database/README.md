# Database Artifact Ownership

Database schema and setup review artifacts are owned outside runtime source.

## Ownership

- DEV database DDL belongs in `docs_build/database/ddl/`.
- DEV setup or DML review artifacts belong in `docs_build/database/dml/`.
- DDL must not be placed under `src/` or `docs/`.
- DML files in this folder are temporary setup/review artifacts unless promoted by a future Admin Site Setup workflow.

## Execution Boundary

Codex may execute DEV database setup only.

UAT and production SQL execution is user-controlled. Codex may prepare review artifacts, but it must not execute UAT or production SQL.

Long-term seed behavior belongs in Admin -> Site Setup, not permanent seed SQL. Temporary DML files may document review setup data while the Admin Site Setup workflow is planned.
