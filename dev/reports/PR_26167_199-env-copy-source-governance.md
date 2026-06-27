# PR_26167_199-env-copy-source-governance

Status: PASS with unrelated worktree note

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.

## Summary
- Added targeted Project Instructions governance for `.env` runtime loading, copy-source env files, deployment targets, and script naming.
- Added vendor-neutral active script names:
  - `scripts/validate-runtime-connections.mjs`
  - `scripts/apply-database-ddl.mjs`
- Kept compatibility wrappers for the old script names with the required deprecation messages.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Hard-stop branch check passed on `main`.
- PASS: Documented that runtime loads `.env` only.
- PASS: Documented `.env.dev`, `.env.ist`, `.env.uat`, and `.env.prd` as copy-source files only.
- PASS: Documented manual flow: copy selected target file to `.env`, run validation, apply DDL/DML migrations, start runtime.
- PASS: Documented valid deployment targets: `DEV`, `IST`, `UAT`, `PRD`.
- PASS: Prohibited runtime environment parameters including `--env`, `--environment`, `ENVIRONMENT=DEV`, `ENVIRONMENT=UAT`, and `ENVIRONMENT=PRD`.
- PASS: Stated that deployment targets are not application behaviors.
- PASS: Added script naming governance.
- PASS: Added preferred naming nouns: `auth`, `database`, `storage`, `telemetry`, `api`.
- PASS: Documented avoidance of provider/vendor names in future active runtime script names.
- PASS: Renamed `scripts/validate-supabase-dev.mjs` to `scripts/validate-runtime-connections.mjs`.
- PASS: Renamed `scripts/apply-supabase-dev-ddl.mjs` to `scripts/apply-database-ddl.mjs`.
- PASS: Kept compatibility wrapper `scripts/validate-supabase-dev.mjs`.
- PASS: Kept compatibility wrapper `scripts/apply-supabase-dev-ddl.mjs`.
- PASS: Wrapper output includes `Deprecated script name. Use validate-runtime-connections.mjs.`
- PASS: Wrapper output includes `Deprecated script name. Use apply-database-ddl.mjs.`

## Script Rename Mapping
- `scripts/validate-supabase-dev.mjs` -> `scripts/validate-runtime-connections.mjs`.
- `scripts/apply-supabase-dev-ddl.mjs` -> `scripts/apply-database-ddl.mjs`.
- Added npm alias: `validate:runtime-connections`.
- Kept npm compatibility alias: `validate:supabase-dev`.

## Validation Lane Report
- PASS: `node --check scripts\validate-runtime-connections.mjs`.
- PASS: `node --check scripts\apply-database-ddl.mjs`.
- PASS: `node --check scripts\validate-supabase-dev.mjs`.
- PASS: `node --check scripts\apply-supabase-dev-ddl.mjs`.
- PASS: `node -e` package JSON parse.
- PASS: docs/static governance assertion over `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- PASS: `node --use-system-ca .\scripts\validate-runtime-connections.mjs`.
- PASS: `node .\scripts\apply-database-ddl.mjs`.
- PASS: `node --use-system-ca .\scripts\validate-supabase-dev.mjs`.
- PASS: `node .\scripts\apply-supabase-dev-ddl.mjs`.
- PASS: `npm run validate:runtime-connections`.
- WARN: Full-worktree `git diff --check` failed on pre-existing unrelated `docs_build/dev/admin-notes/index.txt` trailing whitespace.
- PASS: Scoped PR199 `git diff --check -- docs_build\dev\PROJECT_INSTRUCTIONS.md package.json scripts\validate-runtime-connections.mjs scripts\apply-database-ddl.mjs scripts\validate-supabase-dev.mjs scripts\apply-supabase-dev-ddl.mjs`.
- SKIP: Playwright; not required because this PR changes docs/governance and script naming only.
- SKIP: Full samples smoke; not in scope.

## Manual Validation Notes
- New validator script executed successfully and returned `Overall Result: PASS`.
- New DDL script executed successfully and applied 15 grouped DDL files.
- Compatibility wrappers executed successfully and printed the required deprecation messages before running the new scripts.
- Existing unrelated worktree change `docs_build/dev/admin-notes/index.txt` was not modified or packaged.

## Artifact Output
- PASS: Repo-structured ZIP created at `tmp/PR_26167_199-env-copy-source-governance_delta.zip`.

## Changed Files
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `package.json`
- `scripts/validate-runtime-connections.mjs`
- `scripts/apply-database-ddl.mjs`
- `scripts/validate-supabase-dev.mjs`
- `scripts/apply-supabase-dev-ddl.mjs`
- `docs_build/dev/reports/PR_26167_199-env-copy-source-governance.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
