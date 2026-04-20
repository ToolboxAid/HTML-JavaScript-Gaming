# BUILD_PR_SHARED_HEADER_TEMPLATE_AND_GAME_IMPORT_VALIDATION

Date: 2026-04-20

## Summary
Switched shared header template source to `src/engine/ui/toolboxaid-header.html` and updated game pages to populate Header/Intro details through data attributes instead of repeated hardcoded intro markup content.

## Changes
- Added: `src/engine/ui/toolboxaid-header.html`
- Updated: `src/engine/theme/toolboxaid-header.js`
  - template fetch now points to `../ui/toolboxaid-header.html`
- Updated: `src/engine/theme/mount-shared-header.js`
  - populates `.page-intro-title` and `.page-intro-details` from:
    1) `body[data-header-title|data-header-details]`
    2) fallback to first `body > main h1/p`
- Updated game pages (`games/*/index.html`, excluding `_template`):
  - added `data-header-title` + `data-header-details` on `<body>`
  - normalized header intro block placeholders:
    - `<h1 class="page-intro-title"></h1>`
    - `<p class="page-intro-details"></p>`

## Validation
- Confirmed representative pages include data attrs and placeholder intro nodes:
  - `games/Asteroids/index.html`
  - `games/Breakout/index.html`
- Confirmed template loader now targets `src/engine/ui/toolboxaid-header.html`.

## Scope Guard
- No gameplay logic changed.
- No color/token/CSS redesign changed in this slice.