# Audio / SFX Playground V2 Noise and Slider Resolution Validation

PR: `PR_26145_003-audio-sfx-noise-enhancements-and-slider-resolution`

Playwright impacted: Yes.

## Scope

- Replaced simple noise mix behavior with a transient arcade-noise layer.
- Added Audio / SFX Playground V2 controls for:
  - Noise Amount
  - Noise Decay
  - Noise Brightness
- Updated Audio / SFX payload/schema fields for the new noise parameters.
- Updated slider resolution:
  - Duration step: 5 ms
  - Release step: 5 ms
  - Sweep step: 5 cents
  - Duration max: 2000 ms

## Targeted Validation

PASS: JavaScript syntax validation

Command:

```powershell
Get-ChildItem -Recurse -File toolbox/audio-sfx-playground-v2/js -Filter *.js | ForEach-Object { node --check $_.FullName }
```

PASS: HTML/CSS static validation

Checked Audio / SFX Playground V2 HTML/CSS for empty files, inline event handlers, `<style>` blocks, and inline `<script>` blocks.

PASS: Schema JSON parse validation

Command:

```powershell
Get-Content -Raw toolbox/schemas/tools/audio-sfx-playground-v2.schema.json | ConvertFrom-Json | Out-Null
```

PASS: Diff whitespace validation

Command:

```powershell
git diff --check -- toolbox/audio-sfx-playground-v2 toolbox/schemas
```

PASS: Targeted Node behavior validation

Validated with an inline Node module script:

- Schema requires `noiseAmount`, `noiseDecayMs`, and `noiseFilterHz`.
- Schema allows duration up to `2000` ms.
- Schema enforces 5 ms duration increments.
- Schema enforces 5 ms release increments.
- Schema enforces 5 cent sweep increments.
- Serializer preserves the new noise fields.
- Serializer rejects non-5-cent sweep values.
- Audio engine starts a noise buffer source when noise is enabled.
- Noise stops at the configured decay time instead of full sound duration.
- Noise brightness reaches the `BiquadFilterNode.frequency` path.
- Noise amount reaches the transient noise gain path with audible gain.
- Noise gain decays transiently.

PASS: Targeted Playwright validation

Validated with a temporary local HTTP server, Chromium, and an injected fake `AudioContext`:

- Audio / SFX Playground V2 launched without console errors.
- Noise Amount, Noise Decay, and Noise Brightness controls were visible.
- Duration slider step was `5`.
- Duration slider max was `2000`.
- Release slider step was `5`.
- Sweep slider step was `5`.
- Clicking Play with noise enabled started the transient noise layer.
- Noise stopped at the configured decay time.
- Noise Brightness reached the engine filter frequency.
- Noise Amount reached the audible transient gain path.

## Workspace V2 Validation

PARTIAL: `npm.cmd run test:workspace-v2`

Command:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='.ms-playwright'
npm.cmd run test:workspace-v2
```

Result:

- Workspace V2 Playwright launched with local Chromium.
- The run timed out after 15 minutes at test 67 of 72.
- 65 tests passed before timeout.
- 2 unrelated Object Vector Studio V2 tests were marked failed before timeout:
  - `shows Object Vector Studio V2 layout shell and schema-only palette gate`
  - `compacts Object Vector Studio V2 geometry layouts and selected palette state`
- The timeout/failures are outside the Audio / SFX Playground V2 synthesis-control scope.

Expected Playwright pass behavior:

- Audio / SFX Playground V2 launches without console errors.
- Noise controls visibly affect the playback graph.
- Noise can be clearly heard during playback through the transient noise gain path.
- Duration/Release/Sweep sliders use 5-unit steps.
- Duration reaches 2000 ms.

Expected Playwright fail behavior:

- Fail if noise controls are missing or disconnected from playback.
- Fail if noise is mixed uniformly for the full duration instead of as a transient.
- Fail if duration, release, or sweep slider steps regress.
- Fail if duration max does not reach 2000 ms.
- Fail if console errors occur.

## Coverage

Playwright V8 coverage was not collected during the focused inline browser validation.

WARN: `toolbox/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js` - changed runtime JavaScript; coverage unavailable.
WARN: `toolbox/audio-sfx-playground-v2/js/bootstrap.js` - changed runtime JavaScript; coverage unavailable.
WARN: `toolbox/audio-sfx-playground-v2/js/controls/SfxControlPanel.js` - changed runtime JavaScript; coverage unavailable.
WARN: `toolbox/audio-sfx-playground-v2/js/controls/SfxPreviewControl.js` - changed runtime JavaScript; coverage unavailable.
WARN: `toolbox/audio-sfx-playground-v2/js/services/AudioSfxEngine.js` - changed runtime JavaScript; coverage unavailable.
WARN: `toolbox/audio-sfx-playground-v2/js/services/ToolStateSerializer.js` - changed runtime JavaScript; coverage unavailable.

## Full Samples Smoke Test

Skipped. This PR only impacts Audio / SFX Playground V2 synthesis controls.
