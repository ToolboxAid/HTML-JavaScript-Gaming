# PR_26166_128 Supabase DEV Activation Checklist

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.

## Scope Notes

- PASS: Scoped this PR to DEV activation checklist and diagnostics.
- PASS: Did not activate Supabase automatically.
- PASS: Did not add secrets.
- PASS: Local DB remains active by default.

## DEV Activation Checklist

1. Create the reviewed Supabase DEV project outside the repo.
2. Add local-only environment values outside source control:
   - `GAMEFOUNDRY_SUPABASE_URL`
   - `GAMEFOUNDRY_SUPABASE_ANON_KEY`
   - `GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY`
   - `GAMEFOUNDRY_SUPABASE_DATABASE_URL`
3. Confirm `/api/providers/contract` reports:
   - `activationReadiness.supabaseAuthReady = true`
   - `activationReadiness.supabasePostgresReady = true`
   - `activationReadiness.siteSetupReady = true`
   - `activationReadiness.readyBeforeActivation = true`
4. Switch the auth provider only after diagnostics are ready:
   - `GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth`
5. Switch the DB provider only after diagnostics are ready:
   - `GAMEFOUNDRY_DB_PROVIDER=supabase-postgres`
6. Run Admin -> Site Setup readiness checks before setup execution.
7. Migrate or map users and roles through reviewed Admin Site Setup behavior:
   - Supabase auth user id -> `users.key`
   - `roles.key`
   - `user_roles.userKey`
   - `user_roles.roleKey`
8. Validate DB Viewer readiness and Local API provider diagnostics.
9. Recommend the next PR only after the user creates the Supabase DEV project and local env vars.

## Expected Diagnostics

- PASS: Missing Supabase Auth config reports missing browser-safe variables.
- PASS: Missing Supabase Postgres config reports missing URL/server-only credentials without exposing server-only names or values.
- PASS: `activationReadiness.readyBeforeActivation` is `false` until both Auth and Postgres are configured.
- PASS: `activationReadiness.readyBeforeActivation` is `true` when the required Auth and Postgres config exists.
- PASS: `activationReadiness.rollback` states how to return to Local DB.
- PASS: Active providers remain `local-db/local-db` until a future activation PR explicitly changes behavior.

## Rollback Checklist

1. Set `GAMEFOUNDRY_AUTH_PROVIDER=local-db`.
2. Set `GAMEFOUNDRY_DB_PROVIDER=local-db`.
3. Restart the Local API.
4. Confirm `/api/providers/contract` reports active providers `local-db/local-db`.
5. Confirm `account/sign-in.html` opens.
6. Confirm `admin/db-viewer.html` opens and remains Local DB-backed.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Verified current branch is `main`.
- PASS: Scoped to activation checklist and diagnostics only.
- PASS: Did not activate Supabase automatically.
- PASS: Did not add secrets.
- PASS: Added clear DEV activation checklist.
- PASS: Included required env vars.
- PASS: Included auth provider switch.
- PASS: Included DB provider switch.
- PASS: Included expected diagnostics.
- PASS: Included rollback to Local DB.
- PASS: Included Admin Site Setup steps.
- PASS: Included user/role migration steps.
- PASS: Added diagnostics that confirm whether Supabase Auth and Postgres are ready before activation.
- PASS: Recommended next PR only after the user creates Supabase DEV project and env vars.

## Validation Lane Report

- Impacted lane: DB/Auth provider diagnostics.
- Runtime JavaScript changed: Yes, because activation readiness diagnostics were added to provider contract output.
- Playwright impacted: Yes.
- Broad lanes skipped: full samples smoke, full engine, broad toolbox, full Playwright.
- Skip reason: targeted provider contract, sign-in, and DB Viewer validation covered the affected route/runtime surface.
- Samples decision: SKIP because samples are not in scope.
- V8 coverage: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- V8 coverage note: changed server-side dev-runtime JS is advisory WARN in browser V8 coverage and covered by Node tests.

## Commands Run

- PASS: `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`.
- PASS: `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`.
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` passed 9/9 tests.
- PASS: Targeted Playwright passed 3/3 tests for DB Viewer and sign-in/session routes.
- PASS: `npm run dev:local-api` started through `npm.cmd` on port `5537`.
- PASS: Local API provider diagnostics confirmed:
  - `activationReadiness.readyBeforeActivation = false` before Supabase config
  - active providers `local-db/local-db`
  - Supabase Auth status `adapter-inactive`
  - Supabase Postgres status `adapter-inactive`
  - secret values exposed `false`
  - server-only names exposed `false`
- PASS: `git diff --check`.

## Manual Validation Notes

- No Supabase runtime is active by default after this PR.
- No UAT/PROD auth behavior changed.
- No package dependency was added.
- No secrets were committed.
- Repo-structured ZIP path: `tmp/PR_26166_128-supabase-dev-activation-checklist_delta.zip`.
