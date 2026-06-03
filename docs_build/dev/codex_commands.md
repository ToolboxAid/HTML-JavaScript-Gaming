# Codex Commands

Task:

- `PR_26154_018-theme-v2-wiring-and-fontawesome-audit`
- `PR_26154_019-tools-legacy-and-capture-runtime-audit`
- `PR_26154_020-theme-v2-css-structure-normalization`

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short --untracked-files=all`
- Targeted file inspection for:
  - `assets/theme/v2/`
  - `tools/index.html`
  - `tools/tools-page-accordions.js`
  - `assets/theme/v2/js/tools-page-accordions.js`
  - `assets/theme/v2/js/gamefoundry-partials.js`
  - `assets/theme/v2/js/tool-display-mode.js`
  - `src/engine/ui/toolboxaid-header.html`
  - `tools/shared/tooling/CapturePreviewRuntime.js`
  - `tools/dev/checkStyleSystemGuard.mjs`
  - `package.json`
  - `scripts/`
- Targeted reference checks for:
  - `assets/theme/v2`
  - Font Awesome and `fa-*` usage
  - `tools/index.html` active data
  - `src/engine/ui/toolboxaid-header.html`
  - `tools/shared/tooling/CapturePreviewRuntime.js`
  - `assets/theme/v2/css/theme/v2`
  - deprecated game/sample test shims
- Removed Arcade from active `tools/tools-page-accordions.js`.
- Deleted unreferenced `src/engine/ui/toolboxaid-header.html`.
- Deleted obsolete `tools/shared/tooling/CapturePreviewRuntime.js`.
- Moved Theme V2 core CSS files from `assets/theme/v2/css/theme/v2/` to `assets/theme/v2/css/`.
- Preserved existing `styles.css` bundle support modules as `site-colors.css` and `site-controls.css`.
- Moved deprecated game/sample test shims from `scripts/` to `tests/validation/`.
- Updated package scripts to the moved deprecated test shims.
- Updated Theme V2 stylesheet references to `assets/theme/v2/css/theme.css`.
- Updated `docs_build/dev/PROJECT_INSTRUCTIONS.md` to the normalized Theme V2 CSS root.
- Updated `assets/theme/v2/css/gamefoundrystudio.css` so pages on the `styles.css` path use direct-child Toolbox submenu expansion and nested Objects/Worlds popouts.
- Created:
  - `docs_build/dev/reports/theme_v2_wiring_fontawesome_audit_report.md`
  - `docs_build/dev/reports/tools_legacy_capture_runtime_audit_report.md`
  - `docs_build/dev/reports/theme_v2_css_structure_normalization_report.md`
- Ran targeted validation for active references, CSS import resolution, tools ordering, moved/deleted files, and Font Awesome status.
- Ran targeted Playwright hover validation for `marketplace/index.html` Toolbox nested menu behavior.
- Ran static validation for changed HTML, JS, CSS, JSON, and Markdown files.
- Ran `npm run check:style-system-guard`.
- Ran `git diff --check`.
- Ran `git status --short -- start_of_day old-tools old_games old_samples`.
- Ran `npm run codex:review-artifacts`.
- Expanded `docs_build/dev/reports/codex_review.diff` with new-file patches for untracked text additions.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_018-020-theme-tools-css-stack_delta.zip`

Validation summary:

- PASS initial PR017 closeout state was clean enough to continue.
- PASS active Tools index excludes Arcade and remains alphabetically sorted.
- PASS no active references remain to `src/engine/ui/toolboxaid-header.html`.
- PASS no active references remain to `tools/shared/tooling/CapturePreviewRuntime.js` or `bootCapturePreview`.
- PASS package scripts point to `tests/validation/skip-deprecated-*.mjs`.
- PASS no active references remain to `assets/theme/v2/css/theme/v2`.
- PASS `assets/theme/v2/css/theme/v2/` is removed.
- PASS Theme V2 core CSS imports resolve from `assets/theme/v2/css/`.
- PASS Font Awesome remains under `assets/theme/v2/fonts/fontawesome/` and is classified as unused/stale.
- PASS `marketplace/index.html` Toolbox hover opens only the first-level Toolbox menu, then opens Objects and Worlds separately.
- PASS static validation for changed HTML, JS, CSS, JSON, and Markdown files.
- PASS `npm run check:style-system-guard`.
- PASS `git diff --check`.
- PASS no `start_of_day/`, `old-tools/`, `old_games/`, or `old_samples/` changes.
- PASS review artifact generation.
- PASS review diff includes untracked text additions.
- PASS repo-structured delta ZIP packaging.
- SKIPPED `npm run test:workspace-v2`; active Workspace V2 launch/navigation behavior was not changed.
- SKIPPED tests against `old-tools/`, `old_games/`, and `old_samples` per request.
- SKIPPED full samples smoke test per request.
