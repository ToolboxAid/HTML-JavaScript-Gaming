# PR_26166_127 Supabase Postgres Provider Adapter

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.

## Scope Notes

- PASS: Scoped this PR to the Supabase Postgres provider adapter surface.
- PASS: Did not activate Supabase Postgres by default.
- PASS: Did not migrate data.
- PASS: Did not add secrets.
- PASS: Kept Local DB active.
- PASS: Preserved `Browser -> API/Service Contract -> Database`.

## Supabase Postgres Adapter Audit

- PASS: Added `SupabasePostgresProviderAdapter` behind the existing provider contract.
- PASS: Preserved `SupabasePostgresProviderStub` as a compatibility alias to the adapter.
- PASS: Missing Supabase Postgres config fails visibly with actionable diagnostics.
- PASS: Adapter stays inactive unless explicitly selected/configured.
- PASS: Initial provider surface supports:
  - `connect`
  - `getUsers`
  - `getRoles`
  - `getUserRoles`
  - `runSiteSetup`
  - `getDbViewerSnapshot`
- PASS: Adapter restricts table access to key-based identity tables:
  - `users`
  - `roles`
  - `user_roles`
- PASS: DB Viewer readiness is exposed through provider diagnostics.
- PASS: Site Setup readiness is exposed through provider diagnostics.
- PASS: Data migration remains inactive.
- PASS: Server/API owns key generation through adapter-side ULID creation.
- PASS: Static ULID exception remains documented as DEV seed users only.

## Secrets Audit

- PASS: Browser/API diagnostics do not expose server-only secret values.
- PASS: Browser/API diagnostics do not expose server-only variable names.
- PASS: No real Supabase key, URL, service-role key, or database URL was committed.
- PASS: No Supabase package dependency was added.
- PASS: No password table or password storage was added.

## Local DB Default Audit

- PASS: Provider snapshot keeps active auth provider as `local-db`.
- PASS: Provider snapshot keeps active database provider as `local-db`.
- PASS: DB Viewer route returned HTTP 200 while Local DB remained active.
- PASS: Supabase Postgres reports `adapter-inactive` without DEV Supabase config.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Verified current branch is `main`.
- PASS: Scoped to Supabase Postgres provider adapter only.
- PASS: Did not activate Supabase Postgres by default.
- PASS: Did not migrate data.
- PASS: Did not add secrets.
- PASS: Kept Local DB active.
- PASS: Implemented config-gated Supabase Postgres provider behind the DB provider contract.
- PASS: Initial provider surface supports users, roles, user_roles, provider diagnostics, Site Setup readiness checks, and DB Viewer readiness checks.
- PASS: Preserved Browser -> API/Service Contract -> Database.
- PASS: Server/API owns key generation.
- PASS: Static ULID exception remains DEV seed users only.
- PASS: Missing Supabase config fails visibly with actionable diagnostics.

## Validation Lane Report

- Impacted lane: DB/Auth provider contract and Admin DB Viewer route.
- Runtime JavaScript changed: Yes.
- Playwright impacted: Yes.
- Broad lanes skipped: full samples smoke, full engine, broad toolbox, full Playwright.
- Skip reason: targeted Node and Playwright coverage exercised the changed provider contract, sign-in route, and DB Viewer route.
- Samples decision: SKIP because this PR does not change samples or game runtime.
- V8 coverage: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- V8 coverage note: `(0%) src/dev-runtime/auth/provider-contract-stubs.mjs - WARNING: changed runtime JS file was not collected by Playwright V8 coverage; advisory only`.

## Commands Run

- PASS: `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`.
- PASS: `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`.
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` passed 9/9 tests.
- PASS: Targeted Playwright passed 3/3 tests for DB Viewer and sign-in/session routes.
- PASS: `npm run dev:local-api` started through `npm.cmd` on port `5537`.
- PASS: Local API provider diagnostics confirmed:
  - active auth provider `local-db`
  - active database provider `local-db`
  - Supabase Postgres status `adapter-inactive`
  - DB Viewer readiness `false` before Supabase config
  - secret values exposed `false`
  - server-only names exposed `false`
- PASS: `git diff --check`.

## Manual Validation Notes

- The adapter uses Supabase REST table endpoints only when configured/invoked and is not wired as the active DB provider.
- Test-only sentinel values are used to prove server-only values are not emitted in API diagnostics; they are not real secrets.
- Repo-structured ZIP path: `tmp/PR_26166_127-supabase-postgres-provider-adapter_delta.zip`.
