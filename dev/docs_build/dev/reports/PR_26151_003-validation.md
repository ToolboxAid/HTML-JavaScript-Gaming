# PR_26151_003-accordion-header-layout-correction Validation

## Scope

- Scope was limited to affected accordion header layout CSS and required reports.
- No HTML was changed.
- No JavaScript behavior was changed.
- No inline CSS, inline JavaScript, or inline event handlers were added.

## Changes

- Updated open side-panel header layout:
  - `<info>` on the left
  - `[accordion button]` on the right
- Updated closed side-panel header layout:
  - first row: `[accordion button]`
  - second row: `<info>`
- Applied through shared side-panel selectors so left and right panels use the same layout rules.

## Validation Performed

Passed:

- `node --check GameFoundryStudio/assets/js/tool-display-mode.js`
- `rg -n "tool-column-header|horizontal-accordion-toggle|flex-direction|order:|writing-mode|align-items|justify-content" GameFoundryStudio/assets/css/gamefoundrystudio.css GameFoundryStudio/assets/js/tool-display-mode.js`

Confirmed layout rules:

- Open state:
  - `.tool-column-header` uses `flex-direction: row`
  - `.tool-column-header h2, h3` uses `order: 1`
  - `.tool-column-header .horizontal-accordion-toggle` uses `order: 2`
- Closed state:
  - `.tool-column.is-collapsed .tool-column-header` uses `flex-direction: column`
  - `.tool-column.is-collapsed .horizontal-accordion-toggle` uses `order: 1`
  - `.tool-column.is-collapsed .tool-column-header h2, h3` uses `order: 2`
  - collapsed headers use `writing-mode: horizontal-tb`

Blocked:

- `npm run test:workspace-v2`
  - Blocked by `windows sandbox: spawn setup refresh`.
- `git diff`
  - Blocked by `windows sandbox: spawn setup refresh`.

## Manual UI Validation

- Open a tool page with left and right side columns.
- Confirm both open side-panel headers render title/info on the left and the accordion button on the right.
- Collapse the left panel.
- Confirm the left header renders the accordion button on the first row and title/info on the second row.
- Reopen the left panel and confirm the single-row layout returns.
- Repeat for the right panel and confirm identical behavior.

## Playwright

Playwright impacted: Yes. This PR changes shared side-panel header UI layout.

- `npm run test:workspace-v2` was attempted because the affected behavior is tool UI behavior.
- The command was blocked by `windows sandbox: spawn setup refresh`.
