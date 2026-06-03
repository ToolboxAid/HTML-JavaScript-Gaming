# Audio / SFX Playground V2 Slider Focus and Control Limits

PR: `PR_26145_008-audio-sfx-slider-focus-and-control-limits`

## Scope

- Audited `tools/audio-sfx-playground-v2/js/controls/SfxControlPanel.js`.
- Moved Audio / SFX slider `min`, `max`, `step`, and default values into the centralized `SLIDER_LIMITS` table in `SfxControlPanel.js`.
- Removed scattered slider limit attributes from the Audio / SFX HTML; the control now applies them at mount.
- Kept Sound Style as defaults/guidance only:
  - no slider range mutation
  - no waveform option disabling or hiding
- Added range input focus retention after pointer, input, and change events so keyboard arrows continue adjusting the active slider.
- Preserved current slider steps, including Duration, Release, and Sweep step `5`.

## Targeted Static Validation

- `node --check` over `tools/audio-sfx-playground-v2/js/**/*.js`: PASS
- `JSON.parse` for `tools/schemas/tools/audio-sfx-playground-v2.schema.json`: PASS
- HTML/CSS static guard:
  - no inline event handlers: PASS
  - no `<style>` blocks: PASS
  - no inline `<script>` blocks: PASS
  - CSS non-empty: PASS
- `git diff --check -- tools/audio-sfx-playground-v2`: PASS
  - Git reported LF-to-CRLF working-copy warnings only.

## Targeted Node Validation

- `SfxControlPanel.js` includes centralized `SLIDER_LIMITS`: PASS
- Duration limit remains `min=60`, `max=2000`, `step=5`, `defaultValue=180`: PASS
- Release limit remains `min=20`, `max=700`, `step=5`, `defaultValue=90`: PASS
- Sweep limit remains `min=-1200`, `max=1200`, `step=5`, `defaultValue=700`: PASS
- Mount applies centralized slider limits to the DOM inputs: PASS
- Sound Style selection does not change slider limits: PASS
- Sound Style selection does not disable waveform select: PASS
- Slider pointer handler calls focus on the active range input: PASS

## Focused Playwright Validation

Ran a focused Playwright validation through a temporary local HTTP server using local browser binaries from `.ms-playwright`.

- Tool launches without console errors: PASS
- Runtime-applied slider limits are present on all range inputs: PASS
- Duration, Release, and Sweep keep step `5`: PASS
- Clicking Duration keeps focus on `#durationInput`: PASS
- Pressing ArrowRight after clicking Duration adjusts by `5`: PASS
- Clicking Sweep keeps focus on `#pitchSweepInput`: PASS
- Pressing ArrowRight after clicking Sweep adjusts by `5`: PASS
- Dragging Release keeps focus on `#releaseInput`: PASS
- Pressing ArrowRight after dragging Release adjusts by `5`: PASS
- Sound Style selection does not mutate slider limits: PASS
- Sound Style selection does not disable or hide waveform options: PASS
- All waveforms remain selectable after style selection: PASS

## V8 Coverage

- `(100%) tools/audio-sfx-playground-v2/js/controls/SfxControlPanel.js - covered by focused slider focus Playwright validation`

Coverage is advisory per project instructions.

## Workspace V2

Command:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='.ms-playwright'; npm.cmd run test:workspace-v2
```

Result: FAIL.

Observed result:

- 72 tests discovered.
- 68 passed.
- 4 failed:
  - Input Mapping V2 mouse drag visual capture state test.
  - Object Vector Studio V2 layout shell/schema-only palette gate test.
  - Object Vector Studio V2 compact geometry layout/selected palette state test.
  - Asset Manager V2 temporary UAT manifest/session context test timed out.

The observed failures are outside the Audio / SFX Playground V2 scope.

## Full Samples Smoke

Skipped per request because this PR only impacts Audio / SFX Playground V2 controls.
