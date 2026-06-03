# Codex Commands

Task:

- `PR_26154_021-migration-cleanup-share-tools-scripts`

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short --untracked-files=all`
- Targeted inspection for:
  - `index.html`
  - `tools/index.html`
  - `tools/tools-page-accordions.js`
  - `assets/theme/v2/js/tools-page-accordions.js`
  - `tools/`
  - `tools/shared/tooling/CapturePreviewRuntime.js`
  - `scripts/`
  - `scripts/PS/`
  - `package.json`
  - `tests/run-tests.mjs`
- Removed deprecated-only old game/sample package scripts.
- Removed deprecated-only old game/sample scripts and deprecated validation wrappers.
- Removed old game template contract test wiring from `tests/run-tests.mjs`.
- Removed unreferenced duplicate `assets/theme/v2/js/tools-page-accordions.js`.
- Added display-only Staff Picks content under Trending Games on `index.html`.
- Expanded `Build · Play · Share` guidance in `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Created:
  - `docs_build/dev/reports/migration_cleanup_share_tools_scripts_report.md`
- Ran targeted reference checks for removed deprecated scripts/tests, active Tools index Arcade state, capture runtime references, package scripts, and Build/Play/Share documentation.
- Ran static validation for changed HTML, JS, JSON, and Markdown files.
- Ran `git diff --check`.
- Ran `npm run codex:review-artifacts`.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_021-migration-cleanup-share-tools-scripts_delta.zip`

Validation summary:

- PASS `package.json` parses and remains at repo root.
- PASS `tests/run-tests.mjs` parses after removing the deprecated game-template test import.
- PASS `tools/tools-page-accordions.js` parses and active tools links resolve.
- PASS active `tools/index.html`/`tools/tools-page-accordions.js` has no Arcade tile.
- PASS no active references remain to removed deprecated script/test names.
- PASS no active references remain to `CapturePreviewRuntime` or `bootCapturePreview` outside docs/reports/deprecated folders.
- PASS `index.html` Staff Picks markup uses existing classes, has no inline script/style/event handlers, and image assets resolve.
- PASS `Build · Play · Share` guidance includes Build, Play, and Share definitions requested by the PR.
- PASS `git diff --check`.
- SKIPPED `npm run test:workspace-v2`; active Workspace V2 launch/navigation behavior was not changed.
- SKIPPED tests against `old-tools/`, `old_games/`, and `old_samples` per request.
- SKIPPED full samples smoke test per request.
