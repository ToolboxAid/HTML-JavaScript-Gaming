# PR_26151_009-gamefoundry-breadcrumb-control-cleanup Validation

## Scope

- Scope limited to `GameFoundryStudio` implementation files plus required `docs/dev` reports.
- No new CSS files were created in this PR.
- No CSS was moved between files.
- Existing colors, meaning-color files/classes, shared header/nav/footer/tool-shell structure, Account submenu, grouping pages, Tool Display Mode placement, and horizontal/vertical accordion behavior were preserved.

## Changes

- Removed breadcrumb markup from all audited `GameFoundryStudio` page-title sections.
- Removed the stale `.breadcrumb` CSS rule from `GameFoundryStudio/assets/css/gamefoundrystudio.css`.
- Removed duplicate bare native-control formatting from `GameFoundryStudio/assets/css/gamefoundrystudio.css`:
  - `button`
  - `button:disabled`
  - `input`
  - `select`
  - `textarea`
  - `label`
  - `progress`
  - `meter`
- Preserved custom class-based GameFoundry pattern styling, including `.btn`, `.tool-column`, `.tool-center-panel`, `.tool-display-mode`, `.horizontal-accordion-toggle`, and `details.vertical-accordion`.

## Validation

Passed:

- `rg -n 'breadcrumb|class="breadcrumb"' GameFoundryStudio -g '*.html' -g '*.css'`
  - Result: no matches.
- `rg --pcre2 -n '<style\b|<script(?![^>]*\bsrc=)|\son[a-zA-Z]+\s*=|\sstyle\s*=' GameFoundryStudio -g '*.html'`
  - Result: no matches.
- `rg -n '^(button|input|textarea|select|label|progress|meter)([,{:#\[]|$)|button:disabled|input,|\.breadcrumb' GameFoundryStudio/assets/css/base.css GameFoundryStudio/assets/css/gamefoundrystudio.css GameFoundryStudio/assets/css/pages.css GameFoundryStudio/assets/css/tools.css`
  - Result: no matches.
- `node --check GameFoundryStudio/assets/js/tool-display-mode.js`
- `node --check GameFoundryStudio/assets/js/gamefoundry-partials.js`
- `npm run test:playwright:static`
- `rg -l 'class="tool-display-mode"|data-tool-display-mode' GameFoundryStudio/tools -g '*.html'`
  - Result: Tool Display Mode slots remain present across tool pages.
- `rg -n 'tool-display-mode|tool-workspace|tool-center-panel' GameFoundryStudio/tools -g '*.html'`
  - Result: Tool Display Mode remains before center workspace content on tool pages.
- `rg -n 'horizontal-accordion|tool-column-header|vertical-accordion|<details class="vertical-accordion"' GameFoundryStudio/tools GameFoundryStudio/assets/js/tool-display-mode.js GameFoundryStudio/assets/css/gamefoundrystudio.css`
  - Result: horizontal and vertical accordion hooks remain present.
- `rg -n 'GameFoundry|Game Foundry|GameFoundryStudio' tests scripts package.json`
  - Result: no existing GameFoundryStudio-specific Playwright/browser coverage found.

Blocked or not run:

- Targeted Node/PowerShell navigation resolution script attempts were intermittently blocked by the sandbox with `windows sandbox: spawn setup refresh`.
- Delta ZIP packaging attempts with `Compress-Archive` and `tar -a` were blocked by sandbox spawn/policy failures before archive creation could be verified.
- Full samples smoke test was not run per instruction.

## Notes

- Native HTML control sizing/formatting remains owned by `GameFoundryStudio/assets/css/controls.css`.
- Non-controls CSS retains custom GameFoundry patterns and contextual color semantics only.
- Breadcrumb removal did not add or change `href`/`src` targets.
