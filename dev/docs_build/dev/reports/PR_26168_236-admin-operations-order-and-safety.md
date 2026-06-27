# PR_26168_236-admin-operations-order-and-safety

## Branch Validation

PASS - Current branch is `main`; expected branch is `main`.

## Summary

Moved Operations from Owner into Admin at `admin/operations.html`, with Admin-scoped browser and Local API contracts. The page is action-focused and keeps Admin System Health as the status/readiness surface and Admin Infrastructure as the architecture/reference surface.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Read before implementation and followed repo BUILD/report/ZIP rules. |
| Hard stop unless current branch is `main` | PASS | `git branch --show-current` returned `main`. |
| Move Owner Operations into Admin area at `admin/operations.html` | PASS | `owner/operations.html` moved to `admin/operations.html`; client/API moved to Admin routes. |
| Keep Admin System Health read-only health/status | PASS | Operations status tables are not on Admin Operations; System Health links to Admin Operations for actions. |
| Keep Admin Infrastructure as architecture/reference | PASS | Infrastructure remains reference UI and links status to System Health, actions to Admin Operations. |
| Admin Operations section order: Project Packaging, Backup & Recovery, Database Operations | PASS | Playwright asserts the exact left-panel `summary` order. |
| Project Packaging actions: Export, Validate, Import Project Package | PASS | Rendered from `/api/admin/operations/status`; Playwright asserts exact button order. |
| Backup & Recovery actions: Create Backup, Restore From Backup | PASS | Rendered from Admin Operations status; Playwright asserts exact button order. |
| Database Operations actions: Validate Current Connection, Database Connectivity Test, Run Migration, Reseed DEV only in DEV | PASS | DEV test shows all four actions; IST test confirms `Reseed DEV` is hidden outside DEV. |
| Remove direct promotion buttons | PASS | `Promote DEV to IST`, `Promote IST to UAT`, and `Promote UAT to PROD` are absent from Admin Operations and server action constants. |
| Remove duplicated health/status tables from Operations | PASS | Operations no longer renders database status or promotion foundation tables; those remain status/readiness concerns. |
| Warning/confirmation messaging for Import, Restore, Run Migration, Reseed DEV | PASS | Safety diagnostics table and action group messaging expose confirmation/risk diagnostics for all four actions. |
| Do not implement full `.gfsp` packaging unless already scaffolded | PASS | Package actions return visible `SKIP` / not implemented diagnostics. |
| Do not expose secrets | PASS | Page/test assertions confirm secret fixture values are absent; API responses return status only. |
| Use Theme V2 only | PASS | Page uses `assets/theme-v2/css/theme.css` and Theme V2 classes only. |
| No inline styles, style blocks, script blocks, or inline event handlers | PASS | Static guard found no violations in touched Admin HTML. |
| Do not touch sample JSON or `start_of_day` folders | PASS | Changed-file review shows no sample JSON or `start_of_day` paths. |

## Validation Lane Report

Impacted lane: Admin Operations page/API/client, Admin navigation links, Admin System Health related-action link, Admin Infrastructure related-status/action links.

PASS - Syntax/static checks:

```text
node --check assets/theme-v2/js/admin-operations.js
node --check src/engine/api/admin-operations-api-client.js
node --check assets/theme-v2/js/gamefoundry-partials.js
node --check assets/theme-v2/js/admin-service-page-data.js
node --check src/dev-runtime/auth/provider-contract-stubs.mjs
node --check src/dev-runtime/server/local-api-router.mjs
node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs
Select-String inline HTML guard for touched Admin pages
git diff --check -- touched files
```

PASS - Targeted Playwright:

```text
npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs -g "Admin Operations|System Health Admin wireframe preserves template structure|Infrastructure Admin wireframe preserves template structure|Owner menu is role-gated separately from Admin menu|Tool Votes side menu includes Admin platform wireframes"
```

Result: 7 passed.

Playwright covered:

- Admin Operations ordered sections and action labels.
- Risky action diagnostics and no secret exposure.
- Direct promotion buttons removed.
- `Reseed DEV` visible in DEV and hidden for IST.
- Admin-only access denial for non-admin users.
- Admin System Health and Admin Infrastructure related links.
- Admin header/side navigation update.

## Playwright V8 Coverage

PASS/WARN - Advisory coverage was generated in `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

- `(100%) assets/theme-v2/js/admin-operations.js`
- `(100%) src/engine/api/admin-operations-api-client.js`
- `(77%) assets/theme-v2/js/gamefoundry-partials.js`
- WARN entries remain for server/test modules that browser V8 coverage cannot collect.

## Manual Validation Notes

PASS - Admin Operations is action-first and does not duplicate health/status tables.

PASS - Admin System Health remains the safe status/readiness destination and links to Admin Operations for actions.

PASS - Admin Infrastructure remains the architecture/reference page and links Database Status, Storage Status, and Promotion Foundation to System Health.

PASS - Full samples smoke was skipped because this PR changes Admin Operations/navigation/status links only; sample JSON, sample launch behavior, games, and `start_of_day` folders are not touched.

## Artifacts

PASS - Required reports:

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26168_236-admin-operations-order-and-safety.md`

PASS - Repo-structured delta ZIP:

- `tmp/PR_26168_236-admin-operations-order-and-safety_delta.zip`
