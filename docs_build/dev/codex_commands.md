# Codex Commands

Task:

- `PR_26154_017-root-migration-closeout-bundle`

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short --untracked-files=all`
- Targeted `Get-ChildItem`, `Get-Content`, and `Test-Path` inspection for:
  - `GameFoundryStudio/`
  - `assets/theme/v1/`
  - `src/engine/theme/`
  - `samples/`
  - `favicon.ico`
  - `favicon.svg`
  - `LICENSE`
  - `docs/`
  - `docs_build/`
  - `games/index.html`
  - `tools/tools-page-accordions.js`
- Targeted ownership inventory for:
  - `tools/`
  - `old-tools/`
  - `games/`
  - `old_games/`
  - `old_samples/`
  - `docs/`
  - `docs_build/`
- Targeted active stale-reference checks for:
  - `GameFoundryStudio/`
  - `src/engine/theme/`
  - `assets/theme/v1/`
  - `favicon.ico`
  - deprecated root `samples/`
- Updated active script references from root `samples/` to `old_samples/` where the intended path was clear.
- Verified `games/index.html` game-type tile hrefs and images.
- Verified `tools/index.html` group and tile alphabetical ordering through `tools/tools-page-accordions.js`.
- Verified `/favicon.svg` canonical icon and proprietary/restrictive `LICENSE`.
- Node static validation for changed HTML, JS, CSS, JSON, Markdown, PowerShell, and Python files.
- `git diff --check`
- `git status --short -- start_of_day old-tools old_games old_samples`
- `npm run codex:review-artifacts`
- ZIP packaging for `tmp/PR_26154_017-root-migration-closeout-bundle_delta.zip`

Validation summary:

- PASS no active stale references remain for `GameFoundryStudio/`, `src/engine/theme/`, `assets/theme/v1/`, `favicon.ico`, or root `samples/`.
- PASS active/deprecated structure inventory completed.
- PASS `/docs/` user-facing only and `/docs_build/` build/governance ownership confirmed.
- PASS active game and tool structure confirmed.
- PASS `/favicon.svg` is canonical and `favicon.ico` is absent.
- PASS `LICENSE` is proprietary/restrictive.
- PASS `games/index.html` tile links and images resolve.
- PASS `tools/index.html` groups and group contents are alphabetically sorted.
- PASS static validation for changed HTML, JS, CSS, JSON, Markdown, PowerShell, and Python files.
- PASS `git diff --check`.
- PASS no `start_of_day/`, `old-tools/`, `old_games/`, or `old_samples/` changes.
- PASS review artifact generation.
- PASS repo-structured delta ZIP packaging.
- SKIPPED `npm run test:workspace-v2`; active Workspace V2 launch/navigation behavior was not changed.
- SKIPPED old tools, old games, old samples, and full samples smoke validation per request.
