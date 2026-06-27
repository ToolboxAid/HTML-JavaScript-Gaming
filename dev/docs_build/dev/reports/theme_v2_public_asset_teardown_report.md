# PR_26154_008 Theme V2 Public Asset Teardown Report

## Summary

Completed the focused Theme V2 public asset teardown.

- Moved remaining public/root Theme V2 CSS into `assets/theme/v2/css/`.
- Moved remaining public/root Theme V2 JS helpers into `assets/theme/v2/js/`.
- Moved remaining public/root Theme V2 partials into `assets/theme/v2/partials/`.
- Moved `image-missing.svg` into `assets/theme/v2/images/image-missing.svg`.
- Updated pages, templates, tool pages, public docs, development docs, governance references, and historical reports to consume `assets/theme/v2/`.
- Removed the former Theme V2 source folder because it was empty after the move and no references remained outside generated artifacts.
- Did not move unrelated `src/engine` runtime files.
- Did not modify `start_of_day/`.

## Move Results

Moved file counts:

- CSS files: 29
- JS helper files: 4
- Partial files: 4
- Placeholder image files: 1

Destination checks:

- `assets/theme/v2/css/styles.css`
- `assets/theme/v2/css/theme/v2/theme.css`
- `assets/theme/v2/js/gamefoundry-partials.js`
- `assets/theme/v2/js/tool-display-mode.js`
- `assets/theme/v2/js/account-controls.js`
- `assets/theme/v2/js/tools-page-accordions.js`
- `assets/theme/v2/partials/header-nav.html`
- `assets/theme/v2/partials/footer.html`
- `assets/theme/v2/images/image-missing.svg`

## Reference Updates

Updated public/root references to the new public asset root, including:

- root home page and root page template
- public docs, account, admin, company, community, games, legal, learn, marketplace, and tool pages
- current tool template baseline
- deprecated old localization tool page reference
- public and development docs that referenced the former Theme V2 public asset location

The moved `gamefoundry-partials.js` still resolves partials relative to its own script root, now under `assets/theme/v2/js/`.

The moved `tools-page-accordions.js` generated image references were normalized to `/assets/theme/v2/images/...`.

The active root tools index still loads `toolbox/tools-page-accordions.js`; that local helper was not moved because this PR only moves content from the former Theme V2 public asset source surface. The local helper already resolves images from `../assets/theme/v2/images/...`.

## Source Teardown

The former source Theme V2 public asset folder was removed after the move.

The parent Theme V2 source folder was also removed because no files remained after PR_26154_007 template cleanup and this PR's public asset move.

## Validation

Passed:

- targeted reference checks for the former source path and the public `css`, `js`, `partials`, and `images` paths
- zero runtime/public reference check for the former source asset root
- zero reference check for the former parent Theme V2 source folder string
- destination existence checks for public CSS, JS, partial, and placeholder image files
- static validation for changed HTML, JS, CSS, and Markdown files
- CSS import path validation for changed CSS files
- root page template browser check with moved CSS, JS, partials, logo, and placeholder image returning `200`
- tool template browser check with moved CSS, JS, partials, logo, placeholder image, and display-mode fallbacks returning `200`
- `git diff --check`
- review artifact generation
- repo-structured delta ZIP packaging

Skipped by scope:

- `npm run test:workspace-v2`, unless active tool launch/navigation behavior changes
- tests against `archive/v1-v2/games` or `archive/v1-v2/samples`
- full samples smoke test
