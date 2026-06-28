# PLAN PR_26175_ALFA_049-theme-v2-status-action-icons

Source of truth: user request `PLAN_PR PR_26175_ALFA_049-theme-v2-status-action-icons`.

## Purpose
Apply the shared Theme V2 SVG icon registry to status and action affordances so save, warning, error, validation, info, add, edit, delete, close, and external-link actions use consistent icon primitives instead of text-only or ad hoc glyphs.

## Dependencies
- Depends on `PR_26175_ALFA_047-theme-v2-svg-icon-registry` being merged into `main`.
- Should follow `PR_26175_ALFA_048-theme-v2-chevron-conversion` if shared icon CSS changes there affect `.theme-icon`.

## Scope
Primary target files:
- `assets/theme-v2/js/theme-icons.js`
- `assets/theme-v2/css/icons.css`
- `assets/theme-v2/css/buttons.css`
- `assets/theme-v2/css/status.css`
- `assets/theme-v2/js/toolbox-status-bar.js`
- `tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs`
- `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs`
- `docs_build/dev/reports/PR_26175_ALFA_049-theme-v2-status-action-icons_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_049-theme-v2-status-action-icons_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_049-theme-v2-status-action-icons_requirements-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

Allowed nearby reads:
- `assets/theme-v2/css/forms.css`
- `assets/theme-v2/css/controls.css`
- `toolbox/assets/index.html`
- `toolbox/game-hub/index.html`
- `toolbox/game-design/index.html`

## Required changes
- Add shared icon button and status icon CSS classes in `icons.css`, `buttons.css`, and `status.css`.
- Add helper usage in `toolbox-status-bar.js` only where icons are part of status semantics and do not reintroduce removed visible labels from ALFA_009.
- Keep status bar left/center/right text behavior intact.
- Preserve creator-facing language; icons supplement actions/status, they do not replace required accessible names.
- Ensure action icons have labels through `aria-label`, visible text, or paired text according to button context.

## Acceptance criteria
- Status icon usage is consistent for save, warning, error, validation, and info states.
- Action icon usage is consistent for add, edit, delete, close, save, and external-link controls covered by the targeted files.
- Existing status bar behavior from ALFA_009 and ALFA_011 is preserved.
- No large banners or modal-style messages are introduced.
- No row highlights are introduced.
- No inline styles, style blocks, or page-local CSS are introduced.

## Validation
Run only:
- `node --check assets/theme-v2/js/theme-icons.js`
- `node --check assets/theme-v2/js/toolbox-status-bar.js`
- `npx playwright test tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs --workers=1`
- `npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --workers=1`
- `rg -n "<[s]tyle|[s]tyle=" assets/theme-v2/js/theme-icons.js assets/theme-v2/js/toolbox-status-bar.js assets/theme-v2/css/icons.css assets/theme-v2/css/buttons.css assets/theme-v2/css/status.css tests/playwright/tools/ThemeV2SvgIconRegistry.spec.mjs tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs`

## Non-goals
- No chevron conversion.
- No layout utility icon conversion.
- No page-wide action refactor.
- No Font Awesome removal outside the scoped status/action surfaces.
- No API/service/repository changes.
- No engine core changes.
- No `start_of_day` changes.

## Working tree rule
Start from refreshed `main` after required dependencies. If the tree is dirty, stop unless all changes are already scoped to this PLAN/BUILD.
