# Audio / SFX Playground V2 Tile Play And Button Move

PR: `PR_26145_016-audio-sfx-play-selected-sound-and-move-play-button`

## Targeted Static Validation

- `node --check tools/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js` - PASS
- HTML external script/style guard for `tools/audio-sfx-playground-v2/index.html` - PASS
- `git diff --check -- tools/audio-sfx-playground-v2/index.html tools/audio-sfx-playground-v2/styles/audioSfxLayoutDensity.css tools/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js` - PASS, with existing LF/CRLF working-copy warnings for edited HTML/CSS

## Focused Playwright Validation

Command: custom Playwright validation using the repo test server and installed Microsoft Edge at `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`.

Result: PASS

Validated:

- Audio / SFX Playground V2 launches with no console or page errors.
- Clicking a created SFX tile selects that tile.
- Tile selection still loads the selected sound settings into the editor.
- Tile selection invokes the existing audio engine with the selected saved sound.
- The Play button is inside `#sfxShapeContent`.
- The old center-panel Play button placement is removed from `#soundDesignContent`.
- The Play button is centered horizontally in the left SFX Shape panel.
- The Play button is anchored to the bottom of the SFX Shape panel.

Measured focused validation highlights:

- Selected tile played: `First Selectable`, `440 Hz`, `square`.
- `#soundDesignContent #toolPlayButton`: not present.
- `#sfxShapeContent #toolPlayButton`: present.
- Play button horizontal center delta: `0px`.
- Play button bottom offset inside SFX Shape: `10px`.

## Playwright V8 Coverage

- `(100%) tools/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js - covered by focused add, select, tile playback, editor restore, and Play button placement validation`

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

## Full Samples Smoke

Skipped. This PR only impacts Audio / SFX Playground V2 tile playback and Play button layout.

## Manual Validation Steps

1. Open `tools/audio-sfx-playground-v2/index.html` through the repo test server or Workspace V2 tile.
2. Create at least two named SFX tiles.
3. Click a non-active tile.
4. Confirm the clicked tile becomes selected and its settings load into the editor.
5. Confirm the clicked tile plays immediately.
6. Confirm the Play button appears centered at the bottom of the SFX Shape left panel.
7. Confirm no Play button appears in the Sound Design center panel.

Expected outcome: tile click selects, loads, and plays the saved sound with no console errors.
