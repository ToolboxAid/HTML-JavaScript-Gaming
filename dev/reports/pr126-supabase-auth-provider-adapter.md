# PR_26166_126 Supabase Auth Provider Adapter

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.
- Starting HEAD: `76c481568 Add config-gated Supabase Auth and Postgres providers with DEV activation checklist - PR_26166_126-128-supabase-provider-implementation`.

## Scope Notes

- PASS: Stayed in the DB/Auth migration lane.
- PASS: Started from `docs_build/dev/reports/pr125-supabase-dev-provider-prep.md`.
- PASS: Supabase Auth remains config-gated and inactive by default.
- PASS: Local DB remains the active DEV auth path by default.
- PASS: No production sign-in behavior was activated for Supabase.
- PASS: No secrets or password tables were added.

## Supabase Auth Adapter Audit

- PASS: Existing provider contract exposes future Auth operations:
  - `getCurrentUser`
  - `signIn`
  - `signOut`
  - `createAccount`
  - `requestPasswordReset`
  - `requireRole`
- PASS: `SupabaseAuthProviderAdapter` uses browser-safe Supabase environment config only:
  - `GAMEFOUNDRY_SUPABASE_URL`
  - `GAMEFOUNDRY_SUPABASE_ANON_KEY`
- PASS: Service-role values are not used by the Auth adapter.
- PASS: Missing Auth config fails visibly with actionable diagnostics.
- PASS: Auth user mapping remains server-owned:
  - external auth user id maps to `users.key`
  - browser-owned authoritative user keys are not allowed
- PASS: Local DB placeholder sign-in remains unchanged unless the auth provider selector is explicitly switched.

## Secrets Audit

- PASS: No real Supabase URL was committed.
- PASS: No real Supabase anon key was committed.
- PASS: No real Supabase service-role key was committed.
- PASS: No real database URL was committed.
- PASS: No package dependency was added.
- PASS: No custom password table or app-owned password storage was added.
- PASS: Test-only sentinel strings are not real keys and are asserted not to appear in API provider diagnostics.

## Local DB Default Audit

- PASS: `/api/providers/contract` reports active auth provider `local-db`.
- PASS: `/api/session/current` remains Local DB-backed through the current local session flow.
- PASS: `account/sign-in.html` opens successfully through the Local API route.
- PASS: Supabase Auth reports `adapter-inactive` without DEV Supabase config.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Verified current branch is `main`.
- PASS: Stayed in DB/Auth migration lane.
- PASS: Started from PR125 report.
- PASS: Scoped PR126 to Supabase Auth provider adapter validation.
- PASS: Did not make Supabase active by default.
- PASS: Did not add secrets.
- PASS: Did not store passwords in app tables.
- PASS: Kept Local DB active by default.
- PASS: Supported future Auth operations through the provider contract.
- PASS: Used environment config only.
- PASS: Confirmed browser/API payloads never receive service-role secrets.
- PASS: Missing Supabase config produces visible actionable diagnostics.
- PASS: Local DB sign-in placeholder/local flow remains unchanged unless provider is explicitly switched.

## Validation Lane Report

- Impacted lane: DB/Auth provider contract and local sign-in route.
- Runtime JavaScript changed in this session: Yes, shared provider diagnostics were updated during the PR127/PR128 continuation.
- Playwright impacted: Yes.
- Broad lanes skipped: full samples smoke, full engine, broad toolbox, full Playwright.
- Skip reason: this sequence changes only provider contract diagnostics and targeted DB/Auth adapter surfaces.
- Samples decision: SKIP because no sample JSON, sample loader, or game runtime file changed.
- Legacy command note: `npm run test:workspace-v2` was not used because targeted provider and route validation existed; the command name remains legacy while user-facing language is Project Workspace.

## Commands Run

- PASS: `git branch --show-current` returned `main`.
- PASS: `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`.
- PASS: `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`.
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` passed 9/9 tests.
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs tests/playwright/tools/AdminDbViewer.spec.mjs -g "Sign-in page uses a production-safe account form without public Local DB controls|Protected pages block direct URL access without the required Local session role|Admin DB Viewer shows current read-only Local DB tables, filters, users, roles, and diagnostics" --project=playwright --workers=1 --reporter=list` passed 3/3 tests.
- PASS: `npm run dev:local-api` started through `npm.cmd` on port `5537`.
- PASS: Local API route probes returned:
  - `/api/providers/contract`: active auth/database providers `local-db/local-db`
  - `/account/sign-in.html`: HTTP 200
  - `/admin/db-viewer.html`: HTTP 200
- PASS: `git diff --check`.

## Manual Validation Notes

- The first Local API start attempt used `npm` directly and Windows rejected it as not a Win32 executable. The same package script passed through `npm.cmd`.
- Playwright V8 coverage was refreshed at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- The changed dev-runtime provider file is server-side and is listed as advisory WARN in V8 coverage; direct Node contract coverage passed.
- Repo-structured ZIP path: `tmp/PR_26166_126-supabase-auth-provider-adapter_delta.zip`.
