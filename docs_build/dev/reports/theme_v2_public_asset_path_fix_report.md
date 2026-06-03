# PR_26154_005 Theme V2 Public Asset Path Fix Report

## Summary

Completed the focused public asset path fix for `tool-display-mode.js`.

- Badge and character image URLs now resolve from `/assets/theme/v2/assets/images/`.
- `tool-display-mode.js` no longer derives badge/character image URLs from the script location under `src/engine/theme/v2`.
- Legacy `data-tool-icon-src` PNG filenames are preserved as filenames only, then resolved through the public Theme V2 asset root.
- Non-PNG display-mode image overrides, such as the template `image-missing.svg` placeholder, resolve to the public `index.png` fallback.

## Public Assets Restored

Created the public Theme V2 badge/character image folders:

- `assets/theme/v2/assets/images/badges/`
- `assets/theme/v2/assets/images/characters/`

Copied existing PNG sources from:

- `src/engine/theme/v2/assets/images/badges/`
- `src/engine/theme/v2/assets/images/characters/`

Copied counts:

- badges: 22 existing PNG files plus `index.png`
- characters: 23 existing PNG files plus `index.png`

No exact `index.png` source existed under the old source tree. The required public fallbacks were created from existing `settings-studio.png` badge and character sources.

## Runtime Check

Opened:

- `tools/_templates-v2/index.html`

Observed image sources:

- badge: `/assets/theme/v2/assets/images/badges/index.png`
- character: `/assets/theme/v2/assets/images/characters/index.png`

Observed network statuses:

- `assets/theme/v2/assets/images/badges/index.png` -> `200`
- `assets/theme/v2/assets/images/characters/index.png` -> `200`

Both display-mode image requests no longer 404.

## Targeted Reference Checks

Results excluding `start_of_day/`, `old_samples/`, `old_games/`, `old-tools/`, `tmp/`, and generated PR reports:

- `src/engine/theme/v2/assets/images` references remaining: 151
- `src/engine/theme` references remaining: 431
- `assets/theme/v2/assets/images` code references: 1, in `src/engine/theme/v2/assets/js/tool-display-mode.js`

Required public asset paths exist:

- `assets/theme/v2/assets/images/badges/index.png`
- `assets/theme/v2/assets/images/characters/index.png`

## src/engine/theme Reference Classification

`src/engine/theme/` remains in place per scope.

Current reference classification:

- Engine/runtime styling and shell support:
  - `src/engine/theme/main.css`, `tokens.css`, `layout.css`, `header.css`, `nav.css`, `pages.css`, `accordion.css`, `tool-shell.css`, `tools.css`, `games.css`, and `samples.css`
  - `src/engine/theme/Theme.js`
  - `src/engine/theme/ThemeTokens.js`
  - `src/engine/theme/mount-shared-header.js`
  - `src/engine/theme/accordionV2/*`
  - `src/engine/theme/toolboxaid-header.*`
- Public Theme V2 styling/scripts still referenced from public/root pages:
  - `src/engine/theme/v2/assets/css/*`
  - `src/engine/theme/v2/assets/css/theme/v2/*`
  - `src/engine/theme/v2/assets/js/gamefoundry-partials.js`
  - `src/engine/theme/v2/assets/js/tool-display-mode.js`
  - `src/engine/theme/v2/assets/js/tools-page-accordions.js`
  - `src/engine/theme/v2/assets/partials/*`
- Obsolete public image-source references still present outside this PR scope:
  - public/root pages and tool pages still reference `src/engine/theme/v2/assets/images/...` for favicons, page art, tool cards, and hero images.

Recommended follow-up: migrate remaining public/root image references from `src/engine/theme/v2/assets/images/...` to `assets/theme/v2/assets/images/...` after the public asset surface is fully populated and validated. Do not move `src/engine/theme/` until the runtime shell styling versus public Theme V2 styling boundary is explicitly separated.

## Validation

Passed:

- `node --check src/engine/theme/v2/assets/js/tool-display-mode.js`
- Required public asset existence checks for `badges/index.png` and `characters/index.png`
- Targeted reference checks for `src/engine/theme/v2/assets/images`, `assets/theme/v2/assets/images`, `badges/index.png`, and `characters/index.png`
- Static validation for the changed JS file
- Local browser validation of `tools/_templates-v2/index.html` confirming both display-mode image requests returned `200`

Skipped:

- No tests against `old_games` or `old_samples`
- No full samples smoke test
- `npm run test:workspace-v2`, because this PR changed image resolution only and did not change tool launch or navigation behavior

