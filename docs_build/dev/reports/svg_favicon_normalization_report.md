# SVG Favicon Normalization

Task: `PR_26154_010-svg-favicon-normalization`

## Summary

- Moved the Theme V2 favicon SVG to the repository root.
- Made `/favicon.svg` the canonical site icon.
- Removed root `/favicon.ico`.
- Updated active HTML favicon links to `/favicon.svg`.
- Updated the default website deployment include list from `favicon.ico` to `favicon.svg`.
- Found no active manifest icon references to update.
- Did not modify `start_of_day/`, `old_games/`, or `old_samples/`.

## File Move

Moved:
- `assets/theme/v2/images/favicon.svg` -> `favicon.svg`

Removed:
- `favicon.ico`

## Reference Updates

HTML favicon links:
- `/favicon.ico` -> `/favicon.svg`

Updated surfaces:
- Root page/template: `index.html`, `_page_template_v2.html`
- Root groups: `account/`, `admin/`, `community/`, `company/`, `docs/`, `learn/`, `legal/`, `marketplace/`
- Games pages: `games/index.html`, `games/action/index.html`, `games/adventure/index.html`, `games/arcade/index.html`, `games/puzzle/index.html`, `games/racing/index.html`, `games/retro/index.html`, `games/strategy/index.html`
- Tool pages: `toolbox/index.html`, active tool `index.html` files, `toolbox/_tool_template-v2/index.html`
- Deprecated old tool reference touched only for favicon normalization: `old-tools/old_localization-studio/index.html`

Theme V2 references:
- Removed the public favicon from `assets/theme/v2/images/`.
- No active Theme V2 page/tool/template references remain to `assets/theme/v2/images/favicon.svg`.

Deployment reference:
- `scripts/PS/deploy/WebsiteRepoDeploymentCommon.ps1`
  - `favicon.ico` -> `favicon.svg`

Manifest icon references:
- No active `.webmanifest` or `manifest.json` files were found outside excluded/generated paths.

## Favicon ICO Audit

Active references:
- PASS: no active runtime/page/template/tool/deployment references remain to `favicon.ico` after replacing the current PR command and commit notes.

Remaining `favicon.ico` mentions that were not removed:
- Historical report content under `docs_build/dev/reports/`, especially `theme_v1_assets_games_favicon_cleanup_report.md`.

Reason:
- These files preserve prior PR audit output and are not active runtime/page/template/tool/deployment references.

Generated review artifacts:
- `docs_build/dev/reports/codex_review.diff` may contain removed `favicon.ico` lines because it records this PR's diff.
- That is expected and not an active runtime reference.

## Root Branding Asset Candidates

Additional branding assets that may belong at root in a future PR:
- `assets/theme/v2/images/logo-mark.svg`
- `assets/theme/v2/images/game-foundry-studio-logo.png`
- `assets/theme/v2/images/game-foundry-mascot-sheet.png`
- `assets/theme/v2/images/game-foundry-tools-poster.png`

Not moved in this PR:
- These assets are broader branding/media ownership decisions and were only requested for reporting.

## Validation

Targeted reference checks:
- PASS `/favicon.svg` exists at root.
- PASS `favicon.ico` file no longer exists at root.
- PASS `assets/theme/v2/images/favicon.svg` no longer exists.
- PASS no active references remain to `assets/theme/v2/images/favicon.svg`.
- PASS no active references remain to `favicon.ico` outside current PR notes/reports before report generation.
- PASS changed active HTML icon links point to `/favicon.svg`.
- PASS no active manifest icon references were found.
- PASS `start_of_day/`, `old_games/`, and `old_samples/` have no changes.

HTTP path validation:
- PASS `/favicon.svg` -> `200 image/svg+xml`

Static validation:
- PASS changed HTML/JS/JSON/Markdown files are readable.
- PASS changed PowerShell deployment helper parses successfully.

Skipped:
- `npm run test:workspace-v2` was not run because active Workspace V2 launch/navigation behavior was not changed.
- Tests against `old_games` and `old_samples` were not run.
- Full samples smoke test was not run.
