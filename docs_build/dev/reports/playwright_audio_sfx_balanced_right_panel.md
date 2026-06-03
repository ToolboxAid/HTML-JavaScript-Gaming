# Audio / SFX Playground V2 Balanced Right Panel Validation

PR: `PR_26144_007-audio-sfx-balanced-right-panel-layout`

## Scope

- Updated only `tools/audio-sfx-playground-v2` plus required reports.
- Removed visible Wave Preview metadata text:
  - sound name
  - waveform/frequency/duration/sweep summary
  - preview tags
- Kept Wave Preview visual-only by rendering only the meter bars for valid sounds.
- Replaced the initial preview fallback text with an empty visual preview shell.
- Updated right-column accordion flex behavior so Wave Preview, Output Summary, and Status share height evenly.
- Prevented the preview accordion from keeping the prior fixed-height bias.
- Did not modify `start_of_day` folders.

## Static Validation

PASS:

- HTML/CSS/static preview validation:
  - no `<style>` blocks
  - no inline event handlers
  - no script tags without `src`
  - linked stylesheets resolve
  - CSS braces are balanced
  - preview renderer no longer emits metadata text
  - HTML preview fallback no longer contains visible fallback text
- Audio / SFX Playground V2 JavaScript syntax check:
  - `node --check` over `tools/audio-sfx-playground-v2/js/**/*.js`
- Changed runtime module import check:
  - `SfxPreviewControl.js`
- Whitespace validation:
  - `git diff --check -- tools/audio-sfx-playground-v2`
- JSON validation:
  - No JSON files changed in this PR.

## Playwright Impact

Playwright impacted: Yes.

Expected validation:

- Workspace V2 launches Audio / SFX Playground V2 with no console errors.
- Wave Preview shows only the visual meter bars for a valid sound.
- Wave Preview does not show sound name text.
- Wave Preview does not show waveform/frequency/duration/sweep summary text.
- Right-column panels for Wave Preview, Output Summary, and Status share available vertical space evenly/flexibly.
- No right-column panel consumes most of the column height.
- No clipping or overflow regression appears in the right column.

Local command results:

- `npm run test:workspace-v2`
  - FAIL: PowerShell blocked `npm.ps1` because script execution is disabled on this system.
- `npm.cmd run test:workspace-v2`
  - FAIL: package script started, but `playwright` is not installed or not available on PATH.

Because Playwright is unavailable in this local environment, browser launch validation and V8 coverage could not be completed here.

## Coverage

WARN: Runtime JavaScript changed, but Playwright V8 coverage could not be generated because the local Playwright command is unavailable.

- `(WARN) tools/audio-sfx-playground-v2/js/controls/SfxPreviewControl.js - Playwright unavailable`

## Full Samples Smoke Test

Skipped. This PR only adjusts Audio / SFX Playground V2 layout behavior.
