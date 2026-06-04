# PR_26154_030 Toolbox Nav Character Closeout

Baseline used: `PR_26154_029-theme-v2-root-rename`.

## Scope

This PR updates only shared active Theme V2/toolbox surfaces:

- `assets/theme-v2/css/panels.css`
- `assets/theme-v2/css/gamefoundrystudio.css`
- `assets/theme-v2/partials/header-nav.html`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `toolbox/tools-page-accordions.js`

No `archive/v1-v2/tools/`, `archive/v1-v2/games/`, `archive/v1-v2/samples/`, or `start_of_day/` files were modified.

## Tool Display Character Sizing

Updated shared Theme V2 toolbox styling so `.tool-display-mode__character` uses:

- `width: 150px`
- `height: 150px`
- `margin-right: var(--space-15)` in the active `theme.css` import path

The body gap was set to zero so the requested 15px character-to-content spacing is not doubled by flex gap. The character remains the first item in the existing ToolDisplayMode body, so it stays on the left of the adjacent content.

`assets/theme-v2/css/gamefoundrystudio.css` was updated in parallel to avoid retaining a conflicting stale Theme V2 selector in the aggregate stylesheet path.

## Toolbox Header Navigation

Updated the shared header partial so every active toolbox tool page appears in the Toolbox navigation.

Active toolbox pages checked: `20`

Header coverage result: `20/20`

Grouped submenu changes:

- `Assets`: Cloud, Localization, Publish, Storage Inspector
- `Audio`: MIDI, Sound
- `Objects`: Animation, Assets, Custom Extensions, Object Vector
- `Tooling`: Tool Builder, Tool Creator
- `Worlds`: Game Builder, Game Design, Particles, World Vector

Single active tool links remain direct:

- AI Assistant
- Configuration Admin
- Input
- Palette Manager

Added route-map entries for:

- `tool-builder`
- `tool-creator`

## Marketplace Cleanup

Removed Marketplace from the active toolbox index data in `toolbox/tools-page-accordions.js`.

Marketplace remains available as a product/capability destination:

- top-level shared header link
- footer Product column link

## Targeted Checks

- PASS: all active `toolbox/[toolname]/index.html` pages are represented in `assets/theme-v2/partials/header-nav.html`.
- PASS: no deprecated `archive/v1-v2/tools/`, `archive/v1-v2/games/`, or `archive/v1-v2/samples/` paths are present in the shared header.
- PASS: `toolbox/index.html` and `toolbox/tools-page-accordions.js` contain no Marketplace tile/link entry.
- PASS: `assets/theme-v2/partials/footer.html` still contains the Marketplace Product-column link.
- PASS: zero active references remain to the retired `assets/theme/v2` path.
- PASS: `.tool-display-mode__character` resolves to 150px by 150px in shared Theme V2 styling.
- PASS: 15px adjacent spacing is provided through `var(--space-15)`.

## Validation

- `npm run test:workspace-v2`: PASS, 2 tests passed.
- Targeted header/toolbox/Marketplace/reference checks: PASS.
- Template consistency audit after Toolbox nav update: PASS.
- Static validation for changed HTML, JS, CSS, JSON, and Markdown files: PASS.
- Changed JavaScript syntax validation: PASS.
- `git diff --check`: PASS with line-ending warnings only.

Full samples smoke test was skipped by request. Tests against `archive/v1-v2/tools/`, `archive/v1-v2/games/`, and `archive/v1-v2/samples/` were skipped by request.
