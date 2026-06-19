# BUILD PR_26169_026-local-api-startup-url-logging

## Purpose

Fix misleading local API startup logging so the runtime bind URL is shown separately from configured public site/API URLs.

## Scope

- Update `scripts/start-local-api-server.mjs` only for startup logging behavior.
- Print:
  - API runtime server bind URL
  - configured site URL from `GAMEFOUNDRY_SITE_URL`
  - configured API URL from `GAMEFOUNDRY_API_URL`
  - `.env` load status
  - auth connection status
  - database connection status
  - database SSL mode
  - stop instruction
- Show `(not configured)` when `GAMEFOUNDRY_SITE_URL` is missing.
- Derive the default configured API URL from `localServer.baseUrl + "/api"` when `GAMEFOUNDRY_API_URL` is missing.
- Add a minimal targeted startup-log formatting test if practical.

## Out Of Scope

- Do not change server bind behavior.
- Do not change Live Server behavior.
- Do not change `GAMEFOUNDRY_SITE_URL` semantics.
- Do not change `GAMEFOUNDRY_API_URL` semantics.
- Do not hardcode `5500` or `5501` beyond existing default local API host/port behavior.
- Do not expose secret values.
- Do not touch unrelated auth, membership, marketplace, owner, admin, or banner code.

## Validation

- Verify current branch is `main`.
- Run `node --check scripts/start-local-api-server.mjs`.
- Run targeted startup/log validation.
- Do not run full samples smoke.
