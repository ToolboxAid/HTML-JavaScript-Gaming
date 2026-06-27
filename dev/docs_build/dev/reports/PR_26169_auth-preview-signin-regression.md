# PR_26169_auth-preview-signin-regression

## Branch Validation
- PASS - Current branch is `main`.

## Summary
- Fixed the preview fallback regression by changing `/api/auth/status` to report account action availability from configured Supabase Auth browser-safe env, not strict operator preflight readiness.
- Sign In, Create Account, and Password Reset now reach the configured Supabase Auth adapter when config is present.
- Strict Supabase connectivity and identity-table readiness checks remain on operator preflight and post-auth session/identity resolution.
- Missing Supabase Auth config still shows the safe preview fallback message.

## Requirement Checklist
- PASS - Reviewed `/account/sign-in.html` and related auth JS.
- PASS - Root cause identified: `/api/auth/status` used `authStatusForRoute()`, which ran live connectivity and identity readiness checks before enabling the form.
- PASS - Safe fallback preserved when no Supabase Auth provider/config is available.
- PASS - Supabase config present enables Sign In and attempts real Supabase Auth.
- PASS - Create Account and Password Reset links remain wired and covered by Playwright.
- PASS - Existing operator preflight/toggle activation behavior remains strict and reports failed connectivity.
- PASS - Guest/static browsing support remains available.
- PASS - No memberships, legal, billing, marketplace, database schema, or backend enforcement changes.
- PASS - No secrets or passwords exposed in responses or tests.

## Validation Lanes
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS - `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- PASS - Targeted Node auth route validation:
  `node --test --test-name-pattern "Missing Supabase config|Configured Supabase Auth enables sign-in attempt before identity readiness|Account auth routes call external Supabase Auth|Default Supabase Auth routes call external auth|Supabase account actions fail actionably when identity tables are missing|Operator auth preflight reports failed Supabase connectivity" tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS - Targeted Playwright sign-in behavior:
  `node node_modules/@playwright/test/cli.js test tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Sign-in page uses a production-safe|Configured account auth actions" --project=playwright --workers=1 --reporter=line`
- PASS - Static-only account API fallback:
  `node node_modules/@playwright/test/cli.js test tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs --project=playwright --workers=1 --reporter=line`
- PASS - `git diff --check` before generating `codex_review.diff`; final check also passed with `docs_build/dev/reports/codex_review.diff` excluded because the generated diff artifact contains diff-context whitespace.
- FAIL - `node scripts/validate-browser-env-agnostic.mjs` still reports existing product-data route guardrail findings in `src/dev-runtime/server/local-api-router.mjs`; no auth-specific account service findings were reported.

## Manual Validation Notes
- With Supabase Auth URL and anon key present, `/api/auth/status` returns ready and the Sign In page enables the submit button.
- In the targeted test fixture without a configured Postgres database, Sign In calls `/auth/v1/token?grant_type=password` and then shows the safe identity setup failure.
- Without Supabase Auth config, the Sign In button remains disabled and shows: `Sign In is not available in this preview. You can continue browsing.`
- Password Reset reaches Supabase Auth and returns the expected safe success copy.
- The Playwright fixture logs known missing product-data/database resource noise for platform banner and expected 503 auth identity failures; no browser page errors were observed.
- Runtime startup still reads `.env`; `.env.local` was not modified and no secrets were printed.
