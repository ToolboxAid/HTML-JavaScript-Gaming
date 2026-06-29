# API Runtime Boundary

`api/` contains server/API application runtime implementation for the browser-visible Local API, seeded product data, provider stubs, storage adapters, database adapters, and support services used by repository validation.

It is intentionally not `dev/tests/dev-runtime`:

- `api/` serves runtime behavior that browser pages and local API routes can exercise through the API/service contract during development and targeted validation.
- `dev/tests/dev-runtime` contains test files that validate that behavior.
- Moving the implementation into `dev/tests/dev-runtime` would make development pages depend on test-only code and would blur the Browser -> Server API -> Data Source boundary.

Deployment boundary:

- DEV validation may execute `api/` through local server commands.
- Browser pages, Theme V2 scripts, toolbox pages, and `www/src/engine` runtime code must use declared API/service contracts instead of importing `api/` directly.
- If a dev-only adapter is needed by a browser page, expose it through the Local API contract while keeping the implementation under `api/`.
- Developer-only local bootstrap/orchestration remains outside `api/` until the scoped `dev/local-runtime/` migration PR.
