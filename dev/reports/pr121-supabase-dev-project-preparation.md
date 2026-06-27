# PR_26164_121 Supabase DEV Project Preparation

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.
- Worktree before changes: clean.

## Scope

- PASS: Started from `docs_build/dev/reports/pr119-supabase-environment-checklist.md`.
- PASS: Started from `docs_build/dev/reports/pr120-supabase-provider-contract-stub.md`.
- PASS: Scoped to Supabase DEV project preparation only.
- PASS: Supabase was not activated.
- PASS: No Supabase connection code was added.
- PASS: No real secrets were added.
- PASS: Passwords are not stored in app tables.
- PASS: Local DB remains active by default.
- PASS: Sign-in behavior is unchanged.

## Environment Config Audit

- PASS: Added `.env.example`.
- PASS: `.env.example` keeps `GAMEFOUNDRY_AUTH_PROVIDER=local-db`.
- PASS: `.env.example` keeps `GAMEFOUNDRY_DB_PROVIDER=local-db`.
- PASS: `.env.example` documents future browser-safe Supabase DEV variables with empty values:
  - `GAMEFOUNDRY_SUPABASE_URL`
  - `GAMEFOUNDRY_SUPABASE_ANON_KEY`
- PASS: `.env.example` documents future server-only Supabase DEV variables with empty values:
  - `GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY`
  - `GAMEFOUNDRY_SUPABASE_DATABASE_URL`
- PASS: Provider selection supports `local-db`, `supabase-auth`, and `supabase-postgres`.
- PASS: Missing Supabase config is diagnostic only and does not block Local DB.

## Provider Diagnostics Audit

- PASS: `/api/providers/contract` remains the startup/provider diagnostics endpoint.
- PASS: Endpoint reports active auth provider.
- PASS: Endpoint reports active database provider.
- PASS: Endpoint reports configured providers.
- PASS: Endpoint reports missing future Supabase config warnings.
- PASS: Endpoint reports browser-safe missing variable names for future Supabase Auth.
- PASS: Endpoint does not expose server-only variable names or values.
- PASS: Endpoint reports `secretValuesExposed: false`.
- PASS: Local DB remains active even when future Supabase config is missing.

## Secrets Audit

- PASS: No Supabase dependency was added.
- PASS: No package manifest or lockfile changed.
- PASS: No real Supabase URL was committed.
- PASS: No anon key, service-role key, JWT-like value, or database URL was committed.
- PASS: No password table DDL was added.
- PASS: No password hash, reset secret, or verification secret was added.
- PASS: Test placeholders remain synthetic and are asserted not to appear in browser/API payloads.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Verified current branch is `main` before making changes.
- PASS: Started from PR119 and PR120 reports.
- PASS: Scoped this PR to Supabase DEV project preparation only.
- PASS: Did not activate Supabase.
- PASS: Did not connect to Supabase.
- PASS: Did not add real secrets.
- PASS: Did not store passwords in app tables.
- PASS: Kept Local DB active.
- PASS: Added `.env.example` entries for future Supabase DEV configuration.
- PASS: Documented Supabase URL, anon key, service-role key server-only, and provider selection.
- PASS: Updated provider diagnostics so missing Supabase config is visible.
- PASS: Provider selection supports `local-db`, `supabase-auth`, and `supabase-postgres`.
- PASS: Browser/API payloads never receive service-role key values.
- PASS: Startup/provider diagnostics endpoint shows active provider, configured providers, and missing config warnings.
- PASS: Startup/provider diagnostics endpoint does not expose secret values.
- PASS: Current Local DB provider remains active by default.
- PASS: Did not change sign-in behavior.

## Validation

- PASS: `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `npm run dev:local-api` startup validated on `127.0.0.1:5522` with `GAMEFOUNDRY_LOCAL_API_PORT=5522`.
- PASS: Local API provider diagnostics returned active auth/database provider as `local-db`.
- PASS: Local API provider diagnostics returned two missing future Supabase config warnings without breaking Local DB.
- PASS: Local API provider diagnostics returned no secret values and no server-only variable names.
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs -g "Sign-in page uses a production-safe account form without public Local DB controls|Protected pages block direct URL access without the required Local session role" --project=playwright`
- PASS: Playwright V8 coverage report produced.
- WARN: Browser V8 coverage reports changed dev-runtime provider files as not collected by browser coverage; these Node-side diagnostics are covered by targeted Node tests.

## Manual Validation Notes

- `git diff --check`: PASS.
- Runtime files changed: PASS, scoped to dev-runtime provider diagnostics.
- Dependencies added: PASS, none.
- Supabase dependency added: PASS, none.
- Secret-pattern scan: PASS, no matches in added diff lines.
- Password tables added: PASS, none.
- Sign-in behavior changed: PASS, no sign-in runtime changes.
- Playwright impacted: Yes, targeted sign-in and DB Viewer route-protection tests passed.
- Samples smoke test: SKIP, no samples changed and PR scope is provider diagnostics/environment preparation.

## Required Outputs

- PASS: `docs_build/dev/reports/pr121-supabase-dev-project-preparation.md`
- PASS: `docs_build/dev/reports/codex_review.diff`
- PASS: `docs_build/dev/reports/codex_changed_files.txt`
- PASS: `tmp/PR_26164_121-supabase-dev-project-preparation_delta.zip`
