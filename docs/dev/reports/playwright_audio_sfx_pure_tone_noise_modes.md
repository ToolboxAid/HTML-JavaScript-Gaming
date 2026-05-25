# Audio / SFX Playground V2 Pure Tone and Noise Source Modes

PR: `PR_26145_006-audio-sfx-pure-tone-and-noise-source-modes`

## Scope

- Kept Sound Style order as:
  - `Custom`
  - `Pure Tone`
  - disabled divider
  - `Atari-style`
  - `Classic Arcade`
  - `Early Analog`
  - `Namco-style`
  - `Nintendo-style`
  - `TTL Arcade`
  - `Vector Arcade`
- Added `Noise` as a primary Wave/source option.
- Renamed `Blend noise transient` to `Add Noise Layer`.
- Preserved oscillator plus noise-layer behavior for `Add Noise Layer`.
- Updated Audio / SFX toolState validation and schema to allow `waveform: "noise"`.

## Targeted Static Validation

- `node --check` over `tools/audio-sfx-playground-v2/js/**/*.js`: PASS
- `JSON.parse` for `tools/schemas/tools/audio-sfx-playground-v2.schema.json`: PASS
- HTML static guard for `tools/audio-sfx-playground-v2/index.html`:
  - no inline event handlers: PASS
  - no `<style>` blocks: PASS
  - no inline `<script>` blocks: PASS
- `git diff --check -- tools/audio-sfx-playground-v2 tools/schemas/tools/audio-sfx-playground-v2.schema.json`: PASS
  - Git reported LF-to-CRLF working-copy warnings only.

## Targeted Node Validation

Validated with an ESM Node harness:

- Sound Style select order and disabled divider: PASS
- `Add Noise Layer` label is present: PASS
- Wave select includes `Noise`: PASS
- `Pure Tone` style defaults remain:
  - name `Pure Tone`: PASS
  - waveform `sine`: PASS
  - noise disabled: PASS
  - noise amount `0`: PASS
- Control validation accepts `waveform: "noise"`: PASS
- Serializer export/read round trip accepts `waveform: "noise"`: PASS
- Serializer rejects invalid waveform `pink-noise`: PASS
- Schema enum includes `noise`: PASS

## Focused Playwright Validation

Ran a focused Playwright validation through a temporary local HTTP server using local browser binaries from `.ms-playwright`.

- Tool launches without console errors: PASS
- Sound Style order and disabled divider: PASS
- `Pure Tone` style applies expected defaults: PASS
- `Add Noise Layer` label is visible: PASS
- `waveform=noise` playback creates a primary noise buffer and does not create an oscillator: PASS
- Oscillator waveform with Add Noise Layer creates both an oscillator and transient noise buffer: PASS
- Copy JSON includes valid `waveform: "noise"` payload with corrected schema path: PASS

## V8 Coverage

- `(100%) tools/audio-sfx-playground-v2/js/controls/SfxControlPanel.js - covered by focused pure tone/noise mode Playwright validation`
- `(100%) tools/audio-sfx-playground-v2/js/controls/SfxPreviewControl.js - covered by focused pure tone/noise mode Playwright validation`
- `(100%) tools/audio-sfx-playground-v2/js/services/AudioSfxEngine.js - covered by focused pure tone/noise mode Playwright validation`
- `(100%) tools/audio-sfx-playground-v2/js/services/ToolStateSerializer.js - covered by focused pure tone/noise mode Playwright validation`

Coverage is advisory per project instructions.

## Workspace V2

Command:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='.ms-playwright'; npm.cmd run test:workspace-v2
```

Result: TIMEOUT after 900 seconds.

Observed progress before timeout:

- 72 tests discovered.
- Tests 1-60 began running.
- 58 observed as passed.
- 2 observed as failed before timeout:
  - Object Vector Studio V2 layout shell/schema-only palette gate test.
  - Object Vector Studio V2 compact geometry layout/selected palette state test.
- Timeout occurred before tests 61-72 reported.

The observed failures are outside the Audio / SFX Playground V2 scope.

## Full Samples Smoke

Skipped per request because this PR only impacts Audio / SFX Playground V2.
