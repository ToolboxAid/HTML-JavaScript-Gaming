# PR_26167_204-database-seed-separation

Status: PASS

## Branch Validation

PASS - Current branch is `main`.

## Change Summary

- Split migration apply into separate DDL and DML lanes.
- Added shared migration runner `scripts/database-migration-runner.mjs`.
- Kept `scripts/apply-database-ddl.mjs` as DDL-only.
- Added `scripts/apply-database-dml.mjs` as DML-only.
- Added DEV-only seed lane `scripts/apply-database-seed.mjs`.
- Added package shortcuts for DDL, DML, and DEV seed lanes.
- Updated database docs to show separated lanes.

## Requirement Checklist

PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.

PASS - Hard stop branch guard satisfied on `main`.

PASS - DDL apply lane is separate.

PASS - DML apply lane is separate.

PASS - Seed apply/validation lane is separate.

PASS - DEV seed lane uses `.env` only.

PASS - DEV seed lane refuses non-DEV database targets.

PASS - User 1 remains creator only.

PASS - User 2 remains creator only.

PASS - User 3 remains creator only.

PASS - DavidQ remains creator, admin, and owner.

PASS - Accidental IST/UAT/PRD seed execution is blocked by database target validation.

## Validation Lane Report

PASS - `node --check scripts\database-migration-runner.mjs`

PASS - `node --check scripts\apply-database-ddl.mjs`

PASS - `node --check scripts\apply-database-dml.mjs`

PASS - `node --check scripts\apply-database-seed.mjs`

PASS - `node .\scripts\apply-database-ddl.mjs`

```text
PASS - .env loaded for database DDL apply
PASS - Database migrations processed=15; applied=0; skipped=15.
```

PASS - `node .\scripts\apply-database-dml.mjs`

```text
PASS - .env loaded for database DML apply
PASS - Database migrations processed=15; applied=0; skipped=15.
```

PASS - Initial `node --use-system-ca .\scripts\apply-database-seed.mjs --dry-run` found the DEV seed lane role targets were correct, but Auth/public user sync needed repair:

```text
Role evidence: User 1 creator=PASS, User 2 creator=PASS, User 3 creator=PASS, DavidQ creator=PASS, DavidQ admin=PASS, DavidQ owner=PASS.
Verification failures: canonical-auth-public-users-not-synced.
```

PASS - `node --use-system-ca .\scripts\apply-database-seed.mjs` applied the DEV seed repair against `gamefoundry_dev`:

```text
DEV seed mode: apply.
Seed identity counts before auth=4; public.users=4.
Seed identity counts after auth=4; public.users=4.
Verification failures: none.
```

PASS - Final `node --use-system-ca .\scripts\apply-database-seed.mjs --dry-run`

```text
Role evidence: User 1 creator=PASS, User 2 creator=PASS, User 3 creator=PASS, DavidQ creator=PASS, DavidQ admin=PASS, DavidQ owner=PASS.
Verification failures: none.
```

PASS - `node .\scripts\apply-database-seed.mjs --unsafe-target-self-test`

```text
PASS - Unsafe seed target refused
```

PASS - `git diff --check` for changed PR204 files.

## Manual Validation Notes

- The DEV seed lane wrote only the intended canonical seed repair and did not increase Auth or public user counts.
- No IST, UAT, or PRD seed was executed.
- No passwords, service keys, or database URLs were written to reports.
- No full samples smoke run because this PR changes database apply/seed tooling only.
