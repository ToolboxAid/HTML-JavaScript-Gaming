# PR_26166_148-supabase-auth-readiness-gate

## Branch Validation
- PASS: current branch `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: `/api/auth/status` now proves Supabase Auth selected/configured/ready by checking provider selection, browser-safe config, Local DB product-data provider, and live `/auth/v1/health` connectivity before reporting `ready=true`.
- PASS: Missing or failed Supabase connectivity returns `ready=false`, `status=unavailable`, generic browser message, and operator-safe diagnostics.
- PASS: No product DB migration was added.
- PASS: No secrets or `.env.local` changes were made.

## Validation Lane Report
- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Sign-in page uses|Configured account auth actions" --reporter=list`
- PASS: `npm run test:workspace-v2`

## Live/Manual Notes
- Local env probe: `selected=true`, `configured=true`, `localDbProductDataActive=true`, `connectivityStatus=failed`, `ready=false`.
- This is expected readiness-gate behavior when connectivity cannot be proven.

## Playwright V8 Coverage
- See `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- Coverage WARN: server router JS is Node runtime and not collected by browser V8; browser auth JS is covered.

## Skipped Lanes
- Samples smoke: SKIP. Auth readiness does not touch samples or sample manifests.
