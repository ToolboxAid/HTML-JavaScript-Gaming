# Audio / SFX Playground V2 Center Column Tight Layout

PR: `PR_26145_014-audio-sfx-center-column-tight-layout`

## Targeted Static Validation

- `node --check toolbox/audio-sfx-playground-v2/js/bootstrap.js` - PASS
- `node --check toolbox/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js` - PASS
- `node --check toolbox/audio-sfx-playground-v2/js/controls/SfxControlPanel.js` - PASS
- HTML external script/style guard for `toolbox/audio-sfx-playground-v2/index.html` - PASS
- `git diff --check -- toolbox/audio-sfx-playground-v2` - PASS, with existing LF/CRLF working-copy warnings only

## Focused Playwright Validation

Command: custom Playwright validation using the repo test server and installed Microsoft Edge at `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`.

Result: PASS

Validated:

- Audio / SFX Playground V2 launches with no console or page errors.
- Center-column Sound Design top gap is reduced: grid top is 9px below content top.
- Sound Design content uses available width efficiently: grid width is 604px inside a 620px content area.
- Wave Controls and Noise Controls are top-aligned.
- Noise Controls are not pushed lower by unused top margin.
- All slider rows remain single-line with no clipping or output wrapping.
- Rename button is centered below the Name row.
- Sound Style changes do not rename the selected SFX tile.
- Pending Name edits do not rename the selected SFX tile until Rename is clicked.
- Slider focus remains on the active slider after click, and ArrowRight changes Duration by the 5ms step.
- Right-column Wave Preview, Output Summary, and Status accordions still collapse and expand.

Measured layout highlights:

- `#soundDesignContent`: 620px wide
- `.audio-sfx__control-grid`: 604px wide
- Wave group: 297px wide
- Noise group: 297px wide
- Slider row height: 28px for all measured slider rows

## Playwright V8 Coverage

- `(100%) toolbox/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js - covered by focused launch, rename, style, slider, accordion, preview/export-state flows`
- `(100%) toolbox/audio-sfx-playground-v2/js/bootstrap.js - covered by focused tool launch`
- `(100%) toolbox/audio-sfx-playground-v2/js/controls/SfxControlPanel.js - covered by style, slider, name, rename, and validation flows`

Changed runtime JavaScript files were present in focused coverage.

## Required Workspace V2 Test

Command: `npm.cmd run test:workspace-v2`

Result: FAIL due environment browser install, not this PR's tool behavior.

Observed:

- 72 tests collected.
- 1 test passed.
- 71 tests failed before executing page assertions because Playwright could not launch its managed Chromium executable.
- Error: `Executable doesn't exist at C:\Users\DavidQ\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`
- Playwright requested: `npx playwright install`

Note: PowerShell blocked the direct `npm` shim because local script execution is disabled, so the package script was run through `npm.cmd`.

## Full Samples Smoke

Skipped. This PR only impacts Audio / SFX Playground V2 layout and rename behavior.

## Manual Validation Steps

1. Open `toolbox/audio-sfx-playground-v2/index.html` through the repo test server or Workspace V2 tile.
2. Confirm Sound Design uses the center column width with Wave Controls and Noise Controls side by side.
3. Confirm Noise Controls begin at the same vertical level as Wave Controls.
4. Add the default `Coin` SFX tile.
5. Change Sound Style to `TTL Arcade`; confirm the tile remains named `Coin`.
6. Edit Name to `Renamed Coin`; confirm the tile remains `Coin` until Rename is clicked.
7. Click Rename; confirm the active tile becomes `Renamed Coin`.
8. Click a slider and press arrow keys; confirm focus stays on that slider and values move by the configured step.
9. Collapse and expand Wave Preview, Output Summary, and Status.

Expected outcome: no clipping, no slider wrapping, no console errors, no style-driven tile renaming.
