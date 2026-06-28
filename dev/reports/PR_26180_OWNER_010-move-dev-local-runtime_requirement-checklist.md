# PR_26180_OWNER_010 Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Base on `PR_26180_OWNER_009-move-api-application` | PASS | Branch was created from PR009 stacked base. |
| Move team-aware bootstrap orchestration into `dev/local-runtime/` | PASS | `start-dev.mjs` moved to `dev/local-runtime/`. |
| Move local port/team config into `dev/local-runtime/` | PASS | `team-port-config.mjs` moved to `dev/local-runtime/`. |
| Move local diagnostics and browser launch support into `dev/local-runtime/` | PASS | `start-dev.mjs` and `start-local-api-server.mjs` moved together. |
| Update package commands to new paths | PASS | `package.json` points commands at `dev/local-runtime/`. |
| Preserve `npm run dev:bootstrap` | PASS | Command smoke produced expected owner diagnostics. |
| Preserve `npm run dev:api` | PASS | Command smoke produced expected owner diagnostics. |
| Preserve `npm run dev:web` | PASS | Command smoke produced expected owner diagnostics. |
| Preserve `npm run dev:local-api` legacy alias | PASS | Alias remains in `package.json`; startup logging tests pass. |
| Do not move API/server app files | PASS | No `api/server` ownership changes in this PR. |
| Do not move www/browser files | PASS | No `www/` files changed. |
| Do not change product behavior | PASS | Path-only local runtime move plus tests/docs/package references. |
| Required reports under `dev/reports/` | PASS | Reports generated. |
| Required ZIP under `dev/workspace/zips/` | PASS | ZIP generated. |
