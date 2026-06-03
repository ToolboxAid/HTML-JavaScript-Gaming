# PR_26154_007 Theme V2 Remaining Inventory Report

## Summary

Audited the remaining `src/engine/theme/v2/` surface after template cleanup.

The folder still contains active public/root Theme V2 CSS, JS, partials, and one placeholder asset. No files under this folder are classified as runtime engine ownership for this PR; runtime engine styling remains outside this folder under `src/engine/theme/`.

## Remaining Folders

- `src/engine/theme/v2/assets/`
- `src/engine/theme/v2/assets/css/`
- `src/engine/theme/v2/assets/css/theme/v2/`
- `src/engine/theme/v2/assets/css/tools/grouping/`
- `src/engine/theme/v2/assets/js/`
- `src/engine/theme/v2/assets/partials/`

The old templates folder no longer exists.

## File Classification

| File | Classification | Notes |
|---|---|---|
| `assets/css/theme/v2/accordion.css` | public asset ownership | Active approved Theme V2 CSS module. |
| `assets/css/theme/v2/buttons.css` | public asset ownership | Active approved Theme V2 CSS module. |
| `assets/css/theme/v2/colors.css` | public asset ownership | Active approved Theme V2 CSS module. |
| `assets/css/theme/v2/controls.css` | public asset ownership | Active approved Theme V2 CSS module. |
| `assets/css/theme/v2/dialogs.css` | public asset ownership | Active approved Theme V2 CSS module. |
| `assets/css/theme/v2/forms.css` | public asset ownership | Active approved Theme V2 CSS module. |
| `assets/css/theme/v2/layout.css` | public asset ownership | Active approved Theme V2 CSS module. |
| `assets/css/theme/v2/panels.css` | public asset ownership | Active approved Theme V2 CSS module. |
| `assets/css/theme/v2/spacing.css` | public asset ownership | Active approved Theme V2 CSS module. |
| `assets/css/theme/v2/status.css` | public asset ownership | Active approved Theme V2 CSS module. |
| `assets/css/theme/v2/tables.css` | public asset ownership | Active approved Theme V2 CSS module. |
| `assets/css/theme/v2/theme.css` | public asset ownership | Active Theme V2 CSS entrypoint. |
| `assets/css/theme/v2/typography.css` | public asset ownership | Active approved Theme V2 CSS module. |
| `assets/css/base.css` | public asset ownership | Active legacy public CSS wrapper module imported by `styles.css`; recommend consolidation into approved Theme V2 modules. |
| `assets/css/colors.css` | public asset ownership | Active legacy public color token module imported by `styles.css`; overlaps newer Theme V2 color ownership. |
| `assets/css/controls.css` | public asset ownership | Active legacy public controls module imported by `styles.css`; recommend consolidation into approved Theme V2 controls/forms modules. |
| `assets/css/gamefoundrystudio.css` | public asset ownership | Active public component/pattern module imported by `styles.css`; outside approved module path. |
| `assets/css/pages.css` | public asset ownership | Active public page layout module imported by `styles.css`; recommend consolidation or explicit public ownership decision. |
| `assets/css/styles.css` | public asset ownership | Active public CSS aggregator consumed by pages/tools. |
| `assets/css/tokens.css` | public asset ownership | Active legacy public token module imported by `styles.css`; overlaps newer Theme V2 token/module ownership. |
| `assets/css/tools.css` | public asset ownership | Active public tool-shell CSS module imported by `styles.css`; recommend review against shared runtime shell boundaries before moving. |
| `assets/css/tools/grouping/ai-learning.css` | public asset ownership | Active public tool grouping color module imported by `styles.css`. |
| `assets/css/tools/grouping/build-create.css` | public asset ownership | Active public tool grouping color module imported by `styles.css`. |
| `assets/css/tools/grouping/community-marketplace.css` | public asset ownership | Active public tool grouping color module imported by `styles.css`. |
| `assets/css/tools/grouping/content-assets.css` | public asset ownership | Active public tool grouping color module imported by `styles.css`. |
| `assets/css/tools/grouping/development-system.css` | public asset ownership | Active public tool grouping color module imported by `styles.css`. |
| `assets/css/tools/grouping/media-audio.css` | public asset ownership | Active public tool grouping color module imported by `styles.css`. |
| `assets/css/tools/grouping/platform-cloud.css` | public asset ownership | Active public tool grouping color module imported by `styles.css`. |
| `assets/css/tools/grouping/play.css` | public asset ownership | Active public tool grouping color module imported by `styles.css`. |
| `assets/js/account-controls.js` | public asset ownership | Active public admin controls page helper. |
| `assets/js/gamefoundry-partials.js` | public asset ownership | Active public header/footer partial loader and route mapper. |
| `assets/js/tool-display-mode.js` | public asset ownership | Active public/root tool display-mode helper. |
| `assets/js/tools-page-accordions.js` | public asset ownership | Active public tools index accordion helper. |
| `assets/partials/footer.html` | public asset ownership | Active public footer partial loaded by `gamefoundry-partials.js`. |
| `assets/partials/header-nav.html` | public asset ownership | Active public header/nav partial loaded by `gamefoundry-partials.js`; logo image now resolves from the public Theme V2 image root. |
| `assets/image-missing.svg` | public asset ownership | Active placeholder asset used by the root page template and tool template baseline. Recommend moving to the public Theme V2 image root in a later asset cleanup PR. |
| `assets/partials/page-shell.html` | obsolete/deprecated | Shell stub exists, but no active partial loader mapping or page reference was found. |
| `assets/partials/tool-shell.html` | obsolete/deprecated | Shell stub exists, but no active partial loader mapping or page reference was found. |

## Runtime Engine Ownership

No remaining file under `src/engine/theme/v2/` was classified as runtime engine ownership in this PR.

Runtime engine styling remains under `src/engine/theme/`, including the shared engine/runtime shell styling called out by project governance. This PR did not move or modify that runtime engine surface.

## Recommended Next Moves

1. Decide whether public Theme V2 CSS/JS/partials should remain served from `src/engine/theme/v2/assets/` or move to a public asset root in a dedicated ownership PR.
2. If public asset ownership moves, migrate active public files as a unit: CSS entrypoints/modules, public JS helpers, header/footer partials, and `image-missing.svg`.
3. Consolidate active legacy wrapper CSS modules into the approved Theme V2 module set instead of keeping parallel top-level CSS ownership indefinitely.
4. Remove or explicitly revive the unused page/tool shell partial stubs in a separate PR after confirming no planned consumer needs them.
5. Keep runtime engine shell styling under `src/engine/theme/` until a shared shell contract is approved.
