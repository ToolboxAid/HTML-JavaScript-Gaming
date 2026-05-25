# Audio / SFX Playground V2 Layout Density Validation

PR: `PR_26144_004-tighten-audio-sfx-control-layout`

## Scope

- Updated only `tools/audio-sfx-playground-v2` plus required reports.
- Added a scoped external stylesheet for Audio / SFX Playground V2 density overrides.
- Kept template-v2 classes and styling patterns in place.
- Marked Frequency, Duration, Attack, Release, Volume, and Sweep controls for compact range layout.
- Kept Sweep value formatting as one text node, for example `875 cents`.
- Did not modify `start_of_day` folders.

## Static Validation

PASS:

- HTML/CSS restriction check:
  - no `<style>` blocks
  - no inline event handlers
  - no script tags without `src`
  - linked stylesheets resolve
  - CSS braces are balanced
- Audio / SFX Playground V2 JavaScript syntax check:
  - `node --check` over `tools/audio-sfx-playground-v2/js/**/*.js`
- Whitespace validation:
  - `git diff --check -- tools/audio-sfx-playground-v2/index.html tools/audio-sfx-playground-v2/styles/audioSfxLayoutDensity.css`

## Playwright Impact

Playwright impacted: Yes.

Expected validation:

- Workspace V2 shows the Audio / SFX Playground V2 tile.
- The tile launches Audio / SFX Playground V2.
- Audio / SFX Playground V2 renders with no console errors on launch.
- Frequency, Duration, Attack, Release, Volume, and Sweep controls render without overlap.
- Sweep value appears inline with its unit label, for example `875 cents`.
- Main controls fit without vertical scrolling on a normal desktop viewport.

Local command results:

- `npm run test:workspace-v2`
  - FAIL: PowerShell blocked `npm.ps1` because script execution is disabled on this system.
- `npm.cmd run test:workspace-v2`
  - FAIL: package script started, but `playwright` is not installed or not available on PATH.

Because Playwright is unavailable in this local environment, browser launch validation could not be completed here.

## Full Samples Smoke Test

Skipped. This PR only adjusts one tool's layout density and does not broadly impact samples.
