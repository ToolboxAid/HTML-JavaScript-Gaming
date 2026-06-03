# Codex Commands

Task:

- `PR_26154_014-tools-index-sort-cleanup`

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short --untracked-files=all`
- `Get-Content tools/index.html`
- `Get-Content tools/tools-page-accordions.js`
- `rg -n "GameFoundryStudio/|src/engine/theme/|assets/theme/v2/assets/|assets/theme/v2/images/games/|favicon\\.ico" tools/index.html tools/tools-page-accordions.js`
- Node scoped rewrite for `tools/tools-page-accordions.js` group and tile ordering.
- `rg --files | rg -i "localization|localisation|localize|translate|translation"`
- `Get-ChildItem assets/theme/v2/images/tools`
- `rg -n "localization\\.png|localization-studio|Localization|localization" tools assets docs docs_build -g "!*old*"`
- `rg -n "tools-page-accordions\\.js" -g "*.html" -g "*.js" -g "*.md" -g "*.json" .`
- `node --check tools/tools-page-accordions.js`
- Node targeted validator for:
  - active Tools index group ordering
  - tile ordering within each group
  - active tool href/image file existence
  - `tools/index.html` local ref file existence
  - stale active path strings
- Node static validation for changed HTML, JS, CSS, JSON, and Markdown files.
- `git diff --check`
- `git status --short -- start_of_day old_games old_samples`
- `npm run codex:review-artifacts`
- ZIP packaging for `tmp/PR_26154_014-tools-index-sort-cleanup_delta.zip`

Validation summary:

- PASS `tools/tools-page-accordions.js` syntax validation.
- PASS active Tools index group order is alphabetical.
- PASS active Tools index tile order is alphabetical within every group.
- PASS 19 active tool href/image references resolve.
- PASS 4 `tools/index.html` local refs resolve.
- PASS no targeted stale path strings remain in `tools/index.html` or `tools/tools-page-accordions.js`.
- PASS static validation for changed HTML, JS, CSS, JSON, and Markdown files.
- PASS `git diff --check`.
- PASS no `start_of_day/`, `old_games/`, or `old_samples/` changes.
- PASS review artifact generation.
- PASS repo-structured delta ZIP packaging.
- SKIPPED `npm run test:workspace-v2`; active Workspace V2 launch/navigation behavior was not changed.
- SKIPPED old games, old samples, and full samples smoke validation per request.
