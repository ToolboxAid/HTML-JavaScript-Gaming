# PR_26145_022 Audio / SFX Play Stop Loop Mode

Date: 2026-05-25

## Targeted validation

- `node --check` passed for changed Audio / SFX JavaScript files:
  - `tools/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js`
  - `tools/audio-sfx-playground-v2/js/bootstrap.js`
  - `tools/audio-sfx-playground-v2/js/controls/ActionNavControl.js`
  - `tools/audio-sfx-playground-v2/js/controls/SfxControlPanel.js`
  - `tools/audio-sfx-playground-v2/js/controls/SfxTileListControl.js`
  - `tools/audio-sfx-playground-v2/js/services/AudioSfxEngine.js`
  - `tools/audio-sfx-playground-v2/js/services/ToolStateSerializer.js`
- JSON parse validation passed for `tools/schemas/tools/audio-sfx-playground-v2.schema.json`.
- HTML guard passed for `tools/audio-sfx-playground-v2/index.html`: no inline `<script>`, `<style>`, or inline event handlers.
- Serializer validation confirmed `playbackMode: "loop"` round-trips and invalid playback modes are rejected.
- UI/docs text check found no planned/start API wording in Audio / SFX UI/docs.

## npm run test:workspace-v2

Command:

```text
$env:PLAYWRIGHT_BROWSERS_PATH='0'; npm.cmd run test:workspace-v2
```

Result: `65 passed, 7 failed`.

Failures were outside this PR's Audio / SFX playback path:

- Input Mapping V2 capture state timing.
- Object Vector Studio V2 interaction/layout assertions.
- Repo discovery omitted the pre-existing dirty `games/AITargetDummy/game.manifest.json` because that user-modified manifest now contains an Audio / SFX payload without the new required `playbackMode` field.
- Existing Workspace Manager V2 schema-role expectation mismatch for Audio / SFX launch context.
- One UAT manifest seeding timeout.

## Focused Playwright validation

Ran focused Playwright scripts against `tools/audio-sfx-playground-v2/index.html` with Chromium and a stub Web Audio API.

Validated:

- Play and Stop render together in the left SFX Shape panel.
- One Shot playback starts and clears active playback after one cycle.
- Loop playback remains active until Stop is clicked.
- Stop stops the selected SFX playback and logs visible Status text.
- Different named loop sounds can run concurrently; stopping one name leaves the other active.
- Exported JSON includes `payload.sounds[].sound.playbackMode`.
- Workspace launch preserves dirty behavior: Play/Stop do not mark dirty, while changing playback mode marks dirty and writes the updated payload.
- No console errors.

Result: focused impacted validation passed.

## V8 coverage

(100%) tools/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js - 17430/17430 bytes used in focused playback validation
(100%) tools/audio-sfx-playground-v2/js/bootstrap.js - 4940/4940 bytes used in focused playback validation
(100%) tools/audio-sfx-playground-v2/js/controls/ActionNavControl.js - 3793/3793 bytes used in focused playback validation
(100%) tools/audio-sfx-playground-v2/js/controls/SfxControlPanel.js - 27855/27855 bytes used in focused playback validation
(100%) tools/audio-sfx-playground-v2/js/controls/SfxTileListControl.js - 1522/1522 bytes used in focused playback validation
(100%) tools/audio-sfx-playground-v2/js/services/AudioSfxEngine.js - 6245/6245 bytes used in focused playback validation
(100%) tools/audio-sfx-playground-v2/js/services/ToolStateSerializer.js - 9216/9216 bytes used in focused playback validation

## Full samples smoke

Skipped. This PR only impacts Audio / SFX Playground V2 playback behavior and schema fields.

## Manual validation

1. Open Workspace V2 and launch Audio / SFX Playground V2.
2. Create or select an SFX with Playback set to `One Shot`; click Play and confirm playback stops after one cycle.
3. Change Playback to `Loop`; click Play and confirm playback continues until Stop.
4. Confirm Stop only stops the currently selected named SFX.
5. Export or Copy JSON and confirm `playbackMode` is present on saved sounds.
