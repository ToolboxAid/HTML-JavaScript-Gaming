# PR_26152_257 Toolbox Header Popout Safe Reapply

## Scope

- Reapplied the shared Toolbox header submenu as hover/focus popout navigation.
- Kept internal `tools/` paths unchanged.
- Updated root shared-header tool pages to load the current Theme V2 shared layer after the existing tool page stylesheet.
- Did not modify `tools/tools-page-accordions.js`.
- Did not touch samples.
- Did not run automated tests per request.

## Changes

- `GameFoundryStudio/assets/partials/header-nav.html`
  - Replaced Toolbox accordion submenu markup with hover/focus popout markup.
  - Sorted top-level Toolbox entries alphabetically:
    - AI
    - Assets
    - Audio
    - Colors
    - Input
    - Objects
    - Worlds
  - Sorted Objects submenu:
    - Animated Sprite
    - Sprite
    - UI
    - Vector
  - Sorted Worlds submenu:
    - Hybrid
    - Isometric
    - Tilemap
    - Vector

- `GameFoundryStudio/assets/css/theme/v2/layout.css`
  - Scoped navigation/menu selectors under `.site-header`.
  - Changed submenu hover/focus behavior to immediate-child popout behavior.
  - Added nested Toolbox popout positioning under `.site-header` selectors only.
  - Did not add or change `.tool-workspace`, `.tool-column`, panel, accordion, column, or workspace selectors.

- `GameFoundryStudio/assets/js/gamefoundry-partials.js`
  - Added missing root-page route handling for new Toolbox submenu routes that already existed in `routeMap`.

- Root shared-header tool pages
  - Added `assets/css/theme/v2/theme.css` after the existing tool page stylesheet so the shared header uses the current Theme V2 navigation layer while preserving existing tool page workspace styling.

## Validation

- PASS: `git diff --check`
- Notes: Git emitted line-ending notices for modified files, but the command exited successfully.

## Automated Tests

- SKIP: Automated tests were not run because the BUILD request says the user will perform visual validation.

## Samples

- SKIP: Samples were not touched.

## Blockers

- None.
