# PLAN PR_26175_ALFA_047-theme-v2-svg-icon-registry

Source of truth: user request `PLAN_PR PR_26175_ALFA_047-theme-v2-svg-icon-registry`.

## Purpose
Create a shared Theme V2 SVG icon registry so toolbox and platform UI can render small semantic icons from one approved source instead of page-local SVG, ad hoc CSS drawings, or Font Awesome glyphs.

## Scope
Primary target files:
- `assets/theme-v2/js/theme-icons.js`
- `assets/theme-v2/css/icons.css`
- `assets/theme-v2/css/theme.css`
- `tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs`
- `docs_build/dev/reports/PR_26175_ALFA_047-theme-v2-svg-icon-registry_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_047-theme-v2-svg-icon-registry_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_047-theme-v2-svg-icon-registry_requirements-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

Allowed nearby reads:
- `assets/theme-v2/css/buttons.css`
- `assets/theme-v2/css/status.css`
- `assets/theme-v2/css/accordion.css`
- `assets/theme-v2/css/panels.css`
- `assets/theme-v2/css/tables.css`
- `assets/theme-v2/images/gfs-chevron-down.svg`
- `assets/theme-v2/images/gfs-chevron-up.svg`

## Required changes
- Add a small registry module that creates SVG icons through DOM APIs, not `innerHTML`.
- Include the initial icon set needed by the next PRs: `chevron-down`, `chevron-up`, `chevron-left`, `chevron-right`, `check`, `warning`, `error`, `info`, `save`, `edit`, `delete`, `add`, `close`, `expand`, `collapse`, and `external-link`.
- Export a simple API such as `createThemeIcon(name, options)` and `installThemeIcon(target, name, options)`.
- Support decorative icons with `aria-hidden="true"` and labelled icons with a visible or accessible label supplied by callers.
- Add shared `.theme-icon` CSS sizing/alignment classes through Theme V2 only.
- Import `icons.css` from `assets/theme-v2/css/theme.css`.

## Acceptance criteria
- Icon rendering is shared and reusable across Theme V2 pages.
- No inline styles or page-local CSS are introduced.
- No browser-owned product data is used.
- The registry does not inject unsanitized SVG strings into the DOM.
- Missing icon names fail visibly in tests or return an explicit unavailable marker; no silent fallback.
- Existing pages continue to load Theme V2 CSS without extra page includes.

## Validation
Run only:
- `node --check assets/theme-v2/js/theme-icons.js`
- `npx playwright test tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs --workers=1`
- `rg -n "<[s]tyle|[s]tyle=" assets/theme-v2/js/theme-icons.js assets/theme-v2/css/icons.css tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs`

## Non-goals
- No chevron conversion in this PR.
- No status/action icon conversion in this PR.
- No layout utility icon conversion in this PR.
- No Font Awesome removal in this PR.
- No broad visual redesign.
- No engine core changes.
- No `start_of_day` changes.

## Working tree rule
Start from refreshed `main`. If the tree is dirty, stop unless all changes are already scoped to this PLAN/BUILD. Modify only the files listed in this plan during the BUILD phase.
