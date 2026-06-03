# Codex Commands

Task: `PR_26154_009-theme-v1-assets-games-favicon-cleanup`

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short`
- Targeted `rg`, `Get-ChildItem`, and `Get-Content` inventory for:
  - `favicon.ico`
  - `assets/theme/v2/images/games`
  - `games/assets/images`
  - `src/engine/theme`
  - `assets/theme/v1`
- Node move/rewrite script for:
  - `assets/theme/v2/images/games/` -> `games/assets/images/`
  - `src/engine/theme/fontawesome/` -> `assets/theme/v1/fontawesome/`
  - `src/engine/theme/toolboxaid-header.png` -> `assets/theme/v1/images/toolboxaid-header.png`
  - HTML favicon links -> `/favicon.ico`
  - moved games image references -> `/games/assets/images/`
  - moved V1 static asset references -> `assets/theme/v1/`
- Targeted reference checks for:
  - `favicon`
  - `assets/theme/v2/images/games`
  - `games/assets/images`
  - `src/engine/theme/fontawesome`
  - `src/engine/theme/toolboxaid-header.png`
  - `assets/theme/v1`
- Node targeted static/path validation for changed HTML/CSS/JS/JSON/Markdown paths.
- Node HTTP validation for root favicon, moved games images, and moved V1 static assets.
- `git status --short -- old_games old_samples start_of_day`
- `git diff --check`
- `npm run codex:review-artifacts`
- Python ZIP packaging for `tmp/PR_26154_009-theme-v1-assets-games-favicon-cleanup_delta.zip`

Validation summary:

- PASS root `/favicon.ico` exists and resolves.
- PASS duplicate `favicon.ico` scan found only the root file.
- PASS active HTML favicon references use `/favicon.ico`.
- PASS zero active references remain to `assets/theme/v2/images/games`.
- PASS moved games images resolve from `games/assets/images`.
- PASS zero active references remain to moved V1 public asset source paths under `src/engine/theme`.
- PASS moved V1 static assets resolve from `assets/theme/v1`.
- PASS `old_games/`, `old_samples/`, and `start_of_day/` unchanged.
- PASS static validation for changed HTML/CSS/JS/JSON/Markdown paths.
- PASS HTTP validation for `/favicon.ico`, moved games images, and moved V1 static assets.
- PASS `git diff --check`.
- PASS `npm run codex:review-artifacts`.
- SKIPPED `npm run test:workspace-v2`; active Workspace V2 launch/navigation behavior was not changed.
- SKIPPED old_games, old_samples, and full samples smoke validation per request.
