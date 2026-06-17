# PR_26168_221-storage-path-error-rule-and-r2-env-ready

## Branch Validation

PASS: current branch is `main`.

- Expected branch: `main`
- Current branch: `main`
- Local branches found: `main`

## Scope Summary

PASS: PR221 is scoped to Admin Infrastructure storage path status validation.

- Missing `GAMEFOUNDRY_ASSET_STORAGE_PATH` still renders all lane rows as `ERROR`.
- Invalid `GAMEFOUNDRY_ASSET_STORAGE_PATH` values now render all lane rows as `ERROR`.
- Exact `/dev/projects/` and `/ist/projects/` matches were covered by targeted Playwright cases.
- No R2 credentials or `.env` files were added or modified.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Instructions were read before branch guard or edits. |
| Hard stop unless current branch is `main` | PASS | `git branch --show-current` returned `main`; `git branch --list` showed `* main`. |
| Missing `GAMEFOUNDRY_ASSET_STORAGE_PATH` makes all rows `ERROR` | PASS | Existing missing-path logic preserved; Playwright case `Infrastructure storage path status reports missing env path as ERROR` passed. |
| Invalid `GAMEFOUNDRY_ASSET_STORAGE_PATH` makes all rows `ERROR` | PASS | `projectAssetStoragePathStatus()` now requires an exact match before rendering yes/no; Playwright invalid `/qa/projects/` case passed with all rows `ERROR`. |
| Exact `/dev/projects/` shows DEV yes and others no | PASS | Playwright case `Infrastructure storage path status reports DEV match only` passed. |
| Exact `/ist/projects/` shows IST yes and others no | PASS | Playwright case `Infrastructure storage path status reports IST match only` passed. |
| Non-matching valid-lane rows show no/false/blank | PASS | DEV and IST Playwright cases verify non-matching rows render `no`. |
| Add clear manual note/report section that R2 `.env` setup is ready only after validation passes | PASS | See `R2 .env Readiness Note` and Manual Validation Notes below. |
| Do not expose secrets | PASS | Browser rows still render only lane, path, and status value; no credentials, keys, passwords, or connection strings are rendered. |
| Do not add new R2 credentials in repo | PASS | No `.env` files changed; no credential variables or secret values were added. |
| Do not add unrelated promotion/package behavior | PASS | Changes are limited to Admin Infrastructure path status logic, targeted tests, coverage reports, and required PR artifacts. |
| Do not run full samples smoke | PASS | Full samples smoke was skipped because sample JSON and sample runtime behavior were not touched. |

## Validation Lane Report

PASS: `node --check src/dev-runtime/server/local-api-router.mjs`

PASS: `node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`

PASS: `node --check assets/theme-v2/js/admin-infrastructure.js`

PASS: Admin Infrastructure static contract check

- Router defines exact lane paths: `/dev/projects/`, `/ist/projects/`, `/uat/projects/`, `/prod/projects/`.
- Router computes `invalidPath` before rendering rows.
- Router returns all `ERROR` rows when the path is missing or invalid.
- Router returns `PASS` only when the path exactly matches one configured lane.
- Playwright spec contains the missing, invalid, DEV, and IST path cases.
- Admin Infrastructure HTML still has no inline scripts, style blocks, inline style attributes, or inline event handlers.

PASS: targeted Admin Infrastructure Playwright

Command:

`npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs -g "Infrastructure Admin wireframe preserves template structure|Infrastructure storage path status reports missing env path as ERROR|Infrastructure storage path status reports invalid env path as ERROR|Infrastructure storage path status reports DEV match only|Infrastructure storage path status reports IST match only"`

Result:

- 5 passed.
- Covered missing path = all `ERROR`.
- Covered invalid path `/qa/projects/` = all `ERROR`.
- Covered `/dev/projects/` = DEV `yes`, IST/UAT/PROD `no`.
- Covered `/ist/projects/` = IST `yes`, DEV/UAT/PROD `no`.

PASS: `git diff --check`

- Exit code 0.
- Git reported expected Windows line-ending warnings only.

PASS: Playwright V8 coverage report produced at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

- `(80%) assets/theme-v2/js/admin-infrastructure.js`
- `(100%) src/engine/api/admin-infrastructure-api-client.js`
- `(0%) src/dev-runtime/server/local-api-router.mjs` is an advisory WARN because Playwright browser V8 coverage does not collect Node-side server runtime.

SKIP: Full samples smoke was not run because this PR changes only Admin Infrastructure storage path validation logic and targeted tests.

## R2 .env Readiness Note

R2 `.env` setup is ready only after `GAMEFOUNDRY_ASSET_STORAGE_PATH` validation passes with one exact lane match:

- `/dev/projects/`
- `/ist/projects/`
- `/uat/projects/`
- `/prod/projects/`

If the variable is missing, blank, misspelled, or points to any other path, Admin Infrastructure must show all lane rows as `ERROR` and R2 setup should not be treated as ready.

## Manual Validation Notes

PASS: Static inspection confirmed the stricter invalid path rule lives in the Local API status logic, not in page-local browser data.

PASS: Static inspection confirmed no R2 credentials, access keys, secret keys, passwords, or full connection strings were added to tracked files.

PASS: Static inspection confirmed no `.env`, `.env.dev`, `.env.ist`, `.env.uat`, or `.env.prd` file was modified.

PASS: Required review artifacts were produced: `docs_build/dev/reports/codex_review.diff` and `docs_build/dev/reports/codex_changed_files.txt`.
