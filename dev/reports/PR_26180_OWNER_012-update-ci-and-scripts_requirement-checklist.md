# PR_26180_OWNER_012 Requirement Checklist

| Requirement | Status | Notes |
| --- | --- | --- |
| Update CI/path references for `www/`, `api/`, `dev/` | PASS | Platform workflow now uses `npm run validate:platform`; developer scripts recognize `www/` paths. |
| Update package scripts only where needed | PASS | Added `validate:platform`; preserved existing command surface. |
| Preserve `npm run dev:bootstrap` | PASS | Script remains present. |
| Preserve `npm run dev:api` | PASS | Script remains present. |
| Preserve `npm run dev:web` | PASS | Script remains present. |
| Preserve `npm run dev:local-api` | PASS | Legacy alias remains present. |
| Update developer scripts after moved paths | PASS | Node test runners, Playwright location audit, targeted lane routing, duplicate audit, and tool registry validator updated. |
| Do not move `www` files | PASS | No `www/` files moved. |
| Do not move `api` files | PASS | No `api/` files moved. |
| Do not change product behavior | PASS | Changes are CI/script/path-governance only. |
| Produce reports under `dev/reports/` | PASS | Required reports created. |
| Produce ZIP under `dev/workspace/zips/` | PASS | ZIP created during closeout. |
