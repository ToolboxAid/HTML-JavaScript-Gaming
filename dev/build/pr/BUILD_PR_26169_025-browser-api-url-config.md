# BUILD PR_26169_025-browser-api-url-config

## Purpose

Make browser API calls resolve against the browser-safe `GAMEFOUNDRY_API_URL` value exposed by the server public configuration endpoint, while preserving same-origin `/api` only as an explicit diagnostic fallback when `apiUrl` is unavailable.

## Scope

- Reuse the existing `.env`-backed `/api/public/config` response for safe public values:
  - `siteUrl`
  - `apiUrl`
  - `environmentLabel`
- Add browser API URL resolution for:
  - auth/session account calls
  - memberships
  - invitations
  - AI credits
  - marketplace
  - legal
  - owner
  - admin
  - shared toolbox/server API clients that already route through `src/api/server-api-client.js`
- Preserve same-origin `/api` only when public config or `apiUrl` is missing, with an actionable diagnostic.
- Support static Live Server pages opened from `http://127.0.0.1:5500/index.html` without redirecting to `5501`.
- Add local API CORS headers needed for browser-safe cross-origin calls from static Live Server origins.

## Out Of Scope

- Do not change Live Server behavior.
- Do not redirect browser pages from `5500` to `5501`.
- Do not hardcode `5501` into browser runtime code.
- Do not add a JSON config file.
- Do not expose `.env` directly to the browser.
- Do not expose secret values.
- Do not touch archive, samples, or `start_of_day`.

## Validation

- Verify current branch is `main`.
- Run `node --check` for all touched JavaScript files.
- Run targeted API client/config validation.
- Run targeted auth status validation from a static browser context.
- Run targeted Admin/Owner API client validation for affected shared client behavior.
- Run Playwright because browser API behavior changes.
- Do not run full samples smoke.
