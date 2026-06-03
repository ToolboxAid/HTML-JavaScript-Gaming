# Audio / SFX Playground V2 JSON Import Export Validation

PR: `PR_26144_009-audio-sfx-json-import-export-behavior`

## Scope

- Updated only `toolbox/audio-sfx-playground-v2` plus required reports.
- Made Export JSON perform a browser JSON file download.
- Made Copy JSON copy the same validated export payload used by Export JSON.
- Kept the export payload as the Audio / SFX toolState object containing:
  - current active sound payload
  - active sound id
  - all saved SFX tile entries
- Kept Import JSON validation before any editor/tile mutation.
- Rejected invalid or inconsistent active-sound payloads with a visible Status error.
- Did not add silent fallback or partial render behavior.

## Static Validation

PASS:

- HTML/CSS static validation:
  - no `<style>` blocks
  - no inline event handlers
  - no script tags without `src`
  - linked stylesheets resolve
  - CSS braces are balanced
  - JSON action labels are present
- Audio / SFX Playground V2 JavaScript syntax check:
  - `node --check` over `toolbox/audio-sfx-playground-v2/js/**/*.js`
- JSON import/export behavior check:
  - valid exported toolState round-trips through `readToolState`
  - invalid active-sound mismatch is rejected
  - Export JSON download path creates a JSON blob, click target, and object URL cleanup
- Whitespace validation:
  - `git diff --check -- toolbox/audio-sfx-playground-v2`
- JSON file validation:
  - No JSON files changed in this PR.

## Playwright Impact

Playwright impacted: Yes.

Expected validation:

- Workspace V2 launches Audio / SFX Playground V2 with no console errors.
- Export JSON downloads a file containing the active SFX and all saved SFX tiles.
- Copy JSON copies the same validated payload as Export JSON.
- Import JSON restores a valid exported payload, including active SFX and saved tiles.
- Invalid JSON is rejected with a visible Status error.
- Invalid JSON does not mutate the current editor, active SFX, or saved tile list.

Local command results:

- `npm run test:workspace-v2`
  - FAIL: PowerShell blocked `npm.ps1` because script execution is disabled on this system.
- `npm.cmd run test:workspace-v2`
  - FAIL: package script started, but `playwright` is not installed or not available on PATH.

Because Playwright is unavailable in this local environment, browser launch validation and V8 coverage could not be completed here.

## Coverage

WARN: Runtime JavaScript changed, but Playwright V8 coverage could not be generated because the local Playwright command is unavailable.

- `(WARN) toolbox/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js - Playwright unavailable`
- `(WARN) toolbox/audio-sfx-playground-v2/js/services/ToolStateSerializer.js - Playwright unavailable`

## Full Samples Smoke Test

Skipped. This PR only impacts Audio / SFX Playground V2 JSON controls.
