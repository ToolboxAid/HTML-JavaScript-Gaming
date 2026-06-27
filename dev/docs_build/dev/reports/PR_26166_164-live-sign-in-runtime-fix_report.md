# PR_26166_164-live-sign-in-runtime-fix Report

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Local branches found: `main`
- Branch validation: PASS

## Requirement Checklist

- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS - Main branch only: branch gate passed on `main`.
- PASS - Reproduced Sign In through `/account/sign-in.html` using `npm run dev:local-api`.
- PASS - Captured safe operator diagnostics for `POST /api/auth/sign-in`.
- PASS - Fixed runtime cause by adding sign-in phase diagnostics and using the already resolved auth readiness status for the sign-in action path.
- PASS - Sign In authenticates through Supabase Auth (`authProviderId=supabase-auth`).
- PASS - Sign In resolves the server session after Supabase Auth password grant.
- PASS - Sign In resolves the app `users` row, `roles`, and `user_roles` through the Supabase identity table provider.
- PASS - `/api/session/current` returns an authenticated user and `roleSlugs=["user"]`.
- PASS - `GAMEFOUNDRY_DB_PROVIDER=local-db` remained active.
- PASS - Product data remains Local DB (`databaseProviderId=local-db`, `localDbProductDataActive=true`).
- PASS - No `.env.local` or secret files changed.
- PASS - No password tables were added or modified.
- PASS - No browser-owned auth/provider logic was added.
- PASS - No silent fallback was added; failures return generic browser errors plus safe operator diagnostics.
- PASS - Full samples smoke was not run; samples are out of scope for this auth/session runtime PR.

## Validation Lane Report

- Runtime/auth lane: PASS
  - `node --check src/dev-runtime/server/local-api-router.mjs`
  - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- Targeted auth/session Playwright lane: PASS
  - `npx playwright test tests/playwright/account/SupabaseSignInSession.spec.mjs --project=playwright --workers=1 --reporter=list`
- Supabase DEV lane: PASS with advisory WARN
  - `npm run validate:supabase-dev`
  - WARN: direct PostgreSQL TLS returned `SELF_SIGNED_CERT_IN_CHAIN`; REST/API identity readiness passed, so the validator classified this as advisory for DEV.
- Local API manual/UAT lane: PASS
  - `npm run dev:local-api`
  - Server reported `Local API auth provider: supabase-auth` and `Local API product data provider: local-db`.
- Skipped lanes: engine, broad integration, samples, and full samples smoke.
  - Reason: changes are scoped to dev-runtime auth/session routing and targeted account Playwright validation.

## Manual Validation Notes

- Started the local API with `npm run dev:local-api`.
- Opened `/account/create-account.html` through Playwright against `http://127.0.0.1:5501`.
- Created a fresh throwaway DEV account through the page.
- Opened `/account/sign-in.html?returnTo=account/achievements.html`.
- Signed in with the newly created account through the page.
- Observed successful redirect to `/account/achievements.html`.
- Called `/api/session/current` after Sign In:
  - `authenticated=true`
  - `roleSlugs=["user"]`
  - `userKey` matched the user key returned by Create Account.
- Observed no page errors, console errors, or failed same-origin browser requests.

## Safe Operator Diagnostics

Captured from the local API stderr log:

```text
[auth/operator] POST /api/auth/sign-in diagnostic phase=start selectedAuthProvider=supabase-auth dbProvider=local-db supabaseConfigured=yes identityTablesReady=yes upstreamStatusCode=none safeErrorCode=none safeMessage=ready-check-complete
[auth/operator] POST /api/auth/sign-in diagnostic phase=success selectedAuthProvider=supabase-auth dbProvider=local-db supabaseConfigured=yes identityTablesReady=yes upstreamStatusCode=200 safeErrorCode=none safeMessage=session-resolved
```

No email, password, access token, refresh token, service role key, anon key, or raw secret value appeared in the captured sign-in diagnostics.

## Playwright V8 Coverage

- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Status: generated.
- Notes: Playwright browser V8 coverage exercised the account page scripts. Server-side runtime files are listed as WARN/not collected by browser V8 coverage, which is advisory per project instructions.

## Files Changed

- `src/dev-runtime/server/local-api-router.mjs`
- `tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- `tests/playwright/account/SupabaseSignInSession.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26166_164-live-sign-in-runtime-fix_report.md`
