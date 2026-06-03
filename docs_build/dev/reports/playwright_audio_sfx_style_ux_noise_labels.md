# Audio / SFX Playground V2 Style UX and Noise Label Cleanup

PR: `PR_26145_007-audio-sfx-style-ux-and-noise-label-cleanup`

## Scope

- Added `Noise Only` as a friendly Sound Style preset.
- Kept Sound Style behavior as defaults/guidance only:
  - no slider range changes
  - no waveform options disabled
  - no waveform options hidden
- Kept `waveform: "noise"` as the actual source type.
- Renamed noise child labels after `Add Noise Layer`:
  - `Amount`
  - `Decay`
  - `Brightness`
- Tightened slider row alignment so label, slider, and value remain on one row.
- Preserved import/export/schema behavior.

## Targeted Static Validation

- `node --check` over `toolbox/audio-sfx-playground-v2/js/**/*.js`: PASS
- `JSON.parse` for `toolbox/schemas/tools/audio-sfx-playground-v2.schema.json`: PASS
- HTML static guard for `toolbox/audio-sfx-playground-v2/index.html`:
  - no inline event handlers: PASS
  - no `<style>` blocks: PASS
  - no inline `<script>` blocks: PASS
- `git diff --check -- toolbox/audio-sfx-playground-v2 toolbox/schemas/tools/audio-sfx-playground-v2.schema.json`: PASS
  - Git reported LF-to-CRLF working-copy warnings only.

## Targeted Node Validation

- Sound Style order is `Custom`, `Pure Tone`, `Noise Only`, divider, then the existing arcade styles: PASS
- Divider remains disabled: PASS
- Waveform options remain `sine`, `square`, `triangle`, `sawtooth`, `noise`: PASS
- No waveform option is disabled or hidden in HTML: PASS
- `Noise Only` style applies `waveform: "noise"`: PASS
- `Noise Only` style does not mutate slider min/max values: PASS
- Serializer export/read round trip accepts the Noise Only sound: PASS
- Cleaned child labels are present and old `Noise Amount`, `Noise Decay`, `Noise Brightness` labels are absent: PASS

## Focused Playwright Validation

Ran a focused Playwright validation through a temporary local HTTP server using local browser binaries from `.ms-playwright`.

- Tool launches without console errors: PASS
- Sound Style includes `Noise Only` and divider remains disabled: PASS
- `Noise Only` style works and selects `waveform=noise`: PASS
- Style selection does not change slider `min`, `max`, or `step`: PASS
- All waveform options remain enabled, visible, and selectable after style selection: PASS
- `waveform=noise` playback creates a primary noise buffer and does not create an oscillator: PASS
- Copy JSON preserves valid `waveform: "noise"` payload and does not add style metadata: PASS
- Labels read `Amount`, `Decay`, `Brightness`: PASS
- Slider rows keep label, slider, and value ordered/aligned on a normal desktop viewport: PASS

## V8 Coverage

- `(100%) toolbox/audio-sfx-playground-v2/js/controls/SfxControlPanel.js - covered by focused style UX/noise label Playwright validation`

Coverage is advisory per project instructions.

## Workspace V2

Command:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='.ms-playwright'; npm.cmd run test:workspace-v2
```

Result: TIMEOUT after 900 seconds.

Observed progress before timeout:

- 72 tests discovered.
- Tests 1-67 began running.
- 65 observed as passed.
- 2 observed as failed before timeout:
  - Object Vector Studio V2 layout shell/schema-only palette gate test.
  - Object Vector Studio V2 compact geometry layout/selected palette state test.
- Timeout occurred before tests 68-72 reported.

The observed failures are outside the Audio / SFX Playground V2 scope.

## Full Samples Smoke

Skipped per request because this PR only impacts Audio / SFX Playground V2 UI behavior.
