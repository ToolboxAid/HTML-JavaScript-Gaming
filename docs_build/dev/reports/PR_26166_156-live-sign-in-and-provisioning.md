# PR_26166_156-live-sign-in-and-provisioning

## Branch Validation

- Current branch: main
- Expected branch: main
- Branch validation: PASS

## Summary

Made Supabase Create Account and Sign In usable end-to-end through backend API contracts.

- Create Account now uses server-owned Supabase Admin Auth user creation, provisions the matching `users` identity record, and assigns the default `user` role through `user_roles`.
- Sign In authenticates with Supabase Auth, resolves the matching app identity rows, and creates the current session state.
- Password Reset remains Supabase Auth provider-backed.
- Missing identity records now fail visibly with: `Account identity setup is incomplete. Please contact support.`
- Product data remains on Local DB with `GAMEFOUNDRY_DB_PROVIDER=local-db`.

## Requirement Checklist

- PASS - Main branch only; execution was on `main`.
- PASS - `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before implementation.
- PASS - Product data remains Local DB; no product-table migration was added.
- PASS - Backend API contracts remain the browser boundary; browser tests call pages/API, not provider-specific browser logic.
- PASS - Create Account creates a Supabase Auth user through server-side Admin Auth.
- PASS - Create Account provisions the matching `users` record server-side.
- PASS - Create Account assigns the default role through `user_roles`.
- PASS - Sign In authenticates with Supabase Auth.
- PASS - Sign In resolves `users`, `roles`, and `user_roles`.
- PASS - Sign In creates and returns current session state.
- PASS - Password Reset remains Supabase Auth provider-backed.
- PASS - Missing identity records fail visibly and actionably.
- PASS - No password tables were added.
- PASS - No secrets or `.env.local` files were committed.
- PASS - No silent fallback to Local DB auth was added.

## Changed Files

- `src/dev-runtime/auth/provider-contract-stubs.mjs`
- `src/dev-runtime/server/local-api-router.mjs`
- `tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26166_156-live-sign-in-and-provisioning.md`

## Impacted Lanes

- runtime: auth provider/server API routing.
- integration: Supabase identity table readiness and app session resolution.
- Playwright impacted: Yes.

## Validation Performed

- PASS - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS - `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
  - Result: 26 passed, 0 failed.
- PASS - `npm run validate:supabase-dev`
  - Overall Result: PASS.
  - Users, roles, and user_roles REST/API table checks: PASS.
  - Direct DB connection: WARN only, due to `SELF_SIGNED_CERT_IN_CHAIN`; REST/API identity readiness passed.
- PASS - `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Sign-in page uses a production-safe account form without public Local DB controls" --reporter=list`
  - Result: 1 passed.
- PASS - `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Configured account auth actions use external Auth and resolve the app session" --reporter=list`
  - Result: 1 passed.
- PASS - Live DEV API probe for create account, sign in, and session resolution.
- PASS - Live DEV API probe for missing identity failure.
- PASS - Live DEV API probe for password reset.
- PASS - `git diff --check`

## Live DEV Evidence

`npm run validate:supabase-dev`:

```text
PASS - .env.local loaded (6 key(s) loaded)
PASS - URL configured
PASS - Publishable key configured
PASS - Service role key configured
PASS - Database URL configured
PASS - Supabase reachable
PASS - TLS validation
PASS - Auth endpoint reachable
PASS - Service role authentication
WARN - Database connection (SELF_SIGNED_CERT_IN_CHAIN; REST/API identity readiness passed, so direct PostgreSQL TLS failure is advisory for DEV.)
PASS - users table
PASS - roles table
PASS - user_roles table
Overall Result: PASS
```

Create Account and Sign In live probe:

```json
{
  "createStatus": 200,
  "identityProvisioned": true,
  "signInStatus": 200,
  "sessionResolved": true,
  "currentSession": {
    "status": 200,
    "authenticated": true,
    "roleSlugs": ["user"],
    "userKeyLooksLikeUlid": true
  }
}
```

Missing identity live probe:

```json
{
  "authOnlyCreated": true,
  "signInStatus": 503,
  "error": "Account identity setup is incomplete. Please contact support.",
  "messageIsActionable": true
}
```

Password Reset live probe:

```json
{
  "passwordResetStatus": 200,
  "action": "password-reset",
  "redirectToIncluded": true,
  "message": "If an account exists for that email, password reset instructions will be sent."
}
```

## V8 Coverage

- Coverage artifact: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Coverage status: WARN advisory for changed Node/server runtime modules because Chromium V8 coverage does not collect those files.
- Browser auth scripts were exercised by the targeted Playwright runs.

## Skipped Lanes

- samples: SKIP - full samples smoke was explicitly out of scope.
- product table migration: SKIP - product data remains Local DB by requirement.
- full workspace suite: SKIP - targeted auth/session validation was the requested lane for this PR.

## Manual Validation Notes

1. Start the dev runtime with Supabase auth environment configured and `GAMEFOUNDRY_DB_PROVIDER=local-db`.
2. Open `account/create-account.html`.
3. Create a new account with an email and password.
4. Open `account/sign-in.html` and sign in with that account.
5. Confirm the session resolves with a `user` role.
6. Open `account/password-reset.html` and request reset instructions.
7. Confirm no browser-visible secrets are shown and failures use production-safe messages.
