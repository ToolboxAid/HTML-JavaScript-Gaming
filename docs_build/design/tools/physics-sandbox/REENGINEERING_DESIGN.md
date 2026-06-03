# Physics Sandbox Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-14
Source folder: `toolbox/Physics Sandbox`
Publish target: `tools.physics-sandbox`

## Tool Purpose
Physics Sandbox owns physics body/config import, validation, simulation preview, export, and publish to `tools.physics-sandbox`.

## Folder/Files Inspected
- `toolbox/Physics Sandbox/how_to_use.html`
- `toolbox/Physics Sandbox/index.html`
- `toolbox/Physics Sandbox/main.js`
- `toolbox/Physics Sandbox/README.md`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `toolbox/Physics Sandbox/index.html`: `button[button]#runPhysicsStepButton` - Run Step | Processes the current physics sandbox payload. | Updates tool-owned derived data/report fields that must validate before tools.physics-sandbox publish. |
| `toolbox/Physics Sandbox/index.html`: `textarea#physicsBodyInput` - {"x":0,"y":0,"velocityX":100,"velocityY":0,"accelerationX":-10,"dragX":12} | Edits the current physics sandbox payload through `physicsBodyInput`. | Updates draft physics sandbox payload data and requires validation before tools.physics-sandbox publish. |

## Panels And Surfaces Found
- `toolbox/Physics Sandbox/how_to_use.html`: `.tools-platform-surface`
- `toolbox/Physics Sandbox/index.html`: `.app-shell`
- `toolbox/Physics Sandbox/index.html`: `.debug-tool-panel`
- `toolbox/Physics Sandbox/index.html`: `.panel`
- `toolbox/Physics Sandbox/index.html`: `.tool-shell`
- `toolbox/Physics Sandbox/index.html`: `.tool-shell-container`
- `toolbox/Physics Sandbox/index.html`: `.tool-shell-page`
- `toolbox/Physics Sandbox/index.html`: `.tool-shell__center`
- `toolbox/Physics Sandbox/index.html`: `.tool-shell__left`
- `toolbox/Physics Sandbox/index.html`: `.tool-shell__right`

## Current Component/Class/Function Inventory
- `toolbox/Physics Sandbox/main.js`: bootPhysicsSandbox; buildPresetLoadedStatus; getApi; normalizeSamplePresetPath; parseBody; registerToolBootContract; runStep; setStatus; tryLoadPresetFromQuery

## Target Controls
Keep:
- body/config controls
- simulation step/play controls
- result/export controls

Remove or rename:
- simulation-only runtime state from published physics JSON unless schema-owned

Add:
- Validate Physics Payload
- Publish `tools.physics-sandbox`
- body/config diagnostics

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for physics sandbox payload. Current contract baseline: `toolbox/schemas/tools/physics-sandbox.schema.json` (physics-sandbox Payload).
Required keys: `physicsBody`.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: parse incoming physics sandbox payload and reject it before mutation when invalid
- validate: apply the current physics sandbox payload contract before export, copy, or publish
- edit/process: mutate only physics sandbox payload fields owned by Physics Sandbox
- export/save: serialize the validated physics sandbox payload as the tools.physics-sandbox output shape
- publish: write only the validated tools.physics-sandbox value produced by Physics Sandbox
- copy/create payload: create copied payload text from the validated physics sandbox payload, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts the schema-defined physics sandbox payload
- keeps body/config edits inside the tool-owned physics payload
- publishes only validated physics JSON

## Invalid JSON Rejection Behavior
- malformed JSON
- payload shape outside `physics-sandbox.schema.json`
- invalid body/config data
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.physics-sandbox = {
  "physicsBody": "jsonValue"
}
```

## Playwright Expectations
- load `toolbox/Physics Sandbox/index.html` without console errors
- step/play a valid simulation and confirm output/report updates
- reject invalid physics payload JSON

## Manual Test Expectations
- Open `toolbox/Physics Sandbox/index.html` and confirm body/config/simulation controls render.
- Edit a physics body/config, run a preview, validate, export, and publish.
- Try malformed JSON and invalid body data; each must block publish.

## Known Gaps
- Simulation state and published payload need explicit separation.
- Validation should identify the failing body/config field.

## Rebuild Order Priority
core-14: rebuild in the core tool lane after earlier priorities are stable.
