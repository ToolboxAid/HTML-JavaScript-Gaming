# Replay Visualizer Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: rebuildable tool
Core priority: core-16
Source folder: `tools/Replay Visualizer`
Publish target: `tools.replay-visualizer`

## Tool Purpose
Replay event visualization. Replay Visualizer owns `events`, playback controls, scrubber state, validation, export, and publish to `tools.replay-visualizer`.

## Exact Folder/Files Inspected
- `tools/Replay Visualizer/how_to_use.html`
- `tools/Replay Visualizer/index.html`
- `tools/Replay Visualizer/main.js`
- `tools/Replay Visualizer/README.md`

## Exact Current Controls Found
- `tools/Replay Visualizer/index.html`: `button[button]#loadReplayButton` - Load Replay JSON
- `tools/Replay Visualizer/index.html`: `button[button]#playReplayButton` - Play
- `tools/Replay Visualizer/index.html`: `button[button]#pauseReplayButton` - Pause
- `tools/Replay Visualizer/index.html`: `button[button]#resetReplayButton` - Reset
- `tools/Replay Visualizer/index.html`: `textarea#replayJsonInput` - {
- `tools/Replay Visualizer/index.html`: `input[range]#replayTimeSlider` - replayTimeSlider
- `tools/Replay Visualizer/main.js`: `loadReplayButton` via loadButton
- `tools/Replay Visualizer/main.js`: `playReplayButton` via playButton
- `tools/Replay Visualizer/main.js`: `pauseReplayButton` via pauseButton
- `tools/Replay Visualizer/main.js`: `resetReplayButton` via resetButton
- `tools/Replay Visualizer/main.js`: `replayStatusText` via statusText
- `tools/Replay Visualizer/main.js`: `replayJsonInput` via input
- `tools/Replay Visualizer/main.js`: `replayTimeSlider` via slider
- `tools/Replay Visualizer/main.js`: `replayTimeReadout` via timeReadout
- `tools/Replay Visualizer/main.js`: `replayEventList` via eventList
- `tools/Replay Visualizer/main.js`: `replayEventOutput` via eventOutput

## Current Panels And Surfaces Found
- `tools/Replay Visualizer/index.html`: `.tool-shell-page`
- `tools/Replay Visualizer/index.html`: `.tool-shell-container`
- `tools/Replay Visualizer/index.html`: `.tool-shell`
- `tools/Replay Visualizer/index.html`: `.app-shell`
- `tools/Replay Visualizer/index.html`: `.tool-shell__left`
- `tools/Replay Visualizer/index.html`: `.panel`
- `tools/Replay Visualizer/index.html`: `.debug-tool-panel`
- `tools/Replay Visualizer/index.html`: `.tool-shell__center`
- `tools/Replay Visualizer/index.html`: `.tool-shell__right`
- `tools/Replay Visualizer/index.html`: `.debug-tool-list`

## Exact Current Functions And Classes
- `tools/Replay Visualizer/main.js`: function applyEvents; function bindEvents; function bootReplayVisualizer; function buildPresetLoadedStatus; function clampTimeMs; function getDurationMs; function loadReplayFromInput; function normalizeSamplePresetPath; function playReplay; function renderCurrentEvent; function renderEventList; function setCurrentTimeMs; function setStatus; function stopPlayback; function tryLoadPresetFromQuery; function updateControlState; method applyProjectState; method captureProjectState; method getApi; method registerToolBootContract

## Target Controls
Keep:
- Load Replay JSON
- Play
- Pause
- Reset
- time slider
- event list/output panels

Remove or rename:
- none identified in the current folder

Add:
- Validate Replay Events
- Export Replay JSON/report
- Publish `tools.replay-visualizer`

## JSON Contract Owned By This Tool
Owned JSON is the replay-visualizer payload. Required field is `events`; no other top-level fields are allowed. Events data owns replay time, event type, event ordering, and playback inspection output.

## Publish Output
Publish only to `tools.replay-visualizer`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- missing `events`
- `events` that is not an array
- events without valid time/type data
- unsupported top-level fields

## Manual Test Plan
- Load valid replay events.
- Play, pause, reset, and scrub with the slider.
- Try malformed JSON and event rows without valid time/type fields; playback and publish must stay blocked.
