# PR_26180_OWNER_006-www-migration-map Requirement Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| Base is `PR_26180_OWNER_005-repository-layout-scaffold` | PASS | Branch created from PR005 scaffold branch. |
| Create no-runtime-change migration map | PASS | Added `www_migration_map.md`. |
| Do not move browser files yet | PASS | No browser-served files moved. |
| Do not change package.json commands yet | PASS | `package.json` unchanged. |
| Do not change runtime behavior | PASS | No runtime/server/API implementation files changed. |
| Review root-level browser-served folders/pages | PASS | Map includes current browser surface table and counts. |
| Review current imports/references | PASS | Map includes reference inventory and examples. |
| Review local web server root behavior | PASS | Map documents `start-dev.mjs`, `local-api-server.mjs`, and Playwright repo server root behavior. |
| Review Playwright/test assumptions | PASS | Map documents public route and filesystem assumptions. |
| Document required safe sequence | PASS | Map includes required sequence for safe `www/` move. |
| Document preserve vs rewrite | PASS | Map separates preserve, rewrite, and defer decisions. |
| Determine compatibility redirects/shims | PASS | Map recommends temporary route compatibility and shim ledger. |
| Document validation lanes for actual move | PASS | Map lists required validation lanes. |
| Required reports under dev/reports | PASS | Report set generated. |
| Required ZIP under dev/workspace/zips | PASS | `dev/workspace/zips/PR_26180_OWNER_006-www-migration-map_delta.zip` generated. |
| git diff --check | PASS | No whitespace errors. |
| npm run validate:canonical-structure | PASS | Blocking violations: 0. |
| No runtime/API/UI/database changes | PASS | Changed files are Project Instructions/backlog/reports only. |
