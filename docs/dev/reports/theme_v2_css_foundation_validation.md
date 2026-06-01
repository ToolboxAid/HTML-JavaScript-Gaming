# Theme V2 CSS Foundation Validation

PR: `PR_26152_028-theme-v2-css-foundation`

## Scope

- Strengthened reusable CSS foundation files under `GameFoundryStudio/assets/css/theme/v2/`.
- Consolidated established reusable patterns from deprecated GameFoundryStudio CSS into approved v2 ownership files.
- Did not migrate page imports.
- Did not change Admin, Account, Tools, Games, or Samples HTML imports.
- Did not add CSS outside `GameFoundryStudio/assets/css/theme/v2/`.

## Consolidated Pattern Areas

- accordions: accordion stacks, horizontal accordion toggles, tool display-mode summary controls.
- buttons: button states, inline row helpers, return-to-top meaning color support.
- panels/cards: tool cards, tool columns, tool center panels, tool display-mode panels.
- forms: field stacks, form rows, control fieldsets.
- status: status/log panels, pill labels, role labels, tool group labels and swatches.
- tables: `.table` class baseline and header treatment.
- dialogs: dialog baseline, backdrop, and dialog sample panel.
- layout: tool workspace grids, tool grids, tool focus-mode layout, responsive overrides.
- spacing/colors: supporting size, grid, meaning color, brand utility, side accent, and tool group tokens/classes.

## Playwright Impact

Playwright impacted: Yes.

This PR changes CSS rendering foundations used by GameFoundryStudio theme-v2 pages. Validation used a targeted GameFoundryStudio static-server Playwright check, not repo-wide tests, because the BUILD explicitly limits validation to GameFoundryStudio scope.

## Validation Commands

1. Targeted Playwright static-server validation for `/index.html` and `/GameFoundryStudio/index.html`.
2. Theme-v2 import validation through browser network responses for:
   `theme.css`, `colors.css`, `spacing.css`, `typography.css`, `layout.css`, `buttons.css`, `forms.css`, `controls.css`, `panels.css`, `accordion.css`, `status.css`, `tables.css`, `dialogs.css`.
3. Non-theme-v2 change guard:
   `git diff --name-only -- GameFoundryStudio | rg -v "^GameFoundryStudio/assets/css/theme/v2/"`
4. CSS-outside-theme-v2 guard:
   `git diff --name-only -- GameFoundryStudio | rg --pcre2 "^GameFoundryStudio/assets/css/(?!theme/v2/)"`
5. Page import migration guard:
   `git diff --name-only -- GameFoundryStudio | rg "\\.html$"`
6. Targeted whitespace check:
   `git diff --check -- GameFoundryStudio\\assets\\css\\theme\\v2`
7. Token-discipline scan for changed non-token/non-color v2 CSS surfaces:
   `rg -n --pcre2 "\\b\\d+(?:\\.\\d+)?px\\b|#[0-9a-fA-F]{3,8}\\b" GameFoundryStudio\\assets\\css\\theme\\v2\\accordion.css GameFoundryStudio\\assets\\css\\theme\\v2\\buttons.css GameFoundryStudio\\assets\\css\\theme\\v2\\controls.css GameFoundryStudio\\assets\\css\\theme\\v2\\dialogs.css GameFoundryStudio\\assets\\css\\theme\\v2\\forms.css GameFoundryStudio\\assets\\css\\theme\\v2\\layout.css GameFoundryStudio\\assets\\css\\theme\\v2\\panels.css GameFoundryStudio\\assets\\css\\theme\\v2\\status.css GameFoundryStudio\\assets\\css\\theme\\v2\\tables.css`

## Results

- PASS: root `/index.html` renders the GameFoundryStudio Home.
- PASS: `/GameFoundryStudio/index.html` renders the GameFoundryStudio Home.
- PASS: `theme/v2/theme.css` and all approved import files returned 200.
- PASS: header/footer partials and Home images resolve with no console or network errors.
- PASS: changed GameFoundryStudio files are limited to `GameFoundryStudio/assets/css/theme/v2/`.
- PASS: no CSS outside `GameFoundryStudio/assets/css/theme/v2/` was changed.
- PASS: no HTML files changed, so no Admin, Account, Tools, Games, or Samples imports were migrated.
- PASS: token-discipline scan found no hardcoded px or hex values in changed non-token/non-color component CSS; media breakpoints are unchanged existing CSS structure.
- PASS: `git diff --check` completed with no whitespace errors.
- WARN: Git reported repository line-ending notices: `LF will be replaced by CRLF the next time Git touches it`.

## Lanes

- lanes executed: runtime/static page validation for GameFoundryStudio Home and theme-v2 CSS import loading.
- lanes skipped: engine, samples, tools runtime workflows, Admin runtime workflow validation, Account, Games, and repo-wide integration because this PR only changes theme-v2 CSS foundation files.
- samples decision: SKIP because Samples are explicitly out of scope and full samples smoke testing is forbidden by this BUILD.
- blocker scope: GameFoundryStudio theme-v2 CSS foundation only.

## Manual Validation

1. Start a local static server from the repo root.
2. Open `/index.html`.
3. Confirm GameFoundryStudio Home renders with header, footer, hero content, and images.
4. Open `/GameFoundryStudio/index.html`.
5. Confirm the same Home page renders and no browser console errors appear.
6. Confirm no Admin, Account, Tools, Games, or Samples page imports changed in this PR.
