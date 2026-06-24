# PLAN PR_26175_ALFA_050-theme-v2-layout-utility-icons

Source of truth: user request `PLAN_PR PR_26175_ALFA_050-theme-v2-layout-utility-icons`.

## Purpose
Apply the shared Theme V2 SVG icon registry to layout utility controls such as fullscreen/tool display mode, return-to-top, column collapse/expand, and navigation controls.

## Dependencies
- Depends on `PR_26175_ALFA_047-theme-v2-svg-icon-registry` being merged into `main`.
- Should follow `PR_26175_ALFA_048-theme-v2-chevron-conversion` to avoid overlapping chevron work.
- Should follow `PR_26175_ALFA_049-theme-v2-status-action-icons` if shared icon button classes are introduced there.

## Scope
Primary target files:
- `assets/theme-v2/js/theme-icons.js`
- `assets/theme-v2/css/icons.css`
- `assets/theme-v2/css/layout.css`
- `assets/theme-v2/css/buttons.css`
- `assets/theme-v2/css/panels.css`
- `assets/theme-v2/js/tool-display-mode.js`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs`
- `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs`
- `tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `docs_build/dev/reports/PR_26175_ALFA_050-theme-v2-layout-utility-icons_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_050-theme-v2-layout-utility-icons_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_050-theme-v2-layout-utility-icons_requirements-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

Allowed nearby reads:
- `assets/theme-v2/css/accordion.css`
- `assets/theme-v2/css/site-controls.css`
- `toolbox/_tool_template-v2/index.html`
- representative toolbox pages that use `data-tool-display-mode`.

## Required changes
- Use shared icons for fullscreen enter/exit, previous/next navigation, column collapse/expand, and return-to-top controls.
- Keep utility controls visually compact and stable in normal and fullscreen/tool display mode.
- Preserve all existing accessible names and keyboard behavior.
- Preserve fullscreen bottom status bar anchoring and tool content bottom reserve.
- Avoid page-local utility icon markup when a shared Theme V2 partial/helper can own it.

## Acceptance criteria
- Layout utility controls render shared SVG icons from the registry.
- No utility control loses its accessible name, role, or keyboard behavior.
- Fullscreen/tool display mode remains stable across desktop and mobile viewports.
- Tool content does not scroll under the status bar.
- No inline styles, style blocks, or page-local CSS are introduced.
- No unrelated page or tool redesign occurs.

## Validation
Run only:
- `node --check assets/theme-v2/js/theme-icons.js`
- `node --check assets/theme-v2/js/tool-display-mode.js`
- `node --check assets/theme-v2/js/gamefoundry-partials.js`
- `npx playwright test tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs --workers=1`
- `npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --workers=1`
- `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --workers=1`
- `rg -n "<[s]tyle|[s]tyle=" assets/theme-v2/js/theme-icons.js assets/theme-v2/js/tool-display-mode.js assets/theme-v2/js/gamefoundry-partials.js assets/theme-v2/css/icons.css assets/theme-v2/css/layout.css assets/theme-v2/css/buttons.css assets/theme-v2/css/panels.css tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs tests/playwright/tools/ToolboxRoutePages.spec.mjs`

## Non-goals
- No chevron conversion already owned by ALFA_048.
- No status/action icon conversion already owned by ALFA_049.
- No broad layout refactor.
- No landing page or visual redesign.
- No API/service/repository changes.
- No engine core changes.
- No `start_of_day` changes.

## Working tree rule
Start from refreshed `main` after required dependencies. If the tree is dirty, stop unless all changes are already scoped to this PLAN/BUILD.
