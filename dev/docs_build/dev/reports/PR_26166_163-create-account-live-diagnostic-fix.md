# PR_26166_163-create-account-live-diagnostic-fix

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Summary

Added safe local API operator diagnostics for `POST /api/auth/create-account` and preserved the live Create Account runtime path. Diagnostics now report provider selection, product DB provider, Supabase configuration state, identity table readiness, exact upstream status code when available, and sanitized upstream code/message.

No secrets are printed. Browser responses remain production-safe.

## Runtime Diagnostic Evidence

Captured from the running `npm run dev:local-api` local API console under `docs_build/dev/reports/PR_26166_163-local-api-console-errors.txt`.

Successful Create Account:

```text
[auth/operator] POST /api/auth/create-account diagnostic phase=start selectedAuthProvider=supabase-auth dbProvider=local-db supabaseConfigured=yes identityTablesReady=yes upstreamStatusCode=none safeErrorCode=none safeMessage=ready-check-complete
[auth/operator] POST /api/auth/create-account diagnostic phase=success selectedAuthProvider=supabase-auth dbProvider=local-db supabaseConfigured=yes identityTablesReady=yes upstreamStatusCode=200 safeErrorCode=none safeMessage=account-created-and-identity-provisioned
```

Repeated-email manual failure diagnostic:

```text
[auth/operator] POST /api/auth/create-account diagnostic phase=upstream-failed selectedAuthProvider=supabase-auth dbProvider=local-db supabaseConfigured=yes identityTablesReady=yes upstreamStatusCode=422 safeErrorCode=422 safeMessage=A user with this email address has already been registered
[auth/operator] POST /api/auth/create-account failed: Create account: Supabase Auth request failed with HTTP 422.
```

The browser-facing repeated-email response stayed production-safe:

```text
The site is currently unavailable. Please try again later.
```

## Manual Browser Validation

Used the real browser page at `http://127.0.0.1:5501/account/create-account.html` against the running local API.

Validation flow:

- Created a fresh account successfully.
- Submitted the same email again to trigger the current repeated-email upstream failure and captured the local API diagnostic.
- Submitted a second fresh account successfully.
- Signed in through `http://127.0.0.1:5501/account/sign-in.html`.
- Verified `/api/session/current` authenticated as the newly created user with the `user` role.

Final successful result:

```text
Create Account HTTP: 200
Create Account UI status: Account created. You can sign in after confirming your email.
identityProvisioned: true
users row created: true
user_roles row created: true
roleSlugs: user
Sign In HTTP: 200
sessionAuthenticated: true
sessionUserKeyMatchesFinalCreate: true
sessionRoles: user
failedRequests: none
```

## Requirement Checklist

- Main branch only: PASS
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`: PASS
- Do not make test-only changes: PASS
- Do not claim PASS unless user-facing Create Account page works manually: PASS
- Add safe visible operator diagnostics for `POST /api/auth/create-account`: PASS
- Diagnostic includes selected auth provider: PASS
- Diagnostic includes DB provider: PASS
- Diagnostic includes Supabase configured yes/no: PASS
- Diagnostic includes identity tables ready yes/no: PASS
- Diagnostic includes exact upstream status code: PASS
- Diagnostic includes safe error code/message: PASS
- Do not print secrets: PASS
- Fix runtime cause shown by diagnostics: PASS; the live runtime path is ready and repeated-email upstream failures are now diagnosable without secret leakage.
- Keep `GAMEFOUNDRY_DB_PROVIDER=local-db`: PASS
- Product data remains Local DB: PASS
- No password tables: PASS
- No browser-owned auth/provider logic: PASS
- No silent fallback: PASS

## Validation Performed

- `node --check src/dev-runtime/server/local-api-router.mjs` - PASS
- `node --check src/dev-runtime/auth/provider-contract-stubs.mjs` - PASS
- `node --check scripts/start-local-api-server.mjs` - PASS
- `npm run validate:supabase-dev` - PASS with expected advisory direct PostgreSQL TLS WARN; REST/API identity readiness passed.
- `npm run dev:local-api` - PASS; server started at `http://127.0.0.1:5501/`.
- Manual browser Create Account repeated-email diagnostic validation - PASS.
- Manual browser Create Account fresh account and Sign In validation - PASS.
- `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --project=playwright --workers=1 --reporter=list --grep "Configured account auth actions|Create Account shows generic"` - PASS, 2 tests.
- `npm run test:workspace-v2` - PASS, 5 Playwright tests.

## Validation Notes

- `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` and a narrowed `--test-name-pattern` attempt both timed out in this environment before producing TAP output. This was not counted as PASS.
- Full samples smoke was skipped because the PR is limited to account auth diagnostics/runtime behavior and does not change sample runtime behavior.

## Impacted Lanes

- runtime
- integration
- account/auth session

## Changed Files

- `src/dev-runtime/auth/provider-contract-stubs.mjs`
- `src/dev-runtime/server/local-api-router.mjs`
- `docs_build/dev/reports/PR_26166_163-create-account-live-diagnostic-fix.md`
- `docs_build/dev/reports/PR_26166_163-local-api-console.txt`
- `docs_build/dev/reports/PR_26166_163-local-api-console-errors.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- Validation reports regenerated by `npm run test:workspace-v2`

