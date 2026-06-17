# PR_26168_219-admin-infrastructure-image-storage-path

## Branch Validation

PASS: current branch is `main`.

- Expected branch: `main`
- Current branch: `main`
- Local branches found: `main`

## Scope Summary

PASS: PR219 is scoped to the Admin Infrastructure image/storage-path surface.

- Admin Infrastructure image now fills the available content width inside a Theme V2 zoom trigger.
- The image opens a native dialog zoom view through external JavaScript only.
- Project Asset Storage Paths copy now identifies `GAMEFOUNDRY_ASSET_STORAGE_PATH`.
- `.env.example` includes the tracked non-secret variable contract.
- Ignored local copy-source files `.env.dev`, `.env.ist`, `.env.uat`, and `.env.prd` were updated locally with the matching non-secret path values.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Instructions were read before branch guard or edits. |
| Hard stop unless current branch is `main` | PASS | `git branch --show-current` returned `main`; `git branch --list` showed `* main`. |
| Update `admin/infrastructure.html` so the image uses 100% of available content space | PASS | Theme V2 `.image-zoom-trigger` and `.tool-center-panel .image-zoom-trigger img` set the image to full control/content width; Playwright measured image width within the trigger border box. |
| Make the infrastructure image clickable and open a zoom view | PASS | External `assets/theme-v2/js/image-zoom-dialog.js` opens the native dialog; Playwright clicked the image trigger, verified the dialog image, and closed it. |
| Keep displaying only `assets/GFS-Infrastructure v1-3.png` | PASS | Static and Playwright checks confirm v1-3 is used and v1-2 is absent. |
| Update Project Asset Storage Paths copy to identify `GAMEFOUNDRY_ASSET_STORAGE_PATH` | PASS | Table caption and path rows include the variable name. |
| Add `GAMEFOUNDRY_ASSET_STORAGE_PATH` to appropriate `.env` copy-source files if missing | PASS | `.env.example` is tracked with the contract; ignored local `.env.dev`, `.env.ist`, `.env.uat`, and `.env.prd` each contain exactly one non-secret variable entry. |
| Do not expose secrets | PASS | No secret values were added to tracked files, reports, or artifacts; ignored `.env.<target>` files are not packaged. |
| Use Theme V2 only | PASS | Styling is in `assets/theme-v2/css/dialogs.css`; page keeps Theme V2 stylesheet only. |
| No inline styles, script blocks, style blocks, or inline event handlers | PASS | Static HTML check passed for `style=`, `<style>`, inline script blocks, and `on*=` handlers. |
| Put JavaScript in external files only | PASS | Zoom behavior lives in `assets/theme-v2/js/image-zoom-dialog.js`; HTML only references external scripts. |
| Do not add unrelated Admin, storage, or promotion behavior | PASS | Changes are limited to image zoom, storage path copy, env contract, and targeted test coverage. |
| Do not run full samples smoke | PASS | Full samples smoke was skipped by instruction and because no sample surface changed. |

## Validation Lane Report

PASS: `node --check assets/theme-v2/js/image-zoom-dialog.js`

PASS: `node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`

PASS: Admin Infrastructure HTML static check

- Checked no `<style>` blocks.
- Checked no inline `style=` attributes.
- Checked no inline script blocks.
- Checked no inline event handlers.
- Checked `assets/GFS-Infrastructure v1-3.png` is present.
- Checked `assets/GFS-Infrastructure v1-2.png` is absent.
- Checked `GAMEFOUNDRY_ASSET_STORAGE_PATH` copy is present.
- Checked external zoom script reference is present.

PASS: changed CSS brace check for `assets/theme-v2/css/dialogs.css`

PASS: env asset storage path static check

- `.env.example`: `GAMEFOUNDRY_ASSET_STORAGE_PATH=`
- `.env.dev`: `GAMEFOUNDRY_ASSET_STORAGE_PATH=/dev/projects/`
- `.env.ist`: `GAMEFOUNDRY_ASSET_STORAGE_PATH=/ist/projects/`
- `.env.uat`: `GAMEFOUNDRY_ASSET_STORAGE_PATH=/uat/projects/`
- `.env.prd`: `GAMEFOUNDRY_ASSET_STORAGE_PATH=/prod/projects/`

PASS: `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs -g "Infrastructure Admin wireframe preserves template structure"`

- Result: 1 passed.
- Behavior validated: Theme V2 Admin Infrastructure structure, v1-3-only image usage, storage path copy, full-width image trigger, zoom dialog open/close, no inline style/script/event handlers, and no page failures.

PASS: Playwright V8 coverage report produced at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

- `(100%) assets/theme-v2/js/image-zoom-dialog.js` covered by browser V8 coverage.

## Manual Validation Notes

PASS: Static inspection confirmed Admin Infrastructure still references only `assets/GFS-Infrastructure v1-3.png` and not `assets/GFS-Infrastructure v1-2.png`.

PASS: The image is a keyboard-focusable button with `aria-haspopup="dialog"` and `aria-controls="admin-infrastructure-image-zoom"`.

PASS: The zoom view uses a native `<dialog>` with an external JS opener and a visible Close button.

PASS: The tracked env example and ignored local env copy-source files contain only the non-secret `GAMEFOUNDRY_ASSET_STORAGE_PATH` variable addition for this PR.

SKIP: Full samples smoke was not run because this PR only affects the Admin Infrastructure page, Theme V2 zoom styling/JS, and env copy-source documentation; sample JSON and sample runtime behavior were untouched.
