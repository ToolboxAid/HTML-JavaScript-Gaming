# PR_26154_029 Theme V2 Root Rename

Baseline used: `PR_26154_026-028-template-theme-legacy-closeout`.

## Baseline Convergence

The pre-rename convergence audit was clean enough to proceed:

| Surface | Total | Matching | Mismatches |
| --- | ---: | ---: | ---: |
| Public/root pages | 43 | 43 | 0 |
| Active toolbox pages | 20 | 20 | 0 |

## Rename

Moved:

- `assets/theme/v2/`

To:

- `assets/theme-v2/`

The old `assets/theme/v2/` folder was not recreated.

## Active Reference Updates

Updated active references from `assets/theme/v2` to `assets/theme-v2` across:

- public/root HTML pages
- active toolbox HTML pages
- `dev/templates/page-template-v2.html`
- `dev/templates/tool-template-v2.html`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `assets/theme-v2/js/tool-display-mode.js`
- `assets/theme-v2/partials/header-nav.html`
- `toolbox/tools-page-accordions.js`
- `toolbox/dev/checkStyleSystemGuard.mjs`
- active tests that validate Theme V2 path wiring

## Docs And Governance Updates

Updated Theme V2 docs/governance references in:

- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/account/design-system.html`
- `docs_build/dev/css-audit.md`
- `docs_build/dev/security-audit.md`
- `docs_build/security/js-injection-policy.md`

Historical reports under `docs_build/dev/reports/` were not bulk-rewritten. They remain historical evidence for the PR where they were generated.

## CSS Path Adjustments

Updated Theme V2 internal CSS image URLs after the root move:

- `assets/theme-v2/css/colors.css`: `../images/forge-bot-single.png`
- `assets/theme-v2/css/gamefoundrystudio.css`: `../images/forge-bot-single.png`

All checked Theme V2 CSS `@import` and `url(...)` targets resolve under the new root.

## Active Reference Results

- PASS: `assets/theme-v2/` exists.
- PASS: `assets/theme/v2/` does not exist.
- PASS: zero active references remain to `assets/theme/v2`.
- PASS: active references resolve to `assets/theme-v2`.
- PASS: `assets/theme-v2/css/theme.css` remains the active Theme V2 CSS entry.
- PASS: Font Awesome remains wired through `assets/theme-v2/css/theme.css`.

## Stale Reference Isolation

Remaining `assets/theme/v2` references are intentionally isolated to:

- historical reports under `docs_build/dev/reports/`
- deprecated archive/v1-v2/tools pages:
  - `archive/v1-v2/tools/old_localization-studio/index.html`
  - `archive/v1-v2/tools/localization_pre_template_rebuild/index.html`

Those deprecated folders were not modified per PR scope.

## Validation

Required validation for this PR:

- targeted reference checks for `assets/theme/v2` and `assets/theme-v2`
- static validation for changed HTML, JS, CSS, JSON, and Markdown files
- template consistency audit after rename
- `npm run test:workspace-v2`
- `git diff --check`

Full samples smoke test skipped by request. Tests against `archive/v1-v2/tools/`, `archive/v1-v2/games/`, and `archive/v1-v2/samples/` skipped by request.
