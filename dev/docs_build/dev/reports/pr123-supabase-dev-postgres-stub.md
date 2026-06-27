# PR_26164_123 Supabase DEV Postgres Stub

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.
- Started from PR121 and PR122 outputs.

## Scope

- PASS: Scoped to Supabase Postgres provider stub only.
- PASS: Supabase Postgres was not activated by default.
- PASS: Active data was not moved to Supabase.
- PASS: No Supabase connection occurs without config.
- PASS: No real secrets were added.
- PASS: Local DB active behavior is unchanged.

## Supabase Postgres Stub Audit

- PASS: `SupabasePostgresProviderStub` remains behind the DB provider contract.
- PASS: Future DB operations exposed:
  - `connect`
  - `getUsers`
  - `getRoles`
  - `getUserRoles`
  - `runSiteSetup`
  - `getDbViewerSnapshot`
- PASS: Operations cover future `users`, `roles`, `user_roles`, Site Setup, and DB Viewer needs.
- PASS: Selecting `GAMEFOUNDRY_DB_PROVIDER=supabase-postgres` without config returns `not-configured`.
- PASS: Selecting `supabase-postgres` without config keeps active database provider as `local-db`.
- PASS: Stub operations throw visible actionable diagnostics if called directly.
- PASS: No Supabase package import exists.
- PASS: No Supabase runtime client is created.
- PASS: No active data migration happens.

## Provider Diagnostics Audit

- PASS: Provider contract preserves `Browser -> API/Service Contract -> Database`.
- PASS: Active auth provider remains `local-db`.
- PASS: Active database provider remains `local-db`.
- PASS: Requested database provider reports `supabase-postgres` when selected.
- PASS: Supabase Postgres status reports `not-configured` when server-only config is missing.
- PASS: Server-only secret names and values are not exposed to browser/API payloads.
- PASS: DB Viewer still loads from Local DB.
- PASS: `dataMigrationActive` is `false`.

## Migration Ownership Notes

- PASS: UAT SQL/setup promotion remains user-controlled.
- PASS: PROD SQL/setup promotion remains user-controlled.
- PASS: Codex may only execute DEV setup/migration after a dedicated Supabase DEV PR.
- PASS: Initial migration target after this PR is documented as:
  1. Supabase Auth
  2. Supabase `users` / `roles` / `user_roles`
  3. Supabase tool/product data groups

## Secrets Audit

- PASS: No Supabase dependency was added.
- PASS: No package manifest or lockfile changed.
- PASS: No real Supabase URL was committed.
- PASS: No anon key, service-role key, JWT-like value, or database URL was committed.
- PASS: No service role key is exposed to browser/API payloads.
- PASS: No active data migration code was added.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Verified current branch is `main` before making changes.
- PASS: Started from PR121 and PR122 outputs.
- PASS: Scoped this PR to Supabase Postgres provider stub only.
- PASS: Did not activate Supabase Postgres by default.
- PASS: Did not move active data to Supabase.
- PASS: Did not connect to Supabase without config.
- PASS: Did not add real secrets.
- PASS: Did not change Local DB active behavior.
- PASS: Added Supabase Postgres provider adapter stub behind the DB provider contract.
- PASS: Adapter exposes future DB operations for identity records, Site Setup, and DB Viewer.
- PASS: Selected Supabase Postgres without config fails visibly with actionable diagnostics.
- PASS: Kept Local SQLite provider active by default.
- PASS: Preserved Browser -> API/Service Contract -> Database.
- PASS: Browser/API payloads cannot access service role keys.
- PASS: Documented UAT/PROD SQL promotion remains user-controlled.
- PASS: Documented Codex DEV-only execution boundary.
- PASS: Documented migration target order.

## Validation

- PASS: `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS: `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `npm run dev:local-api` startup validated on `127.0.0.1:5524` with `GAMEFOUNDRY_LOCAL_API_PORT=5524`.
- PASS: Local API selected `supabase-postgres` without config and returned a visible `not-configured` diagnostic.
- PASS: Local API active auth/database providers remained `local-db`.
- PASS: DB Viewer returned HTTP 200 and rendered Local DB heading.
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs -g "Sign-in page uses a production-safe account form without public Local DB controls|Protected pages block direct URL access without the required Local session role" --project=playwright`
- PASS: Playwright V8 coverage report produced.
- WARN: Browser V8 coverage reports changed dev-runtime provider files as not collected by browser coverage; these Node-side stubs are covered by targeted Node tests.

## Manual Validation Notes

- `git diff --check`: PASS.
- Runtime files changed: PASS, scoped to the dev-runtime DB provider stub contract.
- Dependencies added: PASS, none.
- Supabase dependency added: PASS, none.
- Secret-pattern scan: PASS, no matches in PR123 added diff lines.
- Active data migration: PASS, none added.
- DB Viewer active data source: PASS, still Local DB.
- Playwright impacted: Yes, targeted sign-in and DB Viewer route-protection tests passed.
- Samples smoke test: SKIP, no samples changed and PR scope is Postgres provider stubbing.

## Required Outputs

- PASS: `docs_build/dev/reports/pr123-supabase-dev-postgres-stub.md`
- PASS: `docs_build/dev/reports/codex_review.diff`
- PASS: `docs_build/dev/reports/codex_changed_files.txt`
- PASS: `tmp/PR_26164_123-supabase-dev-postgres-stub_delta.zip`
