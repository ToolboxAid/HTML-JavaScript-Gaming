# PR_26155_013 Legacy Tool Identity Cleanup

## Scope

- Removed old tool identity wording from active Toolbox labels, route keys, registry ids, tool display slugs, and the active Toolbox Playwright assertion.
- Kept the product/site id as `GameFoundryStudio`.
- Updated active shared navigation and route wiring in:
  - `assets/theme-v2/partials/header-nav.html`
  - `assets/theme-v2/js/gamefoundry-partials.js`
  - `toolbox/toolRegistry.js`
  - active `toolbox/*/index.html` pages
- Avoided renaming the existing theme image library in this PR. Active pages and Toolbox cards now use existing Theme V2 neutral badge/placeholder assets where concise replacement images do not exist.

## Identity Mapping

- Animation uses `animation`.
- Assets uses `assets` for the registry id and `tool-assets` for the header route key to avoid collision with the community assets route.
- Cloud uses `cloud`.
- Custom Extensions uses `code`.
- Game Design uses `game-design`.
- Input Mapping uses `input`.
- Localization uses `localization`.
- MIDI uses `midi`.
- Object Vector uses `object-vector`.
- Palette / Colors uses `palette`.
- Particles uses `particles`.
- Publish uses `publish`.
- Audio uses `sound`.
- Storage uses `storage`.
- World Vector uses `world-vector`.

## Validation Notes

- PASS: `node --check toolbox/tools-page-accordions.js`
- PASS: `node --check toolbox/toolRegistry.js`
- PASS: `node --check assets/theme-v2/js/gamefoundry-partials.js`
- PASS: `node --check assets/theme-v2/js/tool-display-mode.js`
- PASS: `node scripts/validate-active-tools-surface.mjs`
- PASS: `node scripts/validate-tool-registry.mjs`
- PASS: focused active Toolbox vocabulary scan after removing the allowed `GameFoundryStudio` token.
- PASS: no CSS files appear in `git diff --name-only -- '*.css'`.
- PASS: `git diff --check`.

## Manual Notes

- Active Toolbox labels remain concise.
- Active Toolbox route keys no longer use old tool identities.
- Historical archive/runtime contract references outside the active Toolbox surface were not migrated in this PR.
