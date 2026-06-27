# PR_26166_152-session-user-role-resolution

## Branch Validation
- PASS: current branch `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: Signed-in Supabase Auth payload resolves backend session through provider-owned `users`, `roles`, and `user_roles`.
- PASS: `users.key` remains the app ownership reference returned in session data.
- PASS: `GAMEFOUNDRY_DB_PROVIDER=local-db` is preserved for product data.
- PASS: Product tables remain on Local DB; no games/assets/objects/controls/tool metadata migration was added.
- PASS: No browser-generated authoritative keys were added.
- PASS: No secrets or `.env.local` commits were added.
- PASS: Missing user/role paths fail visibly through generic browser-safe action failure and operator-safe backend diagnostics.

## Validation Lane Report
- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Sign-in page uses|Configured account auth actions" --reporter=list`
- PASS: `npm run test:workspace-v2`

## Manual Notes
- Fake Supabase sign-in resolves `supabase-user-1` to seeded DEV `User 1`.
- `/api/session/current` returns authenticated `User 1` with role `user` after sign-in.
- Service role values are used only server-side by the provider contract and are not exposed in browser responses.

## Playwright V8 Coverage
- See `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Skipped Lanes
- Full samples smoke: SKIP. Session identity resolution does not touch sample manifests or runtime samples.
