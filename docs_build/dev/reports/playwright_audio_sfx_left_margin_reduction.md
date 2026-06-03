# Audio / SFX Playground V2 Left Margin Reduction

PR: `PR_26145_015-audio-sfx-left-description-margin-reduction`

## Targeted Static Validation

- HTML external script/style guard for `toolbox/audio-sfx-playground-v2/index.html` - PASS
- `git diff --check -- toolbox/audio-sfx-playground-v2/index.html toolbox/audio-sfx-playground-v2/styles/audioSfxLayoutDensity.css` - PASS, with existing LF/CRLF working-copy warning for CSS only

## Focused Playwright Validation

Command: custom Playwright validation using the repo test server and installed Microsoft Edge at `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`.

Result: PASS

Validated:

- Audio / SFX Playground V2 launches with no console or page errors.
- `#styleDescription` has `margin-left: 5px`.
- `#styleExamples` has `margin-left: 5px`.
- `#settingsHelper` has `margin-left: 5px`.
- The three guidance blocks align to the normal left field edge plus 5px.
- The three guidance blocks extend to the same right edge as other left-column controls.
- No horizontal clipping or overflow occurs.
- Existing validation message alignment remains unchanged.

Measured layout highlights:

- Left field width: 236px
- `#styleDescription`: left 60px, width 231px, no overflow
- `#styleExamples`: left 60px, width 231px, no overflow
- `#settingsHelper`: left 60px, width 231px, no overflow

## Required Workspace V2 Test

Command: `npm.cmd run test:workspace-v2`

Result: FAIL due environment browser install, not this PR's spacing change.

Observed:

- 72 tests collected.
- 1 test passed.
- 71 tests failed before executing page assertions because Playwright could not launch its managed Chromium executable.
- Error: `Executable doesn't exist at C:\Users\DavidQ\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`
- Playwright requested: `npx playwright install`

## Full Samples Smoke

Skipped. This PR only impacts Audio / SFX Playground V2 left-column spacing/layout.

## Manual Validation Steps

1. Open `toolbox/audio-sfx-playground-v2/index.html` through the repo test server or Workspace V2 tile.
2. Select a Sound Style with description/examples, such as `Atari-style`.
3. Confirm the style description, examples, and helper text align near the left edge of the left panel.
4. Confirm the text wraps naturally across the available left-column width.
5. Confirm no clipping, horizontal scrolling, or console errors appear.

Expected outcome: the three guidance blocks use `5px` left margin and fill the left-column width more naturally.
