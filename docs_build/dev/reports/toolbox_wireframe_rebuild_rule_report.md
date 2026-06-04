# PR_26154_053 Toolbox Wireframe Rebuild Rule Report

## Scope
- PR: `PR_26154_053-toolbox-wireframe-rebuild-rule`
- Source of truth read first: `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- Purpose: add the targeted Toolbox rebuild rule and update `toolbox/index.html` as a wireframe-only Toolbox page.

## Changes
- Added `Targeted Toolbox Rebuild Rule` to `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Preserved the existing active Toolbox tool data and `tools-page-accordions.js` page wiring.
- Corrected `toolbox/index.html` so Order, Group, Progress, and Build Path are view controls for the same Toolbox surface.
- Removed the extra Progress Wireframe and Build Path Wireframe accordion/card sections.
- Added Progress as a view mode that reuses the active tool tiles and shows static readiness labels:
  - `complete`
  - `in-progress`
  - `ready`
  - `locked`
- Added Build Path as a view mode that reuses active tool tiles in visual path groups:
  - Plan
  - Create
  - Audio
  - Verify
  - Release
- Kept Arcade out of the Toolbox content.
- Kept forbidden `Studio` wording out of visible dynamic tool labels on `toolbox/index.html`; brand usage remains `Game Foundry Studio`.
- Updated active validation scripts and Playwright coverage for the corrected view-mode contract.

## CSS Decision
- No new CSS was added.
- Existing Theme V2 classes were sufficient for the wireframe:
  - `page-title`
  - `hero-actions`
  - `btn`
  - `accordion-group`
  - `vertical-accordion`
  - `accordion-body`
  - `card-grid`
  - `control-card`
  - `card-body`
  - `kicker`
  - `pill`
- No Theme V2 gap was proven in this PR.

## Validation Notes
- PASS: `node scripts/validate-active-tools-surface.mjs`
- PASS: `node scripts/validate-tool-registry.mjs`
- PASS: Toolbox source validation confirmed Order, Group, Progress, and Build Path controls are present.
- PASS: Toolbox source validation confirmed Progress and Build Path controls are normal view-mode buttons, not disabled controls.
- PASS: Toolbox source validation confirmed Progress and Build Path are not represented as extra tool cards or static wireframe accordions.
- PASS: Toolbox source validation confirmed Progress includes `locked`, `ready`, `in-progress`, and `complete` static readiness labels.
- PASS: Toolbox source validation confirmed Build Path uses the existing Toolbox renderer and active tool tile data.
- PASS: Toolbox source validation confirmed Arcade is absent from `toolbox/index.html`.
- PASS: Toolbox source validation confirmed no forbidden `Studio` labels in dynamic tool cards.
- PASS: Toolbox source validation confirmed no inline script blocks, style blocks, or inline event handlers.
- PASS: `npm run test:workspace-v2`
- PASS: `git diff --check`
- PASS: `node --check` for changed JS/MJS files.

## Playwright
- Playwright impacted: Yes.
- Behavior validated:
  - Toolbox page loads.
  - Order, Group, Progress, and Build Path view controls are visible.
  - Progress and Build Path controls are not disabled.
  - Progress and Build Path are not rendered as standalone tool cards or static wireframe accordions.
  - Progress view renders active tool tiles with `locked`, `ready`, `in-progress`, and `complete` labels.
  - Build Path view renders active tool tiles under visual path groups.
  - Current active tool cards still link to active toolbox pages.
  - Arcade is absent from the Toolbox main content.
  - Visible dynamic tool card labels do not use forbidden `Studio` wording.
  - Old/deprecated toolbox routes are absent.
  - Tool template still loads from root Theme V2 paths.
- Expected pass behavior: all workspace-contract Playwright checks pass.
- Expected fail behavior: missing view controls, Progress/Build Path represented as standalone cards/accordions, missing readiness labels, missing Build Path groups, Arcade in Toolbox content, forbidden `Studio` labels, old routes, page errors, or failed requests fail the lane.

## Manual Test Notes
- Open `/toolbox/index.html`.
- Confirm Order, Group, Progress, and Build Path render as view controls for the same Toolbox list area.
- Click Order and confirm active tool tiles render in ordered view.
- Click Group and confirm active tool tiles render grouped by Toolbox category.
- Click Progress and confirm the same active tool tiles render with static `locked`, `ready`, `in-progress`, and `complete` readiness labels.
- Click Build Path and confirm active tool tiles render under visual path groups.
- Confirm there is no separate Progress Wireframe or Build Path Wireframe accordion/card content.
- Confirm Arcade does not appear in the Toolbox content.
- Confirm visible dynamic tool labels do not include `Studio`, except the site brand `Game Foundry Studio`.
- Confirm the page uses the shared header/footer and existing Theme V2 styling.
- Confirm no new CSS-backed visual pattern or tool implementation behavior is introduced.
