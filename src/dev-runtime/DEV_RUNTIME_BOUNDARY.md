# Dev Runtime Boundary

`src/dev-runtime` contains local development runtime implementation for the browser-visible Local API, seeded product data, provider stubs, storage adapters, database adapters, and support services used by repository validation.

It is intentionally not `tests/dev-runtime`:

- `src/dev-runtime` serves runtime behavior that browser pages and local API routes can exercise during development and targeted validation.
- `tests/dev-runtime` contains test files that validate that behavior.
- Moving the implementation into `tests/dev-runtime` would make development pages depend on test-only code and would blur the Browser -> Server API -> Data Source boundary.

Deployment boundary:

- DEV validation may execute `src/dev-runtime` through local server commands.
- UAT and PROD bundles must not import, bundle, or deploy `src/dev-runtime`.
- Browser pages, Theme V2 scripts, toolbox pages, and `src/engine` runtime code must use declared API/service contracts instead of importing `src/dev-runtime` directly.
- If a dev-only adapter is needed by a browser page, expose it through the Local API contract while keeping the implementation under `src/dev-runtime`.
