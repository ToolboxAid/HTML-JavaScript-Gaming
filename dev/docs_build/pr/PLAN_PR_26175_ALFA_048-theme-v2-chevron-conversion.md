# PLAN PR_26175_ALFA_048-theme-v2-chevron-conversion

Source of truth: user request `PLAN_PR PR_26175_ALFA_048-theme-v2-chevron-conversion`.

## Purpose
Convert Theme V2 chevrons to the shared SVG icon registry created by ALFA_047, replacing ad hoc CSS gradients, clip-path arrows, and masked chevron image usage where the UI is already using chevrons.

## Dependencies
- Depends on `PR_26175_ALFA_047-theme-v2-svg-icon-registry` being merged into `main`.

## Scope
Primary target files:
- `assets/theme-v2/css/accordion.css`
- `assets/theme-v2/css/panels.css`
- `assets/theme-v2/css/tables.css`
- `assets/theme-v2/js/theme-icons.js`
- `assets/theme-v2/js/tool-display-mode.js`
- `tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs`
- `tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs`
- `docs_build/dev/reports/PR_26175_ALFA_048-theme-v2-chevron-conversion_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_048-theme-v2-chevron-conversion_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_048-theme-v2-chevron-conversion_requirements-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

Allowed nearby reads:
- `assets/theme-v2/images/gfs-chevron-down.svg`
- `assets/theme-v2/images/gfs-chevron-up.svg`
- `toolbox/idea-board/index.html`
- `assets/toolbox/idea-board/js/index.js`

## Required changes
- Replace Theme V2 chevron CSS drawings in `accordion.css` and `panels.css` with registry-backed icon placement.
- Replace Idea Board chevron mask-image classes in `tables.css` with shared icon classes or registry-rendered icon nodes.
- Preserve existing expand/collapse behavior, `aria-expanded`, and accessible names.
- Keep `summary` marker suppression and layout spacing stable.
- Keep chevron icon dimensions stable so toggling open/closed does not shift text or row height.

## Acceptance criteria
- Vertical accordions, horizontal column toggles, tool display mode, and Idea Board row expansion still show the correct chevron direction.
- No `gfs-chevron-up.svg` or `gfs-chevron-down.svg` mask-image usage remains in active Theme V2 CSS after conversion.
- No new inline SVG blocks are embedded in page HTML.
- No inline styles, style blocks, or page-local CSS are introduced.
- Existing keyboard and click behavior remains unchanged.

## Validation
Run only:
- `node --check assets/theme-v2/js/theme-icons.js`
- `node --check assets/theme-v2/js/tool-display-mode.js`
- `node --check assets/toolbox/idea-board/js/index.js`
- `npx playwright test tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs --workers=1`
- `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --workers=1`
- `npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --workers=1`
- `rg -n "gfs-chevron-(up|down)\\.svg|clip-path: polygon|linear-gradient\\(45deg.*currentColor|linear-gradient\\(135deg.*currentColor" assets/theme-v2/css/accordion.css assets/theme-v2/css/panels.css assets/theme-v2/css/tables.css`

## Non-goals
- No status/action icon conversion.
- No layout utility icon conversion outside existing chevron controls.
- No global accordion redesign.
- No removal of legacy SVG asset files unless a later cleanup PR owns it.
- No engine core changes.
- No `start_of_day` changes.

## Working tree rule
Start from refreshed `main` after ALFA_047. If the tree is dirty, stop unless all changes are already scoped to this PLAN/BUILD.
