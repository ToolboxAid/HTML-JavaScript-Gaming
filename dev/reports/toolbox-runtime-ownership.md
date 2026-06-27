# Toolbox Runtime Ownership

PR: `PR_26155_004-toolbox-runtime-ownership`

## Scope
- Audited `toolbox/index.html`.
- Audited `toolbox/tools-page-accordions.js`.
- Decided whether `tools-page-accordions.js` is still required for current Toolbox rendering.
- No replacement architecture was added.
- No CSS was added.
- No tools were added.

## Current `toolbox/index.html` Behavior
- Loads Theme V2 through `../assets/theme-v2/css/theme.css`.
- Provides the static Toolbox page title.
- Provides four view controls:
  - `Order A-Z`
  - `Group`
  - `Progress`
  - `Build Path`
- Provides one empty render host:
  - `<div class="accordion-group" data-tools-accordion-list></div>`
- Loads shared partials through `../assets/theme-v2/js/gamefoundry-partials.js`.
- Loads current Toolbox rendering behavior through `tools-page-accordions.js`.

## Current `tools-page-accordions.js` Behavior
- Exits early if `[data-tools-accordion-list]` is not present.
- Reads the four Toolbox controls:
  - `[data-tools-order]`
  - `[data-tools-sort='grouped']`
  - `[data-tools-view='progress']`
  - `[data-tools-view='build-path']`
- Owns the current Toolbox tool metadata used by the page render:
  - group names
  - tool titles
  - tool routes
  - preview images
  - descriptions
  - role/mascot/theme metadata
  - subgroup labels
- Owns group presentation metadata:
  - Theme V2 group class mapping
  - swatch mapping
  - badge mapping
- Owns progress/readiness metadata for the Progress view.
- Owns grouped path definitions for the Build Path view.
- Creates the rendered Toolbox cards using DOM APIs.
- Creates accordion groups for Group, Progress and Build Path views.
- Renders the default `ascending` view on load.
- Toggles `aria-pressed` state on the selected view control.
- Toggles Order between A-Z and Z-A.
- Re-renders the Toolbox surface when Order, Group, Progress, or Build Path is selected.

## Decision
KEEP `toolbox/tools-page-accordions.js` unchanged.

## Evidence
- `toolbox/index.html` does not contain static tool cards.
- The only Toolbox render host in `toolbox/index.html` is empty before JavaScript runs.
- Removing `tools-page-accordions.js` would leave the current Toolbox page with controls but no rendered tool cards, group accordions, Progress view, or Build Path view.
- Current rendering still depends on `tools-page-accordions.js` for the active Toolbox surface.

## Deletion Safety
Deletion is not safe in this PR.

Reason:
- Current Toolbox rendering has not been moved into another approved active source.
- No replacement architecture was requested or added.
- The existing script remains the current runtime owner for the Toolbox index view modes.

## Validation
- PASS: `npm run test:workspace-v2`
- PASS: `node --check toolbox/tools-page-accordions.js`
- PASS: Browser validation for `toolbox/index.html`:
  - rendered 16 Toolbox cards
  - no console errors
  - no failed requests
  - `Order A-Z`, `Group`, `Progress`, and `Build Path` controls visible
  - no `Arcade` text inside the Toolbox `main` content
- PASS: `git diff --check`

## Notes
- A broad whole-page text search still finds `Arcade` in the shared global header Games navigation.
- That link is outside the Toolbox `main` surface and was not changed because this PR is scoped to Toolbox runtime ownership.
