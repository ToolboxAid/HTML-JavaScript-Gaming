# Stack Toolbox Wireframes

Stack:
- `PR_26155_007-project-workspace-wireframe`
- `PR_26155_008-game-design-wireframe`
- `PR_26155_009-game-configuration-wireframe`
- `PR_26155_010-toolbox-build-path-view`
- `PR_26155_011-toolbox-progress-view`
- `PR_26155_012-tool-requirement-overlay-wireframe`

## Scope
- Added active Toolbox wireframes for Project Workspace and Game Configuration.
- Updated the active Game Design wireframe content.
- Updated active Toolbox wiring for the new surfaces.
- Kept `toolbox/tools-page-accordions.js` as the current renderer.
- Did not add database behavior.
- Did not add persistence behavior.
- Did not add real runtime save/load behavior.
- Did not add CSS.
- Did not add Arcade to Toolbox.
- Kept visible tool labels free of forbidden `Studio` wording, except the site brand.

## PR_26155_007 - Project Workspace Wireframe
- Created `toolbox/project-workspace/index.html`.
- Based the page on `dev/templates/tool-template-v2.html`.
- Preserved template-critical structure:
  - shared header and footer partials
  - Theme V2 CSS wiring
  - `tool-workspace`
  - left and right tool columns
  - center panel
  - `data-tool-display-mode`
  - `tool-display-mode.js`
  - accordions
  - status/logging wireframe text
- Added static Build, Play, Share project readiness content.
- Added static missing-requirements card using existing Theme V2 `card`, `callout`, `pill`, and `status` classes.

## PR_26155_008 - Game Design Wireframe
- Updated `toolbox/game-design/index.html`.
- Preserved the tool template shell and shared Theme V2 wiring.
- Reworked only the wireframe content for:
  - purpose
  - rules and systems
  - playable requirements
  - Game Configuration handoff
  - static status/logging text
- Added a static missing-requirements card using existing Theme V2 classes.

## PR_26155_009 - Game Configuration Wireframe
- Created `toolbox/game-configuration/index.html`.
- Based the page on `dev/templates/tool-template-v2.html`.
- Preserved template-critical structure and shared bootstrapping.
- Added wireframe content for:
  - release profile
  - visible creator debug settings
  - public playable debug rejection
  - playable release gate
  - static output/status inspection
- Added a static missing-requirements card using existing Theme V2 classes.

## PR_26155_010 - Toolbox Build Path View
- Updated current Toolbox renderer data in `toolbox/tools-page-accordions.js`.
- Kept `tools-page-accordions.js` in place because it still owns current Toolbox rendering.
- Added Project Workspace and Game Configuration to the current active Toolbox index data.
- Moved Game Design into a Planning grouping for the current view model.
- Updated Build Path `Plan` group to include:
  - Project Workspace
  - AI Assistant
  - Game Design
  - Game Configuration
  - Palette Manager
  - Input

## PR_26155_011 - Toolbox Progress View
- Updated static readiness data in `toolbox/tools-page-accordions.js`.
- Project Workspace is shown as `in-progress`.
- Game Configuration is shown as `locked`.
- Existing Progress labels remain present:
  - `complete`
  - `in-progress`
  - `locked`
  - `ready`

## PR_26155_012 - Tool Requirement Overlay Wireframe
- Added static missing-requirements overlay wireframe cards to:
  - Project Workspace
  - Game Design
  - Game Configuration
- Used existing Theme V2 classes only.
- No true modal behavior, persistence, blocking logic, or runtime validation was added.
- No new CSS was needed.

## Active Wiring
- Updated `assets/theme-v2/partials/header-nav.html` with a Planning submenu.
- Updated `assets/theme-v2/js/gamefoundry-partials.js` route map for:
  - `project-workspace`
  - `game-configuration`
- Updated `toolbox/toolRegistry.js` for:
  - Project Workspace
  - Game Configuration
- Updated `toolbox/tools-page-accordions.js` for current Toolbox index rendering.

## Theme V2 Gap Findings
- No Theme V2 CSS gap was found for this stack.
- Existing `card`, `callout`, `pill`, `status`, `table-wrapper`, accordion, panel, grid, and tool workspace classes covered the requested wireframes.
- No CSS was added or modified.

## Validation Notes
- PASS: `node --check toolbox/tools-page-accordions.js`
- PASS: `node --check toolbox/toolRegistry.js`
- PASS: `node --check assets/theme-v2/js/gamefoundry-partials.js`
- PASS: `node scripts/validate-active-tools-surface.mjs`
- PASS: `node scripts/validate-tool-registry.mjs`
- PASS: no inline style/script/event-handler matches in the three tool wireframes.
- PASS: `npm run test:workspace-v2`
  - This is the legacy command name for the Project Workspace test lane.
- PASS: targeted Playwright page checks for:
  - `toolbox/index.html`
  - `toolbox/project-workspace/index.html`
  - `toolbox/game-design/index.html`
  - `toolbox/game-configuration/index.html`
- PASS: targeted page checks found no console errors and no failed requests.
- PASS: targeted page checks found `Order A-Z`, `Group`, `Progress`, and `Build Path` visible.
- PASS: targeted page checks found Project Workspace, Game Design, and Game Configuration in Group mode.
- PASS: targeted page checks found Project Workspace and Game Configuration in Build Path mode.
- PASS: targeted page checks found Progress readiness labels: `complete`, `in-progress`, `locked`, and `ready`.
- PASS: targeted page checks found no Arcade text inside Toolbox `main` content.
- PASS: targeted page checks found no forbidden visible tool-label `Studio` wording.
- PASS: targeted page checks confirmed template markers on the three tool pages:
  - shared header and footer
  - `#toolDisplayMode`
  - `.tool-workspace`
  - two `.tool-column` panels
  - `.tool-center-panel`
  - `.vertical-accordion`
  - static status/logging marker
  - static missing-requirements card

## Manual Test Notes
- Open `toolbox/index.html`.
- Confirm Order, Group, Progress, and Build Path controls are visible.
- Click Group and confirm the Planning group contains Project Workspace, Game Design, and Game Configuration.
- Click Progress and confirm readiness labels appear on tool tiles.
- Click Build Path and confirm the Plan path includes Project Workspace, Game Design, and Game Configuration.
- Open `toolbox/project-workspace/index.html`.
- Confirm the shared header/footer, ToolDisplayMode, left/center/right panels, accordions, status text, and missing-requirements card are visible.
- Open `toolbox/game-design/index.html`.
- Confirm the shared template structure and missing design requirements card are visible.
- Open `toolbox/game-configuration/index.html`.
- Confirm debug settings are visible for creator testing and public playable debug rejection is stated.

## Notes
- `toolbox/tools-page-accordions.js` remains the current active Toolbox index renderer.
- Deletion of `tools-page-accordions.js` remains unsafe until a registry-driven runtime replaces the current rendering path.
- The global Games navigation still contains Arcade, but Arcade is absent from Toolbox `main` content and active Toolbox tool cards.
