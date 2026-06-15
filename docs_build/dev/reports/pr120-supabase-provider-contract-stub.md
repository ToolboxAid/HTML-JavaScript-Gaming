# PR_26164_120 Supabase Provider Contract Stub

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.
- Worktree before changes: clean.

## Scope

- PASS: Started from `docs_build/dev/reports/pr119-supabase-environment-checklist.md`.
- PASS: Provider contract stubs only.
- PASS: Supabase was not made active.
- PASS: Current Local DB provider remains active.
- PASS: No real Supabase keys or secrets were added.
- PASS: Passwords are not stored in app tables.
- PASS: Sign-in runtime behavior is unchanged.
- PASS: Browser -> API/Service Contract -> Database is preserved.

## Supabase Provider Stub Audit

Added `src/dev-runtime/auth/provider-contract-stubs.mjs`.

Contract contents:

- `AUTH_PROVIDER_CONTRACT_OPERATIONS`
- `PROVIDER_DATA_BOUNDARY_RULE`
- `SupabaseAuthProviderStub`
- `SupabasePostgresProviderStub`
- `createProviderContractSnapshot`

Stub behavior:

- Local DB remains the active auth provider.
- Local DB remains the active database provider.
- Supabase Auth is represented as a future provider stub only.
- Supabase Postgres is represented as a future provider stub only.
- Selecting Supabase through environment variables produces visible diagnostics if required config is missing.
- Supabase stubs throw diagnostics if called directly.
- No Supabase package import exists.
- No Supabase runtime client is created.

Local API exposure:

- `/api/providers/contract`
- `/api/session/provider-contract`
- `/api/data-source/adapter-contract` now includes `providerContract`.

The provider contract payload exposes browser-safe missing variable names only for Supabase Auth. Server-only secret names and values are not exposed through browser API payloads.

## Required Environment Variables

Documented without values:

- `GAMEFOUNDRY_AUTH_PROVIDER`
- `GAMEFOUNDRY_DB_PROVIDER`
- `GAMEFOUNDRY_SUPABASE_URL`
- `GAMEFOUNDRY_SUPABASE_ANON_KEY`
- `GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY`
- `GAMEFOUNDRY_SUPABASE_DATABASE_URL`

Server-only variables remain server-only. The Local API provider contract intentionally reports only that server-only values are required; it does not return their names or values.

## Secrets Audit

- PASS: No package dependency changes.
- PASS: No Supabase URL values were added.
- PASS: No JWT-like values were added.
- PASS: No service-role values were added.
- PASS: No database URL values were added.
- PASS: No password table DDL was added.
- PASS: No password hashes, reset secrets, or verification secrets were added.
- PASS: Test placeholders are synthetic and are asserted not to appear in API payloads.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Verified current branch is `main` before making changes.
- PASS: Started from `docs_build/dev/reports/pr119-supabase-environment-checklist.md`.
- PASS: Scoped this PR to provider contract stubs only.
- PASS: Did not make Supabase active.
- PASS: Did not add real Supabase keys or secrets.
- PASS: Did not store passwords in app tables.
- PASS: Did not change sign-in behavior.
- PASS: Added provider contract stubs for future Supabase Auth.
- PASS: Added provider contract stubs for future Supabase Postgres.
- PASS: Kept current Local DB provider active.
- PASS: Added visible diagnostics if Supabase provider is selected without configuration.
- PASS: Documented required environment variables without values.
- PASS: Ensured browser API payloads never receive service-role key values.
- PASS: Preserved Browser -> API/Service Contract -> Database.

## Validation

- PASS: `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `node --test tests/dev-runtime/DevRuntimeBoundary.test.mjs`
- PASS: `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs`
- PASS: Local API startup probe on `127.0.0.1:5521`
- PASS: Provider contract route returns active auth/database provider as `local-db`
- PASS: Session route returns mode `local-db`
- PASS: Sign-in page returns HTTP 200 through Local API
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs -g "Sign-in page uses a production-safe account form without public Local DB controls" --project=playwright`
- PASS: Playwright V8 coverage report produced.
- WARN: Browser V8 coverage reports changed dev-runtime server files as not collected by browser coverage; these are Node-side modules and are covered by targeted Node tests.

## Manual Validation Notes

- `git diff --check`: PASS.
- Runtime files changed: PASS, scoped to dev-runtime provider contract and Local API router.
- Dependencies added: PASS, none.
- Supabase dependency added: PASS, none.
- Secret-like additions: PASS, none found in added diff.
- Password tables added: PASS, none.
- Sign-in behavior changed: PASS, placeholder sign-in Playwright test still passes.
- Local API still starts: PASS.
- Playwright impacted: Yes, targeted sign-in placeholder test passed.
- Samples smoke test: SKIP, no samples changed and PR scope is provider contract stubs.

## Required Outputs

- PASS: `docs_build/dev/reports/pr120-supabase-provider-contract-stub.md`
- PASS: `docs_build/dev/reports/codex_review.diff`
- PASS: `docs_build/dev/reports/codex_changed_files.txt`
- PASS: `tmp/PR_26164_120-supabase-provider-contract-stub_delta.zip`
