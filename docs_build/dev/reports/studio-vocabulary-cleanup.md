# PR_26155_013 Studio Vocabulary Cleanup

## Scope

- Removed old `*-studio` tool identities from active Toolbox labels, route keys, registry ids, tool display slugs, and the active Toolbox Playwright assertion.
- Kept the product/site id as `GameFoundryStudio`.
- Updated active shared navigation and route wiring in:
  - `assets/theme-v2/partials/header-nav.html`
  - `assets/theme-v2/js/gamefoundry-partials.js`
  - `toolbox/toolRegistry.js`
  - active `toolbox/*/index.html` pages
- Avoided renaming the existing theme image library in this PR. Active pages and Toolbox cards now use existing Theme V2 neutral badge/placeholder assets where concise replacement images do not exist.

## Identity Mapping

- `animation-studio` -> `animation`
- `asset-studio` -> `assets` for the registry id and `tool-assets` for the header route key to avoid collision with the community assets route.
- `cloud-studio` -> `cloud`
- `code-studio` -> `code`
- `game-design-studio` -> `game-design`
- `input-studio` -> `input`
- `localization-studio` -> `localization`
- `midi-studio-v2` -> `midi`
- `object-vector-studio-v2` -> `object-vector`
- `palette-manager-v2` -> `palette-manager`
- `particle-studio` -> `particles`
- `publish-studio` -> `publish`
- `sound-studio` -> `sound`
- `storage-inspector-v2` -> `storage-inspector`
- `world-vector-studio-v2` -> `world-vector`

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
