# PR_26151_011-gamefoundry-folder-routing-and-publish-tile Validation

## Scope

- Scope limited to `GameFoundryStudio` implementation files plus required `docs/dev` reports.
- No new CSS files were created.
- Existing `controls.css`, `gamefoundrystudio.css`, color files, meaning-color behavior, shared partials, tool shell structure, Tool Display Mode behavior, fullscreen behavior, and horizontal/vertical accordion behavior were preserved.

## Changes

- Renamed the remaining prefixed tool files under `GameFoundryStudio/tools/`:
  - `tool-builder.html` -> `builder.html`
  - `tool-creator.html` -> `creator.html`
  - `tool-publisher.html` -> `publisher.html`
- Updated shared nav partial routes and `gamefoundry-partials.js` route mappings to the new tool paths.
- Removed obsolete root-level redirect duplicates:
  - `account.html`
  - `brand.html`
  - `controls.html`
  - `tool-builder.html`
  - `tool-creator.html`
  - `tool-publisher.html`
- Rebuilt stale root `about.html` and `assets.html` to use the shared header/footer partials instead of hardcoded obsolete nav links.
- Added a Publish Studio tile to `GameFoundryStudio/tools/index.html` linking to `publisher.html`.
- Preserved the user-requested removal of Tool Display Mode from `GameFoundryStudio/tools/index.html`; individual tool pages and group tool pages retain Tool Display Mode before the center column.

## Validation

Passed:

- `rg -n 'tool-builder|tool-creator|tool-publisher|tools/tool-|href="tools.html"|href="games.html"|href="marketplace.html"|href="learn.html"|href="community.html"|href="docs.html"|href="account.html"' GameFoundryStudio -g '*.html' -g '*.js'`
  - Result: no matches.
- `rg --files GameFoundryStudio | rg '(^|/|\\)(tool-|account\.html|controls\.html|brand\.html)$|tools[/\\]tool-'`
  - Result: no matches.
- `rg --pcre2 -n '<style\b|<script(?![^>]*\bsrc=)|\son[a-zA-Z]+\s*=|\sstyle\s*=' GameFoundryStudio -g '*.html'`
  - Result: no matches.
- `rg --files GameFoundryStudio/tools | rg 'tool-.*\.html$'`
  - Result: no matches.
- `rg -n 'href="publisher.html"|Publish Studio|publish-studio' GameFoundryStudio/tools/index.html`
  - Result: Publish Studio tile and asset references present.
- `rg -n 'data-tool-display-mode' GameFoundryStudio/tools -g '*.html'`
  - Result: individual tool pages and group tool pages retain Tool Display Mode slots before the center column.
- `rg -n 'data-tool-display-mode|tool-display-mode.js' GameFoundryStudio/tools/index.html`
  - Result: no matches, preserving the newest explicit catalog-page request.
- `node --check GameFoundryStudio/assets/js/gamefoundry-partials.js`
- `node --check GameFoundryStudio/assets/js/tool-display-mode.js`
- `npm run test:playwright:static`
- `rg -n 'GameFoundry|Game Foundry|GameFoundryStudio' tests scripts package.json`
  - Result: no existing GameFoundryStudio-specific Playwright/browser coverage found.

Blocked or not run:

- Targeted Node navigation resolution script attempts were intermittently blocked by the sandbox with `windows sandbox: spawn setup refresh`.
- Delta ZIP packaging with `Compress-Archive` was blocked by the sandbox with `windows sandbox: spawn setup refresh`.
- Full samples smoke test was not run per instruction.

## Notes

- `GameFoundryStudio/account/index.html`, `GameFoundryStudio/account/branding.html`, and `GameFoundryStudio/account/controls.html` already existed as the authoritative account paths and were preserved.
- `GameFoundryStudio/publish/index.html` remains as the site publishing page; the Tools catalog Publish Studio tile links to the authoritative tool page at `GameFoundryStudio/tools/publisher.html`.
