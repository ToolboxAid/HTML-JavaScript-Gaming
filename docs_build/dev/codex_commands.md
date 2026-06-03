# Codex Commands

Task:

- `PR_26154_026-template-convergence-closeout`
- `PR_26154_027-theme-v2-final-normalization`
- `PR_26154_028-legacy-surface-elimination`

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short`
- `git log -4 --oneline`
- Re-ran public/root and active toolbox template consistency audits.
- Inspected:
  - `_page_template_v2.html`
  - `toolbox/_tool_template-v2/index.html`
  - `assets/theme/v2/css/theme.css`
  - `assets/theme/v2/css/styles.css`
  - `assets/theme/v2/js/gamefoundry-partials.js`
  - `assets/theme/v2/js/tool-display-mode.js`
  - `assets/theme/v2/partials/header-nav.html`
  - `assets/theme/v2/partials/footer.html`
  - active toolbox pages with `data-tool-display-mode`
  - `tests/theme.test.js`
  - `tests/run-tests.mjs`
  - `scripts/`
- Added missing `page-title` template markers to `admin/controls.html` and `company/about.html`.
- Added explicit ToolDisplayMode data attributes to active toolbox pages that were falling back to generic `index.png` assets.
- Wired existing Font Awesome CSS through `assets/theme/v2/css/theme.css`.
- Deleted obsolete `tests/theme.test.js` and removed its aggregate runner import.
- Audited `assets/theme/v2` CSS, fonts, images, JS, and partials.
- Audited `toolbox/` and `scripts/` legacy candidates.
- Ran targeted reference checks for:
  - `_page_template_v2.html`
  - `toolbox/_tool_template-v2`
  - `theme.css`
  - `styles.css`
  - `assets/theme/v2`
  - `toolbox`
  - `scripts`
  - `tests`
- Ran static validation for changed HTML, CSS, JS/MJS, and Markdown files.
- Ran `npm run test:workspace-v2`.
- Restored generated Workspace V2 validation side-effect reports that were not part of this PR's required artifact set.
- Ran `git diff --check`.
- Ran `npm run codex:review-artifacts`.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_026-028-template-theme-legacy-closeout_delta.zip`

Validation summary:

- PASS template consistency audit: public/root pages `43/43`, active toolbox pages `20/20`.
- PASS all active toolbox ToolDisplayMode hosts have `data-tool-slug`.
- PASS explicit ToolDisplayMode image sources resolve with page base rules.
- PASS zero active references to `assets/theme/v2/css/styles.css`.
- PASS zero active references to `assets/theme/v2/css/theme/v2`.
- PASS zero active references to `assets/theme/v2/assets`.
- PASS zero active references to `assets/theme/v1`.
- PASS zero active references to `favicon.ico`.
- PASS Theme V2 CSS imports resolve, including Font Awesome.
- PASS changed HTML files have no inline script/style/event handler additions.
- PASS `node --check tests/run-tests.mjs`.
- PASS `npm run test:workspace-v2` (`2 passed`).
- PASS `git diff --check`.
- PASS `npm run codex:review-artifacts`.
- SKIPPED tests against `old-tools/`, `old_games/`, and `old_samples/` per request.
- SKIPPED full samples smoke test per request.
