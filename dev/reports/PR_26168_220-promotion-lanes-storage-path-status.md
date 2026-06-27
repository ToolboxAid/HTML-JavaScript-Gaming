# PR_26168_220-promotion-lanes-storage-path-status

## Branch Validation

PASS: current branch is `main`.

- Expected branch: `main`
- Current branch: `main`
- Local branches found: `main`

## Scope Summary

PASS: PR220 is scoped to promotion lane labels/copy and Admin Infrastructure project asset storage path status.

- Owner Operations no longer offers `Promote DEV to UAT`.
- Owner Operations now offers `Promote DEV to IST` and `Promote IST to UAT`, with status-first copy describing project metadata, asset references, and project asset storage objects.
- Admin Infrastructure now renders path match status from a read-only Local API route backed by `.env` `GAMEFOUNDRY_ASSET_STORAGE_PATH`.
- Browser code receives only lane, path, and yes/no/ERROR status values; no secrets or connection strings are exposed.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Instructions were read before branch guard or edits. |
| Hard stop unless current branch is `main` | PASS | `git branch --show-current` returned `main`; `git branch --list` showed `* main`. |
| Remove `Promote DEV to UAT` from Owner Operations | PASS | `owner/operations.html` and `OWNER_OPERATION_ACTIONS` no longer include `promote-dev-to-uat`; Playwright asserts the button count is zero. |
| Add `Promote DEV to IST` | PASS | Added HTML button and server action id `promote-dev-to-ist`; Playwright clicks it and receives a `SKIP` manual-only result. |
| Add `Promote IST to UAT` | PASS | Added HTML button and server action id `promote-ist-to-uat`; Playwright clicks it and receives a `SKIP` manual-only result. |
| Explain promotion scope | PASS | Owner Operations copy and promotion plan rows name project metadata, asset references, and project asset storage objects. |
| Admin section title/copy states `Project Asset Storage Paths use GAMEFOUNDRY_ASSET_STORAGE_PATH` | PASS | Admin Infrastructure table caption contains the exact storage path variable copy. |
| DEV row true/yes only for `/dev/projects/` | PASS | Playwright default status fixture with `/dev/projects/` shows DEV `yes` and all other lanes `no`. |
| IST row true/yes only for `/ist/projects/` | PASS | API lane matching uses exact path comparison; non-matching IST row renders `no` in targeted Playwright. |
| UAT row true/yes only for `/uat/projects/` | PASS | API lane matching uses exact path comparison; non-matching UAT row renders `no` in targeted Playwright. |
| PROD row true/yes only for `/prod/projects/` | PASS | API lane matching uses exact path comparison; non-matching PROD row renders `no` in targeted Playwright. |
| Missing `.env` variable makes all rows `ERROR` | PASS | Dedicated Playwright case renders DEV/IST/UAT/PROD rows with `ERROR`. |
| Do not display `GAMEFOUNDRY_ASSET_STORAGE_PATH` repeatedly as row value | PASS | Rows render only lane, path, and status value; static and Playwright checks confirm row body does not contain the variable name. |
| Do not expose secrets | PASS | The Admin API returns only lane/path/status and `secretsExposed:false`; no storage credentials, keys, passwords, or connection strings are rendered. |
| No inline script/style/event handlers | PASS | Static check passed for no `<style>`, no inline `style=`, no inline script blocks, and no `on*=` handlers. |
| Use external JS only | PASS | Admin status behavior lives in `assets/theme-v2/js/admin-infrastructure.js`; Owner behavior remains external module JS. |
| Use Theme V2 only | PASS | Pages continue to use `assets/theme-v2/css/theme.css` and existing Theme V2 classes only; no CSS was added. |
| Do not add unrelated storage or promotion behavior | PASS | Changes are limited to read-only status rendering, promotion lane labels/plans, tests, and required reports. |
| Do not run full samples smoke | PASS | Full samples smoke was skipped because no sample JSON or sample runtime surface changed. |

## Validation Lane Report

PASS: `node --check assets/theme-v2/js/admin-infrastructure.js`

PASS: `node --check assets/theme-v2/js/owner-operations.js`

PASS: `node --check src/engine/api/admin-infrastructure-api-client.js`

PASS: `node --check src/dev-runtime/server/local-api-router.mjs`

PASS: `node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`

PASS: Admin/Owner static contract check

- Confirmed Admin Infrastructure has no inline styles, style blocks, inline script blocks, or inline event handlers.
- Confirmed Admin Infrastructure keeps `assets/GFS-Infrastructure v1-3.png` and does not display `assets/GFS-Infrastructure v1-2.png`.
- Confirmed storage path rows do not repeat `GAMEFOUNDRY_ASSET_STORAGE_PATH`.
- Confirmed Owner Operations removed DEV to UAT and added DEV to IST / IST to UAT.
- Confirmed Local API route reads `GAMEFOUNDRY_ASSET_STORAGE_PATH` from `.env` and returns `ERROR` when missing.

PASS: `git diff --check`

- Exit code 0.
- Git reported expected Windows line-ending warnings only.

PASS: targeted Playwright UI behavior

Command:

`npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs -g "Infrastructure Admin wireframe preserves template structure|Infrastructure storage path status reports missing env path as ERROR|Owner Operations exposes owner-only connection validation and manual operation actions"`

Result:

- 3 passed.
- Admin Infrastructure validated v1-3-only image, zoom behavior, storage path status rows, missing-env ERROR rows, external JS, and no page failures.
- Owner Operations validated DavidQ owner visibility, DEV to IST and IST to UAT actions, removed DEV to UAT action, safe status/copy, and manual-only operation results.

NOTE: The first run of the same targeted Playwright command had 2 passed and 1 failed because the updated Owner promotion fixture omitted the existing `Local API` copy expected after validation. The copy was corrected in the server fixture and the test fixture, then the same targeted command passed.

PASS: Playwright V8 coverage report produced at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

- `(80%) assets/theme-v2/js/admin-infrastructure.js`
- `(100%) assets/theme-v2/js/owner-operations.js`
- `(100%) src/engine/api/admin-infrastructure-api-client.js`
- `(0%) src/dev-runtime/server/local-api-router.mjs` is an advisory WARN because Playwright browser V8 coverage does not collect Node-side server runtime.

SKIP: Full samples smoke was not run because this PR changes Admin Infrastructure, Owner Operations, and Local API status surfaces only; sample JSON and sample runtime behavior were not touched.

## Manual Validation Notes

PASS: Static inspection confirmed Admin Infrastructure displays the storage variable only in the caption and uses lane rows for `/dev/projects/`, `/ist/projects/`, `/uat/projects/`, and `/prod/projects/`.

PASS: Static inspection confirmed the Admin browser code renders `yes`, `no`, or `ERROR` only; it does not render secrets or full connection strings.

PASS: Static inspection confirmed Owner Operations is status-first and keeps destructive/promotion work manual-only.

PASS: `docs_build/dev/reports/codex_review.diff` and `docs_build/dev/reports/codex_changed_files.txt` were produced for review.
