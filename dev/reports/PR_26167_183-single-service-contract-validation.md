# PR_26167_183-single-service-contract-validation

## Summary

Added validation that active Account/product browser paths use Browser -> API/Service Contract -> configured server connections. The browser environment gate now checks Account sign-in/create/reset wiring, product API clients, no product-data fallback, no visible Account/product implementation wording, and documents remaining deprecated Local DB/SQLite debt.

Also removed visible provider implementation wording from the AI Assistant wireframe and made one Assets upload diagnostic provider-neutral.

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before execution.

## Requirement Checklist

- PASS - Added validation proving Browser -> API/Service Contract -> configured connections is the only active path.
- PASS - Account sign-in, create account, and password reset pages are validated to use the shared `account-auth-service.js` contract.
- PASS - Product data client validation proves server API/repository contracts are used and product routes do not fall back to SQLite/local-db.
- PASS - User-facing Account/product UI validation reports no DEV/UAT/PROD/Local/SQLite/Supabase/provider implementation wording.
- PASS - Remaining deprecated SQLite/local-db files are documented as inactive technical debt in `environment_agnostic_browser_gate_report.md`.
- PASS - No browser-owned auth/provider logic was added.
- PASS - No silent fallback was added.
- PASS - No UAT/PROD resources were touched.
- PASS - No secrets or `.env.local` content were committed.

## Validation Lane Report

- PASS - `node --check scripts\validate-browser-env-agnostic.mjs`
- PASS - `node --check toolbox\assets\assets.js`
- PASS - `node --check assets\theme-v2\js\account-auth-service.js`
- PASS - `node --check assets\theme-v2\js\account-auth-actions.js`
- PASS - `node --check assets\theme-v2\js\login-session.js`
- PASS - `npm run validate:browser-env-agnostic`
- PASS - `node --test tests\dev-runtime\ProductDataProviderContractHardening.test.mjs`
- PASS - `node --test tests\dev-runtime\SupabaseProductDataCutover.test.mjs`
- PASS - `node --test tests\dev-runtime\SupabaseProviderContractStub.test.mjs`
- WARN - Bare `node .\scripts\validate-supabase-dev.mjs` failed local Node TLS trust before app-level checks with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` and `SELF_SIGNED_CERT_IN_CHAIN`.
- PASS - `npm run validate:supabase-dev` passed with system CA; direct PostgreSQL TLS remained an advisory DEV warning.
- PASS - `npx playwright test tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs tests/playwright/account/SupabaseSignInSession.spec.mjs`
- PASS - `npm run test:workspace-v2` passed, 5 tests. Command name is legacy; user-facing language is Project Workspace.
- SKIP - Full samples smoke was not run because samples were not in scope.

## Manual Validation Notes

- Confirmed the browser-env gate reports PASS for Account/service-contract checks and product API/service-contract checks.
- Confirmed Account sign-in/create/reset pages are validated against the shared account service path.
- Confirmed active Account/product UI has no visible implementation wording for DEV/UAT/PROD/Local/SQLite/Supabase/provider terms.
- Confirmed remaining Local DB/SQLite references are documented as deprecated Admin/dev-runtime/compatibility debt with follow-up notes.

## Test Data Cleanup

No persistent Supabase validation records were created for this PR. Targeted Playwright used an in-memory fake Supabase server and closed it after validation.

## Playwright V8 Coverage

Generated `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

- WARN - `toolbox/assets/assets.js` was not collected by browser V8 coverage in this targeted lane; advisory only.
- WARN - Previously changed server-side runtime modules remain outside browser V8 collection; advisory only.
