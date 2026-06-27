# Audio / SFX Playground V2 Style Slider Clamps

PR: `PR_26145_009-audio-sfx-style-based-slider-clamps`

## Scope

- Added Sound Style based min/max clamps for every Audio / SFX Playground V2 slider.
- Kept clamp definitions centralized in `SfxControlPanel.js`.
- Preserved waveform availability; Sound Style does not disable or hide waveform options.
- Updated Audio / SFX toolState validation and schema frequency range to support Pure Tone `20-20000 Hz`.
- Preserved current step values, including Duration, Release, and Sweep step `5`.

## Style Clamp Coverage

Every Sound Style defines min/max clamps for:

- Frequency
- Duration
- Attack
- Release
- Volume
- Sweep
- Amount
- Decay
- Brightness

Requested frequency examples are present:

- Pure Tone: `20-20000 Hz`
- Atari-style: `40-4000 Hz`
- TTL Arcade: `80-2500 Hz`
- Vector Arcade: `100-6000 Hz`

## Targeted Static Validation

- `node --check` over `toolbox/audio-sfx-playground-v2/js/**/*.js`: PASS
- `JSON.parse` for `toolbox/schemas/tools/audio-sfx-playground-v2.schema.json`: PASS
- HTML/CSS static guard:
  - no inline event handlers: PASS
  - no `<style>` blocks: PASS
  - no inline `<script>` blocks: PASS
  - CSS non-empty: PASS
- `git diff --check -- toolbox/audio-sfx-playground-v2 toolbox/schemas/tools/audio-sfx-playground-v2.schema.json`: PASS
  - Git reported LF-to-CRLF working-copy warnings only.

## Targeted Node Validation

- `SfxControlPanel.js` contains requested frequency clamp examples: PASS
- Atari-style updates all slider min/max values: PASS
- Atari-style clamps out-of-range current values into its slider ranges: PASS
- Sound Style does not disable waveform select: PASS
- Serializer accepts exported frequency values up to `20000`: PASS
- Schema frequency range is `20-20000`: PASS

## Focused Playwright Validation

Ran a focused Playwright validation through a temporary local HTTP server using local browser binaries from `.ms-playwright`.

- Tool launches without console errors: PASS
- Sound Style order and disabled divider are preserved: PASS
- Each Sound Style updates all slider min/max values: PASS
- Out-of-range current values are clamped inside the selected style ranges: PASS
- Duration, Release, and Sweep preserve step `5`: PASS
- All waveform options remain visible, enabled, and selectable for each style: PASS
- Copy JSON after style selection produces a valid Audio / SFX toolState payload: PASS

## V8 Coverage

- `(100%) toolbox/audio-sfx-playground-v2/js/controls/SfxControlPanel.js - covered by focused style slider clamp Playwright validation`
- `(100%) toolbox/audio-sfx-playground-v2/js/services/ToolStateSerializer.js - covered by focused style slider clamp Playwright validation`

Coverage is advisory per project instructions.

## Workspace V2

Command:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='.ms-playwright'; npm.cmd run test:workspace-v2
```

Result: TIMEOUT after 900 seconds.

Observed progress before timeout:

- 72 tests discovered.
- Tests 1-70 began running.
- 68 observed as passed.
- 2 observed as failed before timeout:
  - Object Vector Studio V2 layout shell/schema-only palette gate test.
  - Object Vector Studio V2 compact geometry layout/selected palette state test.
- Timeout occurred before tests 71-72 reported.

The observed failures are outside the Audio / SFX Playground V2 scope.

## Full Samples Smoke

Skipped per request because this PR only impacts Audio / SFX Playground V2 slider behavior.
