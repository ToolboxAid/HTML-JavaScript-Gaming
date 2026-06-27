# PR_26169_025-browser-api-url-config Report

## Summary

Implemented a browser-safe public API URL resolver so browser API calls use `GAMEFOUNDRY_API_URL` from `.env` through `/api/public/config` when configured. Static Live Server pages opened on `http://127.0.0.1:5500` now discover the API server through the public config endpoint and call the configured API root, without redirecting the browser and without exposing secrets.

## Branch Guard

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| Current branch | `main` | `main` | PASS |
| Local branches found | includes `main` | `main` | PASS |

## Requirement Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Expose only browser-safe public config values | Existing `/api/public/config` returns `siteUrl`, `apiUrl`, and `environmentLabel`; `tests/dev-runtime/PublicEnvironmentConfig.test.mjs` verifies no secret keys/values are exposed. | PASS |
| Do not expose secrets or `.env` directly | Browser fetches server JSON only; no browser `.env` reads were added. Public config tests cover secret exclusions. | PASS |
| Use configured `apiUrl` for auth APIs | `tests/playwright/tools/BrowserApiUrlConfig.spec.mjs` verifies `5500` sign-in page calls `http://127.0.0.1:5501/api/auth/status`. | PASS |
| Use configured `apiUrl` for Admin and Owner APIs | `BrowserApiUrlConfig.spec.mjs` verifies Admin System Health and Owner Memberships calls use `5501/api`, not `5500/api`. | PASS |
| Shared clients cover memberships, invitations, AI credits, marketplace, legal, owner, and admin APIs | `src/api/server-api-client.js` now resolves all shared `safeRequestServerApi` calls through `src/api/public-config-client.js`; affected feature clients already route through this shared client. | PASS |
| Preserve same-origin fallback only when `apiUrl` is missing | `tests/dev-runtime/PublicApiUrlClient.test.mjs` verifies fallback to `/api/...` and an actionable `GAMEFOUNDRY_API_URL` diagnostic. | PASS |
| Do not hardcode `5501` in browser code | Browser code derives the companion local config port from the current `5500` port and then uses the server-returned `apiUrl`. | PASS |
| Do not redirect from `5500` to `5501` | Playwright remains on static `5500` pages while API calls use configured `5501/api`. | PASS |
| Do not add a JSON config file | No JSON config file was added. | PASS |
| Add CORS support needed for static Live Server to call local API | `src/dev-runtime/server/local-api-router.mjs` applies API CORS headers for API responses and preflight. | PASS |

## Files Changed

| File | Purpose |
| --- | --- |
| `src/api/public-config-client.js` | New browser-safe public config resolver and API URL builder. |
| `src/api/server-api-client.js` | Routes shared sync browser API requests through configured `apiUrl`. |
| `assets/theme-v2/js/account-auth-service.js` | Routes account auth/session fetches through configured `apiUrl`. |
| `assets/theme-v2/js/gamefoundry-partials.js` | Routes shared-layout session, navigation, platform banner, and environment banner API calls through configured `apiUrl`. |
| `src/dev-runtime/server/local-api-router.mjs` | Adds CORS headers for local API responses. |
| `scripts/validate-browser-env-agnostic.mjs` | Updates account-service validation snippets for the configured API resolver contract. |
| `tests/dev-runtime/PublicApiUrlClient.test.mjs` | Adds resolver/config fallback unit coverage. |
| `tests/playwright/tools/BrowserApiUrlConfig.spec.mjs` | Adds static `5500` to configured `5501/api` browser coverage for auth, Admin, and Owner APIs. |

## Validation

| Command | Result |
| --- | --- |
| `git branch --show-current` | PASS, `main` |
| `node --check` for touched JavaScript files | PASS |
| `node --test tests/dev-runtime/PublicApiUrlClient.test.mjs tests/dev-runtime/PublicEnvironmentConfig.test.mjs` | PASS, 5 tests |
| `npm run validate:browser-env-agnostic` | PASS |
| `npx playwright test --config=playwright.config.cjs tests/playwright/tools/BrowserApiUrlConfig.spec.mjs` | PASS, 1 test |
| `npx playwright test --config=playwright.config.cjs tests/playwright/tools/EnvironmentBannerCoverage.spec.mjs` | PASS, 3 tests |

## Notes

- Full samples smoke was skipped because samples are not in scope and no sample runtime was changed.
- The broad Playwright structure audit was run accidentally and failed on existing unrelated lane-structure findings; its generated report churn was restored and the audit is not counted as this PR validation.
- An exploratory full account sign-in Playwright run failed in the fake Supabase create-account fixture path, outside the URL-routing behavior covered by this PR. The scoped static-origin auth/Admin/Owner routing Playwright test passes.

## Impacted Lanes

| Lane | Decision |
| --- | --- |
| Runtime/config | Executed targeted public config and resolver tests. |
| Browser account/API behavior | Executed static-origin Playwright API routing test. |
| Theme V2 shared layout | Executed environment banner coverage because `gamefoundry-partials.js` changed. |
| Admin/Owner | Covered through static-origin configured API routing for Admin System Health and Owner Memberships. |
| Samples | Skipped; no samples touched or affected. |
