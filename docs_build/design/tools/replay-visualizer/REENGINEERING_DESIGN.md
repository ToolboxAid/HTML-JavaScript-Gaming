# Replay Visualizer Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-16
Source folder: `tools/Replay Visualizer`
Publish target: `tools.replay-visualizer`

## Tool Purpose
Replay Visualizer owns replay event import, validation, playback visualization, export, and publish to `tools.replay-visualizer`.

## Folder/Files Inspected
- `tools/Replay Visualizer/how_to_use.html`
- `tools/Replay Visualizer/index.html`
- `tools/Replay Visualizer/main.js`
- `tools/Replay Visualizer/README.md`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/Replay Visualizer/index.html`: `input[range]#replayTimeSlider` - 0 | Edits the current replay event payload through `replayTimeSlider`. | Updates draft replay event payload data and requires validation before tools.replay-visualizer publish. |
| `tools/Replay Visualizer/index.html`: `button[button]#loadReplayButton` - Load Replay JSON | Starts replay event payload import/load. | Reads incoming JSON into the tool-owned replay event payload only after validation succeeds. |
| `tools/Replay Visualizer/index.html`: `button[button]#playReplayButton` - Play | Controls preview/playback for the current replay event payload. | No tools.replay-visualizer JSON change unless a schema-owned playback setting is explicitly edited. |
| `tools/Replay Visualizer/index.html`: `button[button]#pauseReplayButton` - Pause | Controls preview/playback for the current replay event payload. | No tools.replay-visualizer JSON change unless a schema-owned playback setting is explicitly edited. |
| `tools/Replay Visualizer/index.html`: `button[button]#resetReplayButton` - Reset | Creates or resets a draft replay event payload. | Initializes tool-owned replay event payload data; tools.replay-visualizer is unchanged until validation and publish/export. |
| `tools/Replay Visualizer/index.html`: `textarea#replayJsonInput` - {"events":[{"timeMs":0,"type":"boot"}]} | Edits the active replay event or playback setting field. | Updates the draft replay event payload field represented by `replayJsonInput` before validation. |

## Panels And Surfaces Found
- `tools/Replay Visualizer/how_to_use.html`: `.tools-platform-surface`
- `tools/Replay Visualizer/index.html`: `.app-shell`
- `tools/Replay Visualizer/index.html`: `.debug-tool-list`
- `tools/Replay Visualizer/index.html`: `.debug-tool-panel`
- `tools/Replay Visualizer/index.html`: `.debug-tool-timeline`
- `tools/Replay Visualizer/index.html`: `.panel`
- `tools/Replay Visualizer/index.html`: `.tool-shell`
- `tools/Replay Visualizer/index.html`: `.tool-shell-container`
- `tools/Replay Visualizer/index.html`: `.tool-shell-page`
- `tools/Replay Visualizer/index.html`: `.tool-shell__center`
- `tools/Replay Visualizer/index.html`: `.tool-shell__left`
- `tools/Replay Visualizer/index.html`: `.tool-shell__right`

## Current Component/Class/Function Inventory
- `tools/Replay Visualizer/main.js`: applyEvents; applyProjectState; bindEvents; bootReplayVisualizer; buildPresetLoadedStatus; captureProjectState; clampTimeMs; getApi; getDurationMs; loadReplayFromInput; normalizeSamplePresetPath; playReplay; registerToolBootContract; renderCurrentEvent; renderEventList; setCurrentTimeMs; setStatus; stopPlayback; tryLoadPresetFromQuery; updateControlState

## Target Controls
Keep:
- replay import controls
- timeline/playback controls
- event inspection/export controls

Remove or rename:
- playback-only state from published replay JSON unless schema-owned

Add:
- Validate Replay
- Publish `tools.replay-visualizer`
- event/timeline diagnostics

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for replay event payload. Current contract baseline: `tools/schemas/tools/replay-visualizer.schema.json` (replay-visualizer Payload).
Required keys: `events`.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: parse incoming replay event payload and reject it before mutation when invalid
- validate: apply the current replay event payload contract before export, copy, or publish
- edit/process: mutate only replay event payload fields owned by Replay Visualizer
- export/save: serialize the validated replay event payload as the tools.replay-visualizer output shape
- publish: write only the validated tools.replay-visualizer value produced by Replay Visualizer
- copy/create payload: create copied payload text from the validated replay event payload, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts the schema-defined replay visualizer payload
- keeps playback controls separate from event data
- publishes only validated replay JSON

## Invalid JSON Rejection Behavior
- malformed JSON
- payload shape outside `replay-visualizer.schema.json`
- invalid replay event data
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.replay-visualizer = {
  "events": "jsonValue"
}
```

## Playwright Expectations
- load `tools/Replay Visualizer/index.html` without console errors
- play/scrub a valid replay payload
- reject invalid replay JSON

## Manual Test Expectations
- Open `tools/Replay Visualizer/index.html` and confirm timeline/playback controls render.
- Load a valid replay, play/scrub it, validate, export, and publish.
- Try malformed JSON and invalid event data; each must block publish.

## Known Gaps
- Playback state and published event data need explicit separation.
- Validation should identify the failing replay event.

## Rebuild Order Priority
core-16: rebuild in the core tool lane after earlier priorities are stable.
