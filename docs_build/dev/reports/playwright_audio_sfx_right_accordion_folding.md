# Audio / SFX Playground V2 Right Accordion Folding Validation

PR: `PR_26144_008-fix-audio-sfx-right-accordion-folding`

## Scope

- Updated only `toolbox/audio-sfx-playground-v2` plus required reports.
- Preserved the shared/template accordion pattern.
- Kept Wave Preview, Output Summary, and Status as accordion sections.
- Changed the Status accordion header from a non-button wrapper to a real accordion header button.
- Moved the Clear button into the Status accordion content so it no longer sits inside the header toggle area.
- Updated the accordion control to bind only direct child header/content elements for each section.
- Restored right-column collapsed accordions to `flex: 0 0 auto` so closed sections release body height.
- Did not modify `start_of_day` folders.

## Static Validation

PASS:

- HTML/CSS accordion validation:
  - no `<style>` blocks
  - no inline event handlers
  - no script tags without `src`
  - linked stylesheets resolve
  - right-column Wave Preview, Output Summary, and Status sections each have a direct accordion header button
  - Clear button is not nested inside the Status accordion header
  - CSS contains the closed right-column flex release rule
  - CSS braces are balanced
- Audio / SFX Playground V2 JavaScript syntax check:
  - `node --check` over `toolbox/audio-sfx-playground-v2/js/**/*.js`
- Changed runtime module import check:
  - `AccordionSection.js`
- Accordion behavior check:
  - `AccordionSection` collapses and expands a section, updates `is-open`, `hidden`, and `aria-expanded`
- Whitespace validation:
  - `git diff --check -- toolbox/audio-sfx-playground-v2`
- JSON validation:
  - No JSON files changed in this PR.

## Playwright Impact

Playwright impacted: Yes.

Expected validation:

- Workspace V2 launches Audio / SFX Playground V2 with no console errors.
- Wave Preview accordion collapses and expands.
- Output Summary accordion collapses and expands.
- Status accordion collapses and expands.
- Clicking a right-column accordion header toggles only that section.
- Collapsed right-column sections release vertical body space.
- Clicking Clear inside the expanded Status body does not toggle the Status accordion.

Local command results:

- `npm run test:workspace-v2`
  - FAIL: PowerShell blocked `npm.ps1` because script execution is disabled on this system.
- `npm.cmd run test:workspace-v2`
  - FAIL: package script started, but `playwright` is not installed or not available on PATH.

Because Playwright is unavailable in this local environment, browser launch validation and V8 coverage could not be completed here.

## Coverage

WARN: Runtime JavaScript changed, but Playwright V8 coverage could not be generated because the local Playwright command is unavailable.

- `(WARN) toolbox/audio-sfx-playground-v2/js/controls/AccordionSection.js - Playwright unavailable`

## Full Samples Smoke Test

Skipped. This PR only impacts Audio / SFX Playground V2 right-column UI behavior.
