# PR_26180_OWNER_019b-move-browser-shared-schemas-to-www Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Use PR019a audit as source of truth | PASS | Moved only `Active browser/runtime dependency` rows from PR019a audit CSV. |
| Move active browser/runtime contracts and schemas to `www/src/shared/` | PASS | 23 audited files moved to `www/src/shared/`. |
| Preserve dynamic browser schema loading | PASS | `/src/shared/schemas/tools/<tool>.schema.json` route shape resolves from `www/src/shared/schemas/tools/`. |
| Preserve public `/src/shared/...` URLs | PASS | Static route resolver check passed for representative schema and replay contract URLs. |
| Update browser/runtime imports only where required | PASS | Existing browser relative imports continued to resolve; no browser/API behavior changes required. |
| Do not move validation-only files | PASS | Remaining root validation-only schemas/contracts were not moved. |
| Do not move API/server files | PASS | No `api/` files moved. |
| Do not delete schemas/contracts unless audit proves unused | PASS | No schema/contract deletion performed. |
| Do not change product behavior | PASS | Route compatibility and focused Playwright route smoke passed. |
| Do not move protected developer workspace files | PASS | No protected `dev/workspace/generated`, `zips`, or `tmp` files moved. |
| Required reports under `dev/reports/` | PASS | Reports generated. |
| Required ZIP under `dev/workspace/zips/` | PASS | ZIP generated separately after report creation. |
