# PR_26151_002-tool-accordion-counter-and-account-cleanup Validation

## Scope

- Scope was limited to affected GameFoundryStudio tool accordion/header files and required reports.
- No inline CSS, inline JavaScript, or inline event handlers were added.

## Changes

- Applied counter-based accordion labels to real direct tool pages.
- Counter starts at `0` for the first tool.
- Counter increments by `1` after each processed tool page.
- Left and right columns use the same counter value per page.
- Updated horizontal accordion control insertion so the restore `<` / `>` button is inserted before the title.
- Updated collapsed column header alignment so the restore control stays at the top above the title.

## Counter Order

- `0` - AI Assistant
- `1` - Animation Studio
- `2` - Asset Studio
- `3` - Code Studio
- `4` - Game Builder
- `5` - Game Design Studio
- `6` - Input Studio
- `7` - MIDI Studio
- `8` - Object Vector Studio
- `9` - Palette Manager
- `10` - Particle Studio
- `11` - Tool Publisher
- `12` - Sound Studio
- `13` - Storage Inspector
- `14` - World Vector Studio

## Validation Performed

Passed:

- `node --check GameFoundryStudio/assets/js/tool-display-mode.js`
- `node --check GameFoundryStudio/assets/js/gamefoundry-partials.js`
- `rg -n "Toolbox Accordion|Inspector Accordion|toolbox panel|inspector panel" <processed tool pages>`
  - Confirmed paired left/right accordion indices from `0` through `14`.
- `rg -n "insertBefore\\(button, header\\.firstChild\\)|justify-content: flex-start|horizontal-accordion-toggle" GameFoundryStudio/assets/js/tool-display-mode.js GameFoundryStudio/assets/css/gamefoundrystudio.css`
  - Confirmed restore control insertion before title and collapsed top alignment.
- `rg -n "\\{\\}\\s*/\\s*\\{\\}|\\{\\}" GameFoundryStudio/account GameFoundryStudio/assets/js GameFoundryStudio/assets/css -g "*.html" -g "*.js" -g "*.css"`
  - Result: no matches.

Blocked:

- `npm run test:workspace-v2`
  - Blocked by `windows sandbox: spawn setup refresh`.
- `git diff`
  - Blocked by `windows sandbox: spawn setup refresh`.

## Account Cleanup Result

- No Account `{}` / `{}` display content remains in the searched Account/UI files.
- No additional Account-only supporting code was found for that removed display in this pass.

## Manual UI Validation

- Open a processed tool page.
- Confirm left and right vertical accordion labels show the same index for that page.
- Collapse a left or right side column using the horizontal control.
- Confirm the restore `<` / `>` control remains above the vertical column title.
- Reopen the column and confirm the side column restores normally.

## Playwright

Playwright impacted: Yes. This PR changes shared tool UI behavior and accordion/header markup.

- `npm run test:workspace-v2` was attempted because the changed behavior is tool UI behavior.
- The command was blocked by `windows sandbox: spawn setup refresh`.

Full samples smoke test was not run.
