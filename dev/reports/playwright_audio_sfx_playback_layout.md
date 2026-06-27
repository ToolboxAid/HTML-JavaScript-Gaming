# PR_26145_023 Audio / SFX Playback Layout

Date: 2026-05-25

## Targeted validation

- `node --check` passed for changed Audio / SFX JavaScript files:
  - `toolbox/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js`
  - `toolbox/audio-sfx-playground-v2/js/bootstrap.js`
  - `toolbox/audio-sfx-playground-v2/js/controls/ActionNavControl.js`
  - `toolbox/audio-sfx-playground-v2/js/controls/SfxControlPanel.js`
  - `toolbox/audio-sfx-playground-v2/js/services/AudioSfxEngine.js`
- HTML guard passed for `toolbox/audio-sfx-playground-v2/index.html`: no inline `<script>`, `<style>`, or inline event handlers.
- CSS static brace validation passed for `toolbox/audio-sfx-playground-v2/styles/audioSfxLayoutDensity.css`.
- Existing Audio / SFX schema JSON parse passed.
- Serializer validation confirmed `playbackMode: "loop"` still round-trips.

## npm run test:workspace-v2

Command:

```text
$env:PLAYWRIGHT_BROWSERS_PATH='0'; npm.cmd run test:workspace-v2
```

Result: `65 passed, 7 failed`.

Per this PR's test-gate instruction, the full suite was run once and was not rerun after unrelated failures. Failing tests:

- `Workspace Manager V2 bootstrap › captures Input Mapping V2 mouse drag from live input and keeps visual capture states observable`
- `Workspace Manager V2 bootstrap › shows Object Vector Studio V2 layout shell and schema-only palette gate`
- `Workspace Manager V2 bootstrap › compacts Object Vector Studio V2 geometry layouts and selected palette state`
- `Workspace Manager V2 bootstrap › resolves game manifest schema refs from the game schema during repo discovery`
- `Workspace Manager V2 bootstrap › enables object vector and collision tools only from manifest geometry without fallback defaults`
- `Workspace Manager V2 bootstrap › uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles`
- `Workspace Manager V2 bootstrap › owns temporary UAT manifest seeding and launches Asset Manager V2 through session context`

Notes:

- No dirty sample/game manifest files were present in `git status`.
- `games/AITargetDummy/game.manifest.json` was left untouched. It already contains an Audio / SFX payload without `playbackMode`, which contributes to the Active Game discovery failures above.

## Focused Playwright validation

Ran focused Playwright scripts against `toolbox/audio-sfx-playground-v2/index.html` with Chromium and a stub Web Audio API.

Validated:

- Status Clear is positioned on the Status accordion header before the accordion X.
- Sound Design header contains Play, Stop, and Stop All before the accordion X.
- Play, Stop, and Stop All are disabled until an SFX tile is selected.
- Adding/selecting an SFX tile enables Play, Stop, and Stop All.
- Looping checkbox appears under Noise Controls after the noise sliders.
- Open accordion section overflow is hidden for `section.accordion-v2.tool-starter__accordion.is-open[data-accordion-v2-open="true"]`.
- Density label `white-space` is no longer `nowrap`.
- Wave/Noise control spacing uses the tightened CSS gaps.
- One Shot playback stops after one cycle.
- Looping playback continues until Stop.
- Stop stops the selected SFX playback.
- Stop All stops all active named SFX playback.
- Status Clear clears the log from the header action.
- Exported JSON preserves `playbackMode`.
- Workspace dirty behavior is preserved: Play, Stop, and Stop All do not mark dirty; Looping edits do mark dirty.
- No console errors.

Result: focused impacted validation passed.

## Full samples smoke

Skipped. This PR only impacts Audio / SFX Playground V2 UI/playback behavior.

## Manual validation

1. Open Audio / SFX Playground V2.
2. Confirm Play, Stop, and Stop All appear in the Sound Design header and are disabled before selecting a tile.
3. Add an SFX tile and confirm the three playback actions enable.
4. Confirm One Shot playback finishes on its own.
5. Check Looping, click Play, then confirm Stop ends the selected SFX.
6. Start multiple named looping sounds and confirm Stop All ends all active playback.
7. Confirm Clear appears in the Status header and clears the Status log.
