# Theme V1 Assets, Games Images, And Favicon Cleanup

Task: `PR_26154_009-theme-v1-assets-games-favicon-cleanup`

## Summary

- Kept root `/favicon.ico` as the canonical browser favicon.
- Found no duplicate `favicon.ico` files outside the repository root.
- Updated active HTML favicon references from Theme V2 SVG paths to `/favicon.ico`.
- Moved public game card/type art from `assets/theme/v2/images/games/` to `games/assets/images/`.
- Moved confirmed static V1 companions from `src/engine/theme/` to `assets/theme/v1/`.
- Left active runtime `src/engine/theme/` CSS/JS/header modules in place per `docs_build/dev/PROJECT_INSTRUCTIONS.md`.

## Favicon Audit

Root canonical favicon:
- `favicon.ico` exists at repository root.

Duplicate `favicon.ico` scan:
- PASS: only root `favicon.ico` was found.

No duplicate `.ico` files were removed or relocated.

Retained:
- `assets/theme/v2/images/favicon.svg`

Reason:
- It is not a duplicate `.ico` file.
- Active HTML favicon references now use `/favicon.ico`.

## Favicon Path Adjustments

Updated active HTML icon links to:

```html
<link rel="icon" href="/favicon.ico">
```

Distinct path adjustments:
- `assets/theme/v2/images/favicon.svg` -> `/favicon.ico`
- `../assets/theme/v2/images/favicon.svg` -> `/favicon.ico`
- `../../assets/theme/v2/images/favicon.svg` -> `/favicon.ico`

Updated surfaces:
- Root page/template: `index.html`, `_page_template_v2.html`
- Root groups: `account/`, `admin/`, `community/`, `company/`, `docs/`, `learn/`, `legal/`, `marketplace/`
- Games pages: `games/index.html`, `games/action/index.html`, `games/adventure/index.html`, `games/arcade/index.html`, `games/puzzle/index.html`, `games/racing/index.html`, `games/retro/index.html`, `games/strategy/index.html`
- Tool pages: `toolbox/index.html`, active tool `index.html` files, `toolbox/_tool_template-v2/index.html`
- Deprecated old tool reference touched only for favicon canonicalization: `archive/v1-v2/tools/old_localization-studio/index.html`

## Games Asset Move

Moved:
- `assets/theme/v2/images/games/game-forgequest.svg` -> `games/assets/images/game-forgequest.svg`
- `assets/theme/v2/images/games/game-iceberg.svg` -> `games/assets/images/game-iceberg.svg`
- `assets/theme/v2/images/games/game-nebula.svg` -> `games/assets/images/game-nebula.svg`
- `assets/theme/v2/images/games/game-retrobot.svg` -> `games/assets/images/game-retrobot.svg`

Path adjustments:
- `assets/theme/v2/images/games/*` -> `/games/assets/images/*`
- `../assets/theme/v2/images/games/*` -> `/games/assets/images/*`
- `../../assets/theme/v2/images/games/*` -> `/games/assets/images/*`

Updated references in:
- `index.html`
- `games/index.html`
- `games/action/index.html`
- `games/adventure/index.html`
- `games/puzzle/index.html`
- `games/racing/index.html`
- `games/retro/index.html`
- `games/strategy/index.html`

Deprecated `archive/v1-v2/games/` assets were not moved or modified.

## Theme V1 Static Asset Move

Moved confirmed static V1 companions:
- `src/engine/theme/fontawesome/` -> `assets/theme/v1/fontawesome/`
- `src/engine/theme/toolboxaid-header.png` -> `assets/theme/v1/images/toolboxaid-header.png`

Path adjustments:
- `src/engine/theme/main.css`
  - `./fontawesome/css/font-awesome.min.css` -> `/assets/theme/v1/fontawesome/css/font-awesome.min.css`
- `src/engine/theme/toolboxaid-header.html`
  - `/src/engine/theme/toolboxaid-header.png` -> `/assets/theme/v1/images/toolboxaid-header.png`
- `src/engine/ui/toolboxaid-header.html`
  - `/src/engine/theme/toolboxaid-header.png` -> `/assets/theme/v1/images/toolboxaid-header.png`

Updated:
- `assets/theme/v1/README.md`

## `src/engine/theme/` Audit

Project instructions classify `src/engine/theme` as active engine/runtime first-class tool shell styling. It was not deleted or broadly moved.

Remaining runtime engine ownership:
- `src/engine/theme/accordion.css`
- `src/engine/theme/games.css`
- `src/engine/theme/header.css`
- `src/engine/theme/layout.css`
- `src/engine/theme/main.css`
- `src/engine/theme/nav.css`
- `src/engine/theme/pages.css`
- `src/engine/theme/samples.css`
- `src/engine/theme/tokens.css`
- `src/engine/theme/tool-shell.css`
- `src/engine/theme/tools.css`
- `src/engine/theme/accordionV2/accordionV2.css`
- `src/engine/theme/accordionV2/accordionV2.js`
- `src/engine/theme/mount-shared-header.js`
- `src/engine/theme/Theme.js`
- `src/engine/theme/ThemeTokens.js`
- `src/engine/theme/toolboxaid-header.css`
- `src/engine/theme/toolboxaid-header.html`
- `src/engine/theme/toolboxaid-header.js`

Documentation retained:
- `src/engine/theme/README.md`

Moved public/static V1 asset content:
- `fontawesome/`
- `toolboxaid-header.png`

Files not moved because they are active runtime engine code, runtime shell styling, or runtime header/template support:
- All remaining files listed above under runtime engine ownership.

Ambiguous files:
- None beyond the active runtime surface described by project instructions.

## Validation

Targeted static/path validation:
- PASS `/favicon.ico` resolves from repository root.
- PASS duplicate `favicon.ico` scan found only the root file.
- PASS active HTML icon links use `/favicon.ico`.
- PASS no active HTML references remain to `favicon.svg`.
- PASS zero active text references remain to `assets/theme/v2/images/games`.
- PASS game images resolve from `games/assets/images`.
- PASS `assets/theme/v2/images/games` folder no longer exists.
- PASS zero active text references remain to moved V1 public asset source paths:
  - `src/engine/theme/fontawesome`
  - `src/engine/theme/toolboxaid-header.png`
- PASS V1 static assets resolve from `assets/theme/v1`.
- PASS `archive/v1-v2/games/`, `archive/v1-v2/samples/`, and `start_of_day/` have no changes.

HTTP path validation:
- PASS `/favicon.ico` -> `200 image/x-icon`
- PASS `/games/assets/images/game-forgequest.svg` -> `200 image/svg+xml`
- PASS `/games/assets/images/game-iceberg.svg` -> `200 image/svg+xml`
- PASS `/games/assets/images/game-nebula.svg` -> `200 image/svg+xml`
- PASS `/games/assets/images/game-retrobot.svg` -> `200 image/svg+xml`
- PASS `/assets/theme/v1/images/toolboxaid-header.png` -> `200 image/png`
- PASS `/assets/theme/v1/fontawesome/css/font-awesome.min.css` -> `200 text/css`

Static validation:
- PASS changed HTML/CSS/JS/JSON/Markdown files are readable.
- PASS no changed JS/JSON syntax checks were required beyond the changed static set; this PR did not modify active JS or JSON source.

Skipped:
- `npm run test:workspace-v2` was not run because active Workspace V2 launch/navigation behavior was not changed.
- Tests against `archive/v1-v2/games` and `archive/v1-v2/samples` were not run.
- Full samples smoke test was not run.
