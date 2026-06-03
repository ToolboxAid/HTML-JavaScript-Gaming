# Audio / SFX Playground V2 Copy JSON and Frequency Alignment Validation

PR: `PR_26145_002-audio-sfx-copy-json-and-frequency-engine-alignment`

Playwright impacted: Yes.

## Scope

- Fixed Audio / SFX Playground V2 Copy JSON to copy the current exported JSON payload through the Clipboard API when available.
- Added a DOM copy fallback for browsers where `navigator.clipboard.writeText` is unavailable.
- Added visible Status success and failure messages for Copy JSON.
- Audited engine frequency usage for an existing shared frequency class.

## Frequency Audit

Found `src/engine/audio/FrequencyPlayer.js`.

Result:

- `FrequencyPlayer` is a sequence playback class that maps existing frequency values to `AudioService.playSequence`.
- It does not provide frequency/cents conversion.
- No shared engine frequency/cents conversion class was found.
- No new frequency helper/model was added.
- Audio / SFX Playground V2 continues to pass `frequencyHz` to `oscillator.frequency` and `pitchSweepCents` to Web Audio `detune`, preserving existing engine-native cents behavior.

## Targeted Validation

PASS: JavaScript syntax validation

Command:

```powershell
Get-ChildItem -Recurse -File tools/audio-sfx-playground-v2/js -Filter *.js | ForEach-Object { node --check $_.FullName }
```

PASS: HTML/CSS static validation

Checked Audio / SFX Playground V2 HTML/CSS for empty files, inline event handlers, `<style>` blocks, and inline `<script>` blocks.

PASS: Frequency helper duplication scan

Command:

```powershell
rg "class .*Frequency|Frequency[A-Za-z]*|centsTo|frequencyTo|Math\.pow\(2" tools/audio-sfx-playground-v2 src/engine/audio -g "*.js" -g "*.mjs"
```

The scan found the existing `FrequencyPlayer` and `MidiPlayer` note conversion only. No duplicate Audio / SFX frequency helper/model was introduced.

PASS: Targeted Node behavior validation

Validated with an inline Node module script:

- Copy JSON writes valid exported JSON through `navigator.clipboard.writeText`.
- Copy JSON includes current `frequencyHz`.
- Copy JSON includes current `pitchSweepCents`.
- Copy JSON shows a visible success Status message.
- DOM fallback copy selects the current exported JSON payload.
- Missing Clipboard API and missing fallback command show visible, actionable failure.
- Audio engine still reports an actionable Web Audio unavailable error when no audio context exists.

PASS: Targeted Playwright validation

Validated with a temporary local HTTP server and Chromium:

- Audio / SFX Playground V2 launched without console errors.
- Copy JSON copied valid JSON.
- Copied JSON referenced `tools/schemas/tools/audio-sfx-playground-v2.schema.json`.
- Copied JSON included the current editor name.
- Copied JSON included the current frequency value.
- Copied JSON included the current cents sweep value.
- Status showed copy success.
- Forced clipboard-unavailable state showed visible copy failure.

PASS: Diff whitespace validation

Command:

```powershell
git diff --check -- tools/audio-sfx-playground-v2 tools/schemas
```

## Workspace V2 Validation

PARTIAL: `npm.cmd run test:workspace-v2`

Command:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='.ms-playwright'
npm.cmd run test:workspace-v2
```

Result:

- The Workspace V2 Playwright suite launched successfully with local Chromium.
- The run timed out after 15 minutes at test 70 of 72.
- 67 tests passed before timeout.
- 3 unrelated tests were marked failed before timeout:
  - Input Mapping V2 column/live-highlight layout test.
  - Object Vector Studio V2 layout shell/schema-only palette gate test.
  - Object Vector Studio V2 compact geometry layout/selected palette state test.
- The timeout/failures are outside the Audio / SFX Playground V2 Copy JSON and frequency alignment scope.

Expected Playwright pass behavior:

- Audio / SFX Playground V2 launches from Workspace V2 without console errors.
- Copy JSON copies the current exported payload.
- Copy success is visible in Status.
- Copy failure is visible and actionable in Status.
- Frequency and sweep values remain intact in copied/exported JSON.
- No duplicate frequency helper/model is introduced.

Expected Playwright fail behavior:

- Fail if Copy JSON does not write valid JSON.
- Fail if copied JSON omits current frequency or cents sweep values.
- Fail if copy success/failure has no visible Status message.
- Fail if a new competing frequency conversion helper/model appears.
- Fail if console errors occur.

## Coverage

Playwright V8 coverage was not collected during the focused inline browser validation.

WARN: `tools/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js` - changed runtime JavaScript; coverage unavailable.

## Full Samples Smoke Test

Skipped. This PR only impacts Audio / SFX Playground V2 copy behavior and frequency utility alignment.
