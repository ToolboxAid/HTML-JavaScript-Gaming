# PR_26166_157-first-real-sign-in-validation

## Branch Validation

- Current branch: main
- Expected branch: main
- Branch validation: PASS

## Purpose

Validate real Supabase Create Account, Sign In, Session, Role Resolution, Sign Out, and Password Reset flows without adding new infrastructure.

## Requirement Checklist

- PASS - Real Create Account path validated against configured DEV Supabase.
- PASS - Real Sign In path validated against configured DEV Supabase.
- PASS - Current Session path validated after sign in.
- PASS - Role resolution validated; created account resolved with `user`.
- PASS - Sign Out validated; session returned to unauthenticated.
- PASS - Password Reset validated with production-safe message.
- PASS - No new infrastructure was added for this validation PR.
- PASS - Product data remained Local DB.
- PASS - No full samples smoke was run.

## Validation Lane Report

- contract: PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- runtime: PASS - live local API probe against configured DEV Supabase.
- integration: PASS - `npm run validate:supabase-dev`
- Playwright: PASS - targeted auth/session Playwright subset.
- samples: SKIP - explicitly out of scope.

## Changed Files

- Dedicated runtime implementation: none for this validation PR.
- Stack reports/artifacts: `docs_build/dev/reports/*`
- Shared stack tests: `tests/playwright/tools/LoginSessionMode.spec.mjs`

## Playwright V8 Coverage

- Artifact: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Status: WARN advisory for files not collected by current Chromium V8 coverage; targeted behavior validation passed.

## Skipped Lanes

- samples: SKIP - explicitly out of scope.
- full workspace suite: SKIP - targeted auth/session validation was requested for this stack.

## Live DEV Evidence

Sanitized live UAT probe:

```json
{
  "authStatus": {
    "status": 200,
    "configured": true,
    "ready": true,
    "identityTablesReady": true,
    "productDataProvider": "local-db"
  },
  "createAccount": {
    "status": 200,
    "identityProvisioned": true,
    "roleSlugs": ["user"],
    "userKeyLooksLikeUlid": true
  },
  "signIn": {
    "status": 200,
    "sessionResolved": true,
    "roleSlugs": ["user"]
  },
  "signedInSession": {
    "status": 200,
    "authenticated": true,
    "roleSlugs": ["user"],
    "userKeyLooksLikeUlid": true
  },
  "signOut": {
    "status": 200,
    "authenticated": false
  },
  "signedOutSession": {
    "status": 200,
    "authenticated": false,
    "displayName": "Login"
  },
  "passwordReset": {
    "status": 200,
    "action": "password-reset",
    "message": "If an account exists for that email, password reset instructions will be sent."
  }
}
```

## Manual Validation Notes

1. Start the local API runtime with Supabase Auth env configured and `GAMEFOUNDRY_DB_PROVIDER=local-db`.
2. Open `account/create-account.html` and create a new account.
3. Open `account/sign-in.html`, sign in, and confirm the Account nav shows the signed-in user.
4. Confirm `/api/session/current` returns authenticated with the `user` role.
5. Use the Account logout action and confirm the session returns to signed out.
6. Open `account/password-reset.html` and request a password reset.
