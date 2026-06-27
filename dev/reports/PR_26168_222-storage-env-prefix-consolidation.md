# PR_26168_222-storage-env-prefix-consolidation

## Branch Validation

PASS: current branch is `main`.

- Expected branch: `main`
- Current branch: `main`
- Local branches found: `main`

## Scope Summary

PASS: PR222 consolidates Admin Infrastructure storage path status on `GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX`.

- Removed active Admin/runtime/page dependence on `GAMEFOUNDRY_ASSET_STORAGE_PATH`.
- Admin Infrastructure now uses `GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX` in visible copy and Local API status logic.
- Valid lane paths are `/dev/projects/`, `/ist/projects/`, `/uat/projects/`, and `/prd/projects/`.
- `.env.example` keeps only the non-secret storage prefix placeholder; ignored local `.env.<target>` copy-source files were updated locally for prefix placeholders only.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Instructions were read before branch guard or edits. |
| Hard stop unless current branch is `main` | PASS | `git branch --show-current` returned `main`; `git branch --list` showed `* main`. |
| Consolidate storage path usage to `GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX` | PASS | Admin copy, Local API status logic, and Playwright fixtures use `GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX`. |
| Remove active runtime/page dependence on `GAMEFOUNDRY_ASSET_STORAGE_PATH` | PASS | Static scan of active Admin/storage files found no old variable references. |
| Missing prefix shows all `ERROR` | PASS | Targeted Playwright missing-prefix case passed. |
| Invalid prefix shows all `ERROR` | PASS | Targeted Playwright invalid-prefix case passed. |
| Match `/dev/projects/` activates only DEV | PASS | Targeted Playwright DEV exact-match case passed. |
| Match `/ist/projects/` activates only IST | PASS | Targeted Playwright IST exact-match case passed. |
| Match `/uat/projects/` supported | PASS | Local API lane list contains exact `/uat/projects/`; non-matching rows stay inactive/no in covered cases. |
| Match `/prd/projects/` supported | PASS | Admin page, Admin JS, tests, and Local API lane list use `/prd/projects/`. |
| Exactly one matching lane shows active/yes; others inactive/no/blank | PASS | Playwright DEV and IST cases verify one `yes` and three `no` rows. |
| Update `.env` copy-source placeholders safely | PASS | `.env.example` now contains only `GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX=`; ignored local `.env.dev`, `.env.ist`, `.env.uat`, `.env.prd` use non-secret prefix placeholders. |
| Do not commit real secrets | PASS | No secret values were added to tracked files or reports; ignored `.env.<target>` files are not packaged. |
| Keep PR independently scoped/testable | PASS | Changes are limited to storage prefix consolidation, Admin validation, env placeholder cleanup, reports, and coverage artifacts. |
| Do not run full samples smoke unless directly impacted | PASS | Full samples smoke skipped because sample JSON and sample runtime behavior were not touched. |

## Validation Lane Report

PASS: `node --check src/dev-runtime/server/local-api-router.mjs`

PASS: `node --check assets/theme-v2/js/admin-infrastructure.js`

PASS: `node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`

PASS: Admin Infrastructure static contract check

- Active Admin/storage surfaces do not reference `GAMEFOUNDRY_ASSET_STORAGE_PATH`.
- Admin Infrastructure copy uses `GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX`.
- Admin Infrastructure and Local API use `/prd/projects/` for PRD.
- `.env.example` removed the old asset path placeholder.
- Local API reads the storage projects prefix from `.env`.
- Missing or invalid prefix renders all rows `ERROR`.
- Admin Infrastructure keeps external JS/CSS only.

PASS: targeted Admin Infrastructure Playwright

Command:

`npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs -g "Infrastructure Admin wireframe preserves template structure|Infrastructure storage path status reports missing env path as ERROR|Infrastructure storage path status reports invalid env path as ERROR|Infrastructure storage path status reports DEV match only|Infrastructure storage path status reports IST match only"`

Result:

- 5 passed.
- Covered missing prefix, invalid prefix, DEV exact match, IST exact match, no inline HTML behavior, and no page failures.

PASS: Playwright V8 coverage report produced at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

- `(80%) assets/theme-v2/js/admin-infrastructure.js`
- `(100%) src/engine/api/admin-infrastructure-api-client.js`
- `(0%) src/dev-runtime/server/local-api-router.mjs` is an advisory WARN because browser V8 coverage does not collect Node-side server runtime.

SKIP: Full samples smoke was not run because this PR only changes Admin Infrastructure storage prefix status logic and env placeholders.

## Manual Validation Notes

PASS: Static inspection confirmed the old variable was removed from active Admin/runtime/page storage-path status surfaces.

PASS: Static inspection confirmed no R2 endpoint, access key, secret key, bucket secret, password, or connection string was added.

PASS: Ignored local `.env.<target>` copy-source files were updated only for non-secret `GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX` values and were not included in the ZIP.
