# PR_26169_024-environment-banner-all-pages

## Summary
Added a server-safe public config route for environment banner data and rendered it through the existing shared Theme V2 `.platform-banner` pattern on shared-layout pages. The existing DB-backed platform settings banner remains intact and can coexist with the environment banner.

## Branch Guard
- Current branch: `main`
- Expected branch: `main`
- Local branches found: `main`
- Branch validation: PASS

## Requirement Checklist
| Requirement | Status | Evidence |
| --- | --- | --- |
| Environment banner appears consistently on shared public/root pages | PASS | `EnvironmentBannerCoverage.spec.mjs` checks `/index.html`. |
| Environment banner appears on Marketplace pages | PASS | `EnvironmentBannerCoverage.spec.mjs` checks `/marketplace/index.html`. |
| Environment banner appears on Learn pages | PASS | `EnvironmentBannerCoverage.spec.mjs` checks `/learn/index.html`. |
| Environment banner appears on Account pages | PASS | `EnvironmentBannerCoverage.spec.mjs` checks `/account/sign-in.html`. |
| Environment banner appears on Admin pages | PASS | `EnvironmentBannerCoverage.spec.mjs` checks `/admin/system-health.html`. |
| Environment banner appears on Owner pages | PASS | `EnvironmentBannerCoverage.spec.mjs` checks `/owner/memberships.html`. |
| Environment banner appears on Legal pages if present | PASS | `EnvironmentBannerCoverage.spec.mjs` checks `/legal/disclaimer.html`. |
| Environment banner appears on Memberships page if present | PASS | `EnvironmentBannerCoverage.spec.mjs` checks `/memberships/index.html`. |
| No second competing banner system | PASS | Reused `.platform-banner` markup/classes and existing shared-layout renderer in `gamefoundry-partials.js`. |
| Banner data comes from server-safe `.env` config | PASS | `/api/public/config` returns only `publicConfig`, `environmentBanner`, and diagnostics from `process.env`. |
| Browser does not read `.env` directly | PASS | Browser fetches `/api/public/config`; no `.env` browser access added. |
| Browser does not receive secrets | PASS | `PublicEnvironmentConfig.test.mjs` verifies database URL, service role, and storage credentials names/values are absent. |
| PRD/Production shows no banner by default | PASS | Node and Playwright tests verify `Production` hides environment banner. |
| DEV/IST/UAT-style labels show visible banner | PASS | Tests use `Development Environment`; route displays configured non-production labels. |
| Missing local API-backed label shows actionable diagnostic | PASS | Node and Playwright tests verify visible `GAMEFOUNDRY_ENVIRONMENT_LABEL`/`.env` diagnostic. |
| Do not infer environment from hostname when config exists | PASS | Hostname is used only for missing-label local diagnostic; configured label controls display. |
| Do not touch archive or samples | PASS | No `archive/v1-v2` or sample files changed. |

## Changed Files
- `.env.example`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `src/dev-runtime/server/local-api-router.mjs`
- `tests/dev-runtime/PublicEnvironmentConfig.test.mjs`
- `tests/playwright/tools/EnvironmentBannerCoverage.spec.mjs`
- `tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`
- `docs_build/pr/BUILD_PR_26169_024-environment-banner-all-pages.md`
- `docs_build/dev/reports/environment_agnostic_browser_gate_report.md`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`

## Validation
| Command | Result |
| --- | --- |
| `node --check src/dev-runtime/server/local-api-router.mjs` | PASS |
| `node --check assets/theme-v2/js/gamefoundry-partials.js` | PASS |
| `node --check tests/dev-runtime/PublicEnvironmentConfig.test.mjs` | PASS |
| `node --check tests/playwright/tools/EnvironmentBannerCoverage.spec.mjs` | PASS |
| `node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs` | PASS |
| `node --test tests/dev-runtime/PublicEnvironmentConfig.test.mjs` | PASS, 3/3 |
| `npm run validate:browser-env-agnostic` | PASS |
| `npx playwright test tests/playwright/tools/EnvironmentBannerCoverage.spec.mjs` | PASS, 3/3 |
| `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs -g "Platform banner"` | PASS, 2/2 |
| `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs -g "Platform Settings Admin controls"` | PASS, 1/1 |
| `npx playwright test tests/playwright/tools/AdminOwnerNavigationBoundary.spec.mjs` | PASS, 3/3 |
| `git diff --check` | PASS with line-ending warnings only |

## Playwright
- Playwright impacted: Yes.
- Behavior validated: shared-layout environment banner rendering, missing-label diagnostic, Production hiding, platform banner coexistence, and Admin/Owner navigation after shared layout changes.
- Expected pass behavior: configured non-production label renders header/footer environment banners; Production renders none; missing local label renders danger diagnostic; platform settings banner keeps its own source-specific rendering.
- Expected fail behavior: missing safe public config route, secret exposure, absent banner on covered page families, or platform banner count collision would fail targeted tests.
- V8 coverage: `docs_build/dev/reports/playwright_v8_coverage_report.txt` includes `assets/theme-v2/js/gamefoundry-partials.js` at 71%. Guardrail warnings are advisory and include unrelated HEAD-changed JS files from the coverage helper.

## Lanes
- Executed:
  - runtime/config: public config API and safe env exposure.
  - shared Theme V2 page/runtime: shared banner renderer.
  - targeted admin/owner navigation: shared layout dependency check.
- Skipped:
  - engine: no engine/runtime surface changed.
  - integration/workspace: no workspace, manifest, palette, or toolState handoff changed.
  - samples: SKIP, no samples touched and no broad sample runtime impact.
  - full suite: SKIP, targeted coverage proves the changed shared page/layout behavior.

## Manual Test
1. Start `npm run dev:local-api` with `.env` containing `GAMEFOUNDRY_ENVIRONMENT_LABEL=Development Environment`.
2. Open `http://127.0.0.1:5501/index.html`, `/account/sign-in.html`, `/admin/system-health.html`, and `/owner/memberships.html`.
3. Expected: the environment banner appears under the header and above the footer with the configured label.
4. Remove `GAMEFOUNDRY_ENVIRONMENT_LABEL`, restart the local API, and open `/index.html`.
5. Expected: a visible diagnostic banner says to set `GAMEFOUNDRY_ENVIRONMENT_LABEL` in `.env`.
6. Set `GAMEFOUNDRY_ENVIRONMENT_LABEL=Production`, restart the local API, and open `/index.html`.
7. Expected: no environment banner is shown by default.
