# 3D JSON Payload Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-11
Source folder: `toolbox/3D JSON Payload`
Publish target: `tools.3d-json-payload`

## Tool Purpose
3D JSON Payload owns map payload import, validation, normalization, export, and publish to `tools.3d-json-payload`.

## Folder/Files Inspected
- `toolbox/3D JSON Payload/how_to_use.html`
- `toolbox/3D JSON Payload/index.html`
- `toolbox/3D JSON Payload/main.js`
- `toolbox/3D JSON Payload/README.md`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `toolbox/3D JSON Payload/index.html`: `button[button]#normalize3dMapButton` - Normalize JSON Payload | Processes the current 3D JSON map payload. | Updates tool-owned derived data/report fields that must validate before tools.3d-json-payload publish. |
| `toolbox/3D JSON Payload/index.html`: `button[button]#openHowToUse3dMapButton` - How to Use | Starts 3D JSON map payload import/load. | Reads incoming JSON into the tool-owned 3D JSON map payload only after validation succeeds. |
| `toolbox/3D JSON Payload/index.html`: `textarea#map3dInput` - map3dInput | Edits the current 3D JSON map payload through `map3dInput`. | Updates draft 3D JSON map payload data and requires validation before tools.3d-json-payload publish. |

## Panels And Surfaces Found
- `toolbox/3D JSON Payload/how_to_use.html`: `.tools-platform-surface`
- `toolbox/3D JSON Payload/index.html`: `.app-shell`
- `toolbox/3D JSON Payload/index.html`: `.debug-tool-grid`
- `toolbox/3D JSON Payload/index.html`: `.debug-tool-panel`
- `toolbox/3D JSON Payload/index.html`: `.debug-tool-shell`
- `toolbox/3D JSON Payload/index.html`: `.panel`

## Current Component/Class/Function Inventory
- `toolbox/3D JSON Payload/main.js`: boot3dMapEditor; buildPresetLoadedStatus; getApi; normalizeMapPayload; normalizeMapPayloadAction; normalizeSamplePresetPath; registerToolBootContract; sanitizeNumber; setStatus; tryLoadPresetFromQuery

## Target Controls
Keep:
- payload input controls
- normalize/validate controls
- preview/report controls

Remove or rename:
- normalization output that skips schema validation

Add:
- Validate 3D Payload
- Publish `tools.3d-json-payload`
- field-level payload diagnostics

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for 3D JSON map payload. Current contract baseline: `toolbox/schemas/tools/3d-json-payload.schema.json` (3d-json-payload Payload).
Required keys: `mapPayload`.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: parse incoming 3D JSON map payload and reject it before mutation when invalid
- validate: apply the current 3D JSON map payload contract before export, copy, or publish
- edit/process: mutate only 3D JSON map payload fields owned by 3D JSON Payload
- export/save: serialize the validated 3D JSON map payload as the tools.3d-json-payload output shape
- publish: write only the validated tools.3d-json-payload value produced by 3D JSON Payload
- copy/create payload: create copied payload text from the validated 3D JSON map payload, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts the schema-defined 3D map payload
- normalizes data only inside the tool-owned payload
- publishes only validated 3D JSON

## Invalid JSON Rejection Behavior
- malformed JSON
- payload shape outside `3d-json-payload.schema.json`
- invalid map/object fields
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.3d-json-payload = {
  "mapPayload": "jsonValue"
}
```

## Playwright Expectations
- load `toolbox/3D JSON Payload/index.html` without console errors
- validate/normalize a valid payload
- reject invalid 3D payload JSON

## Manual Test Expectations
- Open `toolbox/3D JSON Payload/index.html` and confirm payload/report controls render.
- Load a valid 3D payload, normalize, validate, export, and publish.
- Try malformed JSON and an invalid map field; each must block publish.

## Known Gaps
- Normalization and publish need distinct states.
- Diagnostics should identify the failing payload path.

## Rebuild Order Priority
core-11: rebuild in the core tool lane after earlier priorities are stable.
