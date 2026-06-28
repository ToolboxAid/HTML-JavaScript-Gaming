# PR_26180_OWNER_009 Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Base on `PR_26180_OWNER_008-move-www-application` | PASS | Branch ancestry check passed. |
| Move server/API runtime files into `api/` | PASS | Server/router/services/persistence/storage/auth/seed modules moved under `api/`. |
| Preserve `/api/*` route behavior | PASS | Route smoke passed for representative `/api/*` endpoints. |
| Do not move dev-only local runtime/bootstrap orchestration yet | PASS | Bootstrap and startup orchestration remain in `dev/scripts/`. |
| Do not move tests except path/import updates | PASS | Test changes update imports and static route helper assumptions only. |
| Do not change product behavior | PASS | No intentional endpoint or public URL behavior change. |
| Browser/www must not import `api/` files directly | PASS | Browser code continues importing `src/api` client modules; boundary test passes. |
| Update reports under canonical path | PASS | Reports generated under `dev/reports/`. |
| Produce repo-structured ZIP under canonical path | PASS | ZIP generated under `dev/workspace/zips/`. |
