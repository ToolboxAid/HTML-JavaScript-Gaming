# PR_26154_024 Localization Template Rebuild Report

## Scope

Rebuilt only `toolbox/localization/` from the first-class tool template source at `toolbox/_tool_template-v2/`.

No other active toolbox page was modified.

## Backup

Before deleting the active Localization folder, the current implementation was copied to:

- `archive/v1-v2/tools/localization_pre_template_rebuild/`

The preserved backup contains:

- `archive/v1-v2/tools/localization_pre_template_rebuild/index.html`
- `archive/v1-v2/tools/localization_pre_template_rebuild/css/localization-studio.css`
- `archive/v1-v2/tools/localization_pre_template_rebuild/js/localization-studio.js`

## Active Rebuild

Deleted the prior active folder:

- `toolbox/localization/`

Rebuilt it by copying:

- from `toolbox/_tool_template-v2/`
- to `toolbox/localization/`

The rebuilt active folder contains only:

- `toolbox/localization/index.html`

No active `toolbox/localization/css/` or `toolbox/localization/js/` folder remains.

## Template Adaptations

Only minimal Localization identity values were changed in the copied template:

- Page `<title>` changed to `Localization - Game Foundry Studio`.
- Meta description changed to Localization planning/template copy.
- Template kicker changed to `Toolbox / Localization`.
- Main heading changed to `Localization`.
- Lede changed to describe translation, language coverage, contributor review, and future localization workflows.
- Left panel heading changed to `Localization`.
- Template setup/output body labels changed from generic tool copy to Localization copy.
- ToolDisplayMode host slug and shared badge/character metadata changed to `localization-studio` so the shared display-mode script does not resolve the page as `index`.

## What Was Not Reintroduced

- No old Localization implementation JavaScript was copied back into active `toolbox/localization/`.
- No old Localization implementation CSS was copied back into active `toolbox/localization/`.
- No active local `css/` folder was created.
- No active local `js/` folder was created.
- No tool-specific CSS was added.
- No tool-specific JavaScript was added.

## Link And Registration Check

Existing active toolbox link remains valid:

- `toolbox/tools-page-accordions.js` links to `../toolbox/localization/index.html`.

Existing Playwright launch expectation remains aligned:

- `tests/playwright/tools/RootToolsFutureState.spec.mjs` expects `../toolbox/localization/index.html`.

No active toolbox registration or launch path was changed.

## Validation

- PASS: required files exist under `toolbox/localization/`, `archive/v1-v2/tools/localization_pre_template_rebuild/`, and `toolbox/_tool_template-v2/`.
- PASS: active `toolbox/localization/` has no local `css/` or `js/` folders.
- PASS: active Localization page contains the expected template wiring, shared CSS, shared partial loader, ToolDisplayMode script, and `localization-studio` display-mode slug.
- PASS: active Localization page has no references to `css/localization-studio.css`, `js/localization-studio.js`, `localization-workspace`, or `localization-status-grid`.
- PASS: active Localization link remains present in `toolbox/tools-page-accordions.js`.
- PASS: static path and encoding validation for the rebuilt active HTML.
- PASS: static path and encoding validation for the preserved archive/v1-v2/tools backup HTML/CSS.
- PASS: `node --check archive/v1-v2/tools/localization_pre_template_rebuild/js/localization-studio.js`.
- PASS: `git diff --check`.
- SKIPPED: `npm run test:workspace-v2` because active toolbox registration and launch behavior were not changed.
- SKIPPED: tests against `archive/v1-v2/tools/`, `archive/v1-v2/games/`, and `archive/v1-v2/samples` per request.
- SKIPPED: full samples smoke test per request.
