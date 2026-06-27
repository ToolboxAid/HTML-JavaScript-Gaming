# PR_26163_076-assets-upload-prod-alignment

## Branch Validation
- PASS - Current branch: `main`
- PASS - Expected branch: `main`

## Requirement Checklist
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS - `Add Data` remains visible and disabled with `title="Planned"`.
- PASS - `Add Vector` remains visible and disabled with `title="Planned"`.
- PASS - Images, Audio, and Fonts remain upload-capable. Evidence: targeted Playwright uploads one file for each type and sees catalog rows.
- PASS - Sprites and Palette References remain reference-only. Evidence: targeted Playwright verifies no upload file input for those asset types.
- PASS - Upload auto-starts after file selection; no separate Upload button is required. Evidence: targeted Playwright sets files and asserts rows/logs without clicking Save.
- PASS - Guest upload/create action is not visually disabled but blocks on action. Evidence: `Add Images` stays enabled, file selection shows `Uploads require a Game Foundry account.` with `Sign In` and `Create Account`, and no row is created.
- PASS - Centered Project Path display appears above asset accordions. Evidence: Playwright checks `Path: projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/`, computed center alignment, and placement above Images.
- PASS - Preview column shows asset-type-relative paths only. Evidence: Playwright verifies uploaded image row contains `image/write-view-image.png`.
- PASS - Stored record keeps the full project-relative path. Evidence: View metadata shows `Stored path: projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/image/write-view-image.png`.
- PASS - View uses the stored full project-relative path. Evidence: Image View preview `src` resolves to `projects/<projectId>/image/write-view-image.png`.
- PASS - Server/dev DB storage creates physical folder/file. Evidence: local-db Playwright lane removes `projects/<projectId>/image/`, uploads an image, then verifies the folder/file exists and bytes match.
- PASS - Unsupported browser-style file writes fail visibly without false OK records. Evidence: `?uploadWrite=unsupported` shows FAIL/SKIP diagnostics and asset count remains `0`.
- PASS - `codex_review.diff` is generated as readable UTF-8 text. Evidence: artifact writer uses Node UTF-8 output and the targeted Playwright UTF-8 check passes.
- PASS - Owner-scoped records are preserved. Evidence: existing owner-scope Playwright verifies user2 cannot see user1-created assets.

## Architecture Recommendation
- Dev MEM is UI-only and cannot prove file storage.
- Dev DB/server-side storage should be used for MVP/UAT-like upload validation.
- MEM was not removed in this PR; the repo already supports an API-backed dev DB/server validation path, and this PR keeps MEM as a UI/runtime exercise mode.

## Changed Files
- `toolbox/assets/index.html`
- `toolbox/assets/assets.js`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_076-assets-upload-prod-alignment.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Impacted Lanes
- Assets tool runtime lane.
- Assets upload/write/view behavior.
- Assets owner-scoped catalog behavior.
- Targeted Assets Playwright lane.
- Workspace V2 contract lane.

## Skipped Lanes
- Full samples smoke: SKIP - explicitly out of scope and no sample runtime behavior changed.
- Production auth/account system: SKIP - guest gating is UI/API-session behavior only; no production account system changes were made.
- Unrelated toolbox tools: SKIP - scoped to Assets and its targeted Playwright coverage.

## Validation Performed
- PASS - `node --check toolbox/assets/assets.js`
- PASS - `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS - `git diff --check -- toolbox/assets/index.html toolbox/assets/assets.js tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS - `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --workers=1 --reporter=list` -> 9 passed
- PASS - `npm run test:workspace-v2` -> 5 passed in workspace-contract lane

## Playwright Result
- PASS - Targeted Assets Playwright: 9 passed.
- PASS - Workspace V2: 5 passed.

## V8 Coverage
- PASS/WARN - `docs_build/dev/reports/playwright_v8_coverage_report.txt` refreshed from targeted Assets Playwright.
- PASS - Browser runtime `toolbox/assets/assets.js`: 96% advisory V8 coverage.
- WARN - Node-side/repository helper files listed by the shared coverage reporter are not collected by browser V8 coverage; behavior is covered by targeted Playwright and syntax/static checks.

## Upload Write Evidence
- PASS - Local DB/server-backed lane used `sessionModeId: local-db`.
- PASS - Folder evidence: `projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/image/` is recreated during upload.
- PASS - File evidence: `projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/image/write-view-image.png` exists after upload and matches selected bytes.
- PASS - No false OK evidence: unsupported write mode shows visible FAIL/SKIP diagnostics and creates no asset record.

## Guest Block Evidence
- PASS - Guest Add Images button remains enabled.
- PASS - Guest file selection shows `Uploads require a Game Foundry account.`
- PASS - Guest prompt includes `Sign In` and `Create Account`.
- PASS - Guest upload creates no `guest-upload.png` asset row.

## Manual Validation Steps
1. Open `toolbox/assets/index.html` through the local API-backed server.
2. Confirm `Path: projects/<projectId>/` appears centered above the asset type accordions.
3. Confirm `Add Data` and `Add Vector` are visible, disabled, and show Planned tooltip text.
4. Add an Image file and confirm upload starts immediately after file selection.
5. Confirm the row Preview value is `image/<filename>` and View metadata stores/uses `projects/<projectId>/image/<filename>`.
6. Repeat auto-start file selection for Audio and Fonts.
7. Open as a guest session, attempt an Image upload, and confirm the account-required prompt appears with no new record.
8. Use server/dev DB validation mode for UAT-like storage proof and confirm the physical file exists under `projects/<projectId>/<asset-type>/`.

## Samples Decision
- SKIP - Full samples smoke was not run because the request explicitly said not to run it and this PR is scoped to Assets upload/catalog behavior.
