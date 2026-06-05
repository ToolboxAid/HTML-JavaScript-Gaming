# Group Color Propagation

PR bundle:
- PR_26155_094-group-color-propagation

## Files Updated

- `toolbox/toolRegistry.js`
- `toolbox/tools-page-accordions.js`
- `assets/theme-v2/css/colors.css`
- `admin/tools-progress.html`
- `admin/tools-progress.js`
- `admin/grouping-colors.html`
- `admin/controls.html`
- `admin/design-system.html`
- `tests/playwright/tools/RootToolsFutureState.spec.mjs`
- `tests/playwright/tools/ToolsProgressHydration.spec.mjs`

## Propagation Details

Toolbox Group view:
- Now groups visible tool tiles into AI, Audio, Build/Create, Design, Marketplace, Platform, and Play.
- Group view remains alphabetically ordered as a browseable list.
- Build Path remains intentionally workflow ordered.

Toolbox cards/tile outlines:
- Cards receive the restored semantic group class from the active Toolbox renderer.
- Representative classes:
  - `tool-group-ai`
  - `tool-group-audio`
  - `tool-group-build-create`
  - `tool-group-design`
  - `tool-group-marketplace`
  - `tool-group-platform`
  - `tool-group-play`

Admin Tools Progress:
- Rows hydrate from `toolbox/toolRegistry.js`.
- Rows include `data-tools-progress-group` and `data-tools-progress-color-group`.
- Rows use the registry color group class for visible group-color treatment.

Shared registry/metadata:
- `category` now stores the restored semantic group.
- `colorGroup` now stores the matching Theme V2 class.

Admin references:
- `admin/grouping-colors.html` now documents the restored model.
- `admin/controls.html` preview selector now offers the restored group choices.
- `admin/design-system.html` text was cleaned where it carried obsolete user-facing vocabulary.

## Explicit Non-Changes

- No Arcade entry was added to Toolbox.
- No duplicate Admin group was added under Toolbox.
- No real DB/auth/cloud/persistence was added.
- Project -> Build Path remains separate from Admin -> Tools Progress.

## Manual Test Notes

1. Open `toolbox/index.html?role=admin`.
2. Click `Group`.
3. Confirm groups render as `AI`, `Audio`, `Build/Create`, `Design`, `Marketplace`, `Platform`, `Play`.
4. Confirm representative tiles show visible colored outlines.
5. Open `admin/tools-progress.html`.
6. Confirm group swatches and row outlines match the same restored model.

## Validation

- PASS `npm run test:lane:tools-progress`
- PASS `npm run test:lane:build-path`
- PASS `npm run test:workspace-v2`
- PASS `node --check toolbox/tools-page-accordions.js`
- PASS `node --check admin/tools-progress.js`
- PASS `node --check scripts/run-targeted-test-lanes.mjs`
- PASS `node --check tests/playwright/tools/ToolsProgressHydration.spec.mjs`
- PASS `node --check tests/playwright/tools/BuildPathProgressSimplification.spec.mjs`
- PASS `git diff --check`
