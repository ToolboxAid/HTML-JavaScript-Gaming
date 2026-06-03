# PR_26154_005 Theme V2 Public Asset Path Fix Report

## Summary

Completed the focused public asset path fix for `tool-display-mode.js`.

- Badge and character image URLs now resolve from `/assets/theme/v2/images/`.
- `tool-display-mode.js` no longer derives badge/character image URLs from the script location under `assets/theme/v2`.
- Legacy `data-tool-icon-src` PNG filenames are preserved as filenames only, then resolved through the public Theme V2 asset root.
- Non-PNG display-mode image overrides, such as the template `image-missing.svg` placeholder, resolve to the public `index.png` fallback.

## Public Assets Restored

Created the public Theme V2 badge/character image folders:

- `assets/theme/v2/images/badges/`
- `assets/theme/v2/images/characters/`

Copied existing PNG sources from the public Theme V2 image staging folders that existed during PR_26154_005.

PR_26154_006 supersedes that staging ownership by normalizing Theme V2 image content into the canonical public image root.

Copied counts:

- badges: 22 existing PNG files plus `index.png`
- characters: 23 existing PNG files plus `index.png`

No exact `index.png` source existed under the old source tree. The required public fallbacks were created from existing `settings-studio.png` badge and character sources.

## Runtime Check

Opened:

- `toolbox/_tool_template-v2/index.html`

Observed image sources:

- badge: `/assets/theme/v2/images/badges/index.png`
- character: `/assets/theme/v2/images/characters/index.png`

Observed network statuses:

- `assets/theme/v2/images/badges/index.png` -> `200`
- `assets/theme/v2/images/characters/index.png` -> `200`

Both display-mode image requests no longer 404.

## Targeted Reference Checks

Results excluding `start_of_day/`, `old_samples/`, `old_games/`, `old-tools/`, `tmp/`, and generated PR reports:

- `assets/theme/v2/images` references remaining: 151
- `src/engine/theme` references remaining: 431
- `assets/theme/v2/images` code references: 1, in `assets/theme/v2/js/tool-display-mode.js`

Required public asset paths exist:

- `assets/theme/v2/images/badges/index.png`
- `assets/theme/v2/images/characters/index.png`

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
  - `assets/theme/v2/css/*`
  - `assets/theme/v2/css/theme/v2/*`
  - `assets/theme/v2/js/gamefoundry-partials.js`
  - `assets/theme/v2/js/tool-display-mode.js`
  - `assets/theme/v2/js/tools-page-accordions.js`
  - `assets/theme/v2/partials/*`
- Public image references:
  - public/root pages and tool pages now reference the canonical public Theme V2 image root for favicons, page art, tool cards, and hero images.

Recommended follow-up: keep `src/engine/theme/` in place until the runtime shell styling versus public Theme V2 styling boundary is explicitly separated.

## Validation

Passed:

- `node --check assets/theme/v2/js/tool-display-mode.js`
- Required public asset existence checks for `badges/index.png` and `characters/index.png`
- Targeted reference checks for the public Theme V2 image root, `badges/index.png`, and `characters/index.png`
- Static validation for the changed JS file
- Local browser validation of `toolbox/_tool_template-v2/index.html` confirming both display-mode image requests returned `200`

Skipped:

- No tests against `old_games` or `old_samples`
- No full samples smoke test
- `npm run test:workspace-v2`, because this PR changed image resolution only and did not change tool launch or navigation behavior
