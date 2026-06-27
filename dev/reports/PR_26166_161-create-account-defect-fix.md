# PR_26166_161-create-account-defect-fix

## Branch Validation

- Current branch: main
- Expected branch: main
- Branch validation: PASS

## Purpose

Fix and validate Create Account failure handling for live Supabase DEV account creation.

## Requirement Checklist

- PASS - Main branch guard passed.
- PASS - `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read first.
- PASS - `GAMEFOUNDRY_DB_PROVIDER=local-db` remains the expected product data provider.
- PASS - Product data remains Local DB.
- PASS - No secrets were added.
- PASS - `.env.local` was not modified.
- PASS - No password tables were added.
- PASS - No browser-owned auth/provider logic was added.
- PASS - `POST /api/auth/create-account` was traced end-to-end.
- PASS - Safe operator diagnostics are logged for exact backend failures.
- PASS - Browser message remains production-safe for provider failures.
- PASS - Supabase Auth success followed by identity provisioning failure shows account-support message.
- PASS - Supabase Auth failure reports generic browser unavailable plus safe operator diagnostics in server logs.
- PASS - `users`, `roles`, and `user_roles` provisioning was validated.

## Implementation Notes

- `src/dev-runtime/server/local-api-router.mjs`
  - Added auth-route-only safe operator diagnostics logging.
  - Split Create Account into provider creation and identity provisioning phases.
  - Provider creation failures return generic unavailable to the browser and log sanitized operator diagnostics.
  - Post-Auth identity provisioning failures return `Account identity setup is incomplete. Please contact support.`
  - Removed remaining provider wording from the sanitized account-auth action message.
- `tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
  - Added failure simulation for Supabase Admin Auth create-user.
  - Added malformed successful Auth response simulation.
  - Added tests for provider failure diagnostics and identity provisioning support message.
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
  - Added browser Create Account checks for provider failure versus identity provisioning failure.

## Changed Files

- `src/dev-runtime/server/local-api-router.mjs`
- `tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
- `docs_build/dev/reports/PR_26166_161-create-account-defect-fix.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`

## Create Account Trace

Successful path:

1. Browser posts `/api/auth/create-account`.
2. Backend resolves Supabase Auth readiness and Local DB product-data mode.
3. Backend calls Supabase Admin Auth create-user with the server-only service role.
4. Backend provisions/updates `users`.
5. Backend ensures default `user` role exists in `roles`.
6. Backend creates `user_roles` assignment.
7. Backend returns production-safe Create Account success data.

Provider failure path:

1. Supabase Admin Auth create-user fails.
2. Browser receives `The site is currently unavailable. Please try again later.`
3. Server logs a safe operator diagnostic such as:
   - `[auth/operator] POST /api/auth/create-account failed: Create account: Supabase Auth request failed with HTTP 422.`

Identity provisioning failure path:

1. Supabase Auth create-user succeeds.
2. Identity provisioning cannot complete.
3. Browser receives `Account identity setup is incomplete. Please contact support.`
4. Server logs the safe operator diagnostic for the failed provisioning step.

## Validation Lane Report

- PASS - `npm run validate:supabase-dev`
  - Overall Result: PASS.
  - Direct database connection remains WARN for `SELF_SIGNED_CERT_IN_CHAIN`; REST/API identity readiness passed.
- PASS - changed-file syntax checks:
  - `node --check src/dev-runtime/server/local-api-router.mjs`
  - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
  - `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
  - `node --check assets/theme-v2/js/account-auth-actions.js`
  - `node --check assets/theme-v2/js/login-session.js`
- PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
  - 28 passed, 0 failed.
- PASS - targeted Create Account Playwright validation:
  - `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Sign-in page uses|Configured account auth actions|Account auth actions show actionable identity setup|Create Account shows generic provider failure" --reporter=list`
  - 4 passed, 0 failed.
- PASS - live Supabase DEV Create Account probe.
- PASS - `git diff --check`.

## Live Supabase DEV Evidence

Sanitized live Create Account probe:

```json
{
  "authStatus": {
    "status": 200,
    "ready": true,
    "identityTablesReady": true,
    "productDataProvider": "local-db"
  },
  "createAccount": {
    "status": 200,
    "identityProvisioned": true,
    "identityTableRecords": {
      "roles": 1,
      "user_roles": 5,
      "users": 5
    },
    "roleCreated": false,
    "userRoleCreated": true,
    "roleSlugs": ["user"],
    "userKeyLooksLikeUlid": true
  },
  "signIn": {
    "status": 200,
    "sessionResolved": true,
    "roleSlugs": ["user"]
  },
  "session": {
    "status": 200,
    "authenticated": true,
    "roleSlugs": ["user"],
    "userKeyLooksLikeUlid": true
  }
}
```

## Playwright V8 Coverage

- Artifact: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Result: PASS/WARN.
- `assets/theme-v2/js/account-auth-actions.js`: 100% advisory V8 function coverage.
- `assets/theme-v2/js/login-session.js`: 100% advisory V8 function coverage.
- `src/dev-runtime/server/local-api-router.mjs`: WARN because browser V8 coverage does not collect Node server modules; covered by provider contract tests.

## Skipped Lanes

- samples: SKIP - full samples smoke was explicitly out of scope.
- product DB migration: SKIP - product data must remain Local DB.
- full workspace suite: SKIP - targeted Create Account/auth validation was requested.

## Manual Validation Notes

1. Run `npm run validate:supabase-dev`.
2. Start local API runtime with Supabase Auth configured and `GAMEFOUNDRY_DB_PROVIDER=local-db`.
3. Open `account/create-account.html`.
4. Create a new account.
5. Confirm the page shows the account-created success message.
6. Sign in with the new account.
7. Confirm `/api/session/current` returns authenticated with the `user` role.
8. For provider failures, confirm the browser shows generic unavailable while server logs a safe `[auth/operator]` diagnostic.
9. For identity provisioning failures, confirm the browser shows the account-support message.
