# PR_26169_024-environment-banner-all-pages

## Purpose
Ensure the shared Theme V2 banner pattern renders a server-safe environment banner consistently across shared-layout public/root, Account, Admin, Owner, Legal, and Memberships pages.

## Scope
- Reuse the existing `.platform-banner` Theme V2 pattern and `gamefoundry-partials.js` shared-layout renderer.
- Add a server API route that exposes only browser-safe public configuration derived from runtime `.env` values.
- Support these safe public `.env` keys:
  - `GAMEFOUNDRY_SITE_URL`
  - `GAMEFOUNDRY_API_URL`
  - `GAMEFOUNDRY_ENVIRONMENT_LABEL`
- Preserve existing storage config, including `GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX`.
- Keep browser code from reading `.env` or receiving secrets.
- Keep the existing DB-backed platform settings banner route and admin editor as the platform banner system of record.
- Do not touch `archive/v1-v2`, samples, or unrelated Theme V2 migrations.

## Target Files
- `src/dev-runtime/server/local-api-router.mjs`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `.env.example`
- `tests/dev-runtime/PublicEnvironmentConfig.test.mjs`
- `tests/playwright/tools/EnvironmentBannerCoverage.spec.mjs`
- Existing targeted platform banner test assertions if needed:
  - `tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`

## Behavior
- PRD/Production label hides the environment banner by default.
- Any configured non-production label renders a visible environment banner using the label text from `GAMEFOUNDRY_ENVIRONMENT_LABEL`.
- Missing `GAMEFOUNDRY_ENVIRONMENT_LABEL` on a local API-backed page renders a visible actionable diagnostic banner.
- Server responses expose only safe public config values and diagnostics.
- Browser diagnostics remain separate from secret config and do not expose server-only values.

## Validation
- Verify current branch is `main`.
- Run `node --check` for each touched JavaScript file.
- Run targeted environment/config validation:
  - `npm run validate:browser-env-agnostic`
  - `node --test tests/dev-runtime/PublicEnvironmentConfig.test.mjs`
- Run targeted shared-layout/admin-owner/page validation:
  - `npx playwright test tests/playwright/tools/EnvironmentBannerCoverage.spec.mjs`
  - `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs -g "Platform banner"`
  - `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs -g "Platform Settings Admin controls"`
  - `npx playwright test tests/playwright/tools/AdminOwnerNavigationBoundary.spec.mjs`
- Run `git diff --check`.
- Do not run full samples smoke.

## Reports
- `docs_build/dev/reports/PR_26169_024-environment-banner-all-pages.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26169_024-environment-banner-all-pages_delta.zip`
