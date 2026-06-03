# Audio / SFX Playground V2 JSON Actions And Name Controls Validation

PR: `PR_26144_006-audio-sfx-json-actions-and-name-controls`

## Scope

- Updated only `toolbox/audio-sfx-playground-v2` plus required reports.
- Renamed the tool action from `Export toolState` to `Export JSON`.
- Added `Import JSON` immediately to the left of `Copy JSON`.
- Added a hidden external-file input for JSON import; event wiring remains in external JavaScript.
- Changed the Name-row Add button text to `+`.
- Added a trash-can delete button immediately to the right of `+`.
- Kept Name input, `+`, and delete button on one row.
- Let range sliders use the flexible remaining column between label and value output.
- Did not modify `start_of_day` folders.

## Static Validation

PASS:

- HTML/CSS restriction check:
  - no `<style>` blocks
  - no inline event handlers
  - no script tags without `src`
  - linked stylesheets resolve
  - CSS braces are balanced
  - `Import JSON`, `Copy JSON`, and `Export JSON` controls are present
  - old `Export toolState` label is absent
  - delete SFX button is present
- Audio / SFX Playground V2 JavaScript syntax check:
  - `node --check` over `toolbox/audio-sfx-playground-v2/js/**/*.js`
- Changed runtime module import check:
  - `AudioSfxPlaygroundV2App.js`
  - `ActionNavControl.js`
  - `SfxControlPanel.js`
  - `ToolStateSerializer.js`
- JSON import/export serializer check:
  - `ToolStateSerializer.createToolState(...)` and `readToolState(...)` round-trip a saved SFX collection.
- Whitespace validation:
  - `git diff --check -- toolbox/audio-sfx-playground-v2`
- JSON file validation:
  - No JSON files changed in this PR.

## Playwright Impact

Playwright impacted: Yes.

Expected validation:

- Workspace V2 launches Audio / SFX Playground V2 with no console errors.
- Tool actions show `Import JSON`, `Copy JSON`, and `Export JSON` in that order.
- `Export JSON` replaces the old `Export toolState` label.
- Name input, `+`, and trash-can delete button remain on one row.
- `+` creates a saved SFX tile.
- Trash-can delete removes the selected saved SFX tile and disables when no tile is selected.
- Range sliders fill the remaining space between their label and value display.
- Import JSON accepts the tool's exported JSON and restores the editor plus saved tile list.
- Invalid JSON import logs an actionable error and does not partially render.

Local command results:

- `npm run test:workspace-v2`
  - FAIL: PowerShell blocked `npm.ps1` because script execution is disabled on this system.
- `npm.cmd run test:workspace-v2`
  - FAIL: package script started, but `playwright` is not installed or not available on PATH.

Because Playwright is unavailable in this local environment, browser launch validation and V8 coverage could not be completed here.

## Coverage

WARN: Runtime JavaScript changed, but Playwright V8 coverage could not be generated because the local Playwright command is unavailable.

- `(WARN) toolbox/audio-sfx-playground-v2/js/AudioSfxPlaygroundV2App.js - Playwright unavailable`
- `(WARN) toolbox/audio-sfx-playground-v2/js/bootstrap.js - Playwright unavailable`
- `(WARN) toolbox/audio-sfx-playground-v2/js/controls/ActionNavControl.js - Playwright unavailable`
- `(WARN) toolbox/audio-sfx-playground-v2/js/controls/SfxControlPanel.js - Playwright unavailable`
- `(WARN) toolbox/audio-sfx-playground-v2/js/services/ToolStateSerializer.js - Playwright unavailable`

## Full Samples Smoke Test

Skipped. This PR only impacts Audio / SFX Playground V2 UI controls.
