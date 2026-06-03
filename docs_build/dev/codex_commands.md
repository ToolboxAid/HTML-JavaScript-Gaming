# Codex Commands

Tasks:

- `PR_26154_011-theme-v1-final-teardown`
- `PR_26154_012-root-asset-reference-cleanup`
- `PR_26154_013-root-structure-inventory-closeout`

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short --untracked-files=all`
- Targeted `Get-ChildItem`, `Get-Content`, and `rg` inventory for:
  - `src/engine/theme/`
  - `assets/theme/v1/`
  - active public/root pages
  - active tool surfaces under `tools/`
  - `games/`
  - `docs/`
  - stale path strings
  - current root ownership folders
- Updated `src/engine/theme/README.md` to document runtime ownership and the current direct helper import path.
- Targeted stale-reference checks for:
  - `GameFoundryStudio/`
  - `src/engine/theme/index.js`
  - `assets/theme/v2/assets/`
  - `assets/theme/v2/images/games/`
  - `favicon.ico`
- Root structure inventory counts for:
  - `assets/`
  - `tools/`
  - `old-tools/`
  - `games/`
  - `old_games/`
  - `old_samples/`
  - `docs/`
  - `docs_build/`
  - `schemas/`
  - `src/`
- Node targeted static validation for changed HTML, JS, CSS, JSON, and Markdown paths.
- `git status --short -- start_of_day old_games old_samples`
- `git diff --check`
- `npm run codex:review-artifacts`
- Python ZIP packaging for `tmp/PR_26154_011-013-root-structure-closeout_delta.zip`

Validation summary:

- PASS no confirmed V1 legacy/static assets remain under `src/engine/theme/`.
- PASS remaining `src/engine/theme/` files are runtime-owned or runtime documentation.
- PASS `src/engine/theme/README.md` no longer references the removed `index.js` barrel.
- PASS no active public/root page, active tool page, game page, public doc, asset, script, or source helper references remain to stale public asset paths.
- PASS remaining `src/engine/theme/` references are intentional runtime/guard/test references or historical/generated records.
- PASS root structure ownership inventory completed.
- PASS `schemas/` absence confirmed; active schemas are under `tools/schemas/`.
- PASS `start_of_day/`, `old_games/`, and `old_samples/` unchanged.
- PASS `git diff --check`.
- PASS `npm run codex:review-artifacts`.
- SKIPPED `npm run test:workspace-v2`; active Workspace V2 launch/navigation behavior was not changed.
- SKIPPED old_games, old_samples, and full samples smoke validation per request.
