# Physics Sandbox Reengineering Design

Task: PR_26124_022-tighten-tool-design-docs
Classification: rebuildable tool
Core priority: core-14
Source folder: `tools/Physics Sandbox`
Publish target: `tools.physics-sandbox`

## Tool Purpose
Physics payload inspection. This tool owns `physicsBody`, step simulation inputs, validation, export, and publish to `tools.physics-sandbox`.

## Exact Folder/Files Inspected
- `tools/Physics Sandbox/how_to_use.html`
- `tools/Physics Sandbox/index.html`
- `tools/Physics Sandbox/main.js`
- `tools/Physics Sandbox/README.md`

## Exact Current Controls Found
- `tools/Physics Sandbox/index.html`: `button[button]#runPhysicsStepButton` - Run Step
- `tools/Physics Sandbox/index.html`: `textarea#physicsBodyInput` - {
- `tools/Physics Sandbox/main.js`: `runPhysicsStepButton` via runButton
- `tools/Physics Sandbox/main.js`: `physicsSandboxStatus` via statusText
- `tools/Physics Sandbox/main.js`: `physicsBodyInput` via input
- `tools/Physics Sandbox/main.js`: `physicsSandboxOutput` via output

## Current Panels And Surfaces Found
- `tools/Physics Sandbox/index.html`: `.tool-shell-page`
- `tools/Physics Sandbox/index.html`: `.tool-shell-container`
- `tools/Physics Sandbox/index.html`: `.tool-shell`
- `tools/Physics Sandbox/index.html`: `.app-shell`
- `tools/Physics Sandbox/index.html`: `.tool-shell__left`
- `tools/Physics Sandbox/index.html`: `.panel`
- `tools/Physics Sandbox/index.html`: `.debug-tool-panel`
- `tools/Physics Sandbox/index.html`: `.tool-shell__center`
- `tools/Physics Sandbox/index.html`: `.tool-shell__right`

## Exact Current Functions And Classes
- `tools/Physics Sandbox/main.js`: function bootPhysicsSandbox; function buildPresetLoadedStatus; function normalizeSamplePresetPath; function parseBody; function runStep; function setStatus; function tryLoadPresetFromQuery; method getApi; method registerToolBootContract

## Target Controls
Keep:
- Run Step
- physics body JSON textarea
- sandbox preview/output panel

Remove or rename:
- none identified in the current folder

Add:
- Load Physics Body JSON
- Reset Body
- Export Physics Body JSON
- Publish `tools.physics-sandbox`

## JSON Contract Owned By This Tool
Baseline schema: `tools/schemas/tools/physics-sandbox.schema.json`. Required top-level fields: physicsBody. Allowed top-level fields: physicsBody. Additional top-level properties are rejected by the current schema. The tool owns import/load, validation, edit/process, export/save, and publish of this payload. Workspace may pass a launch payload, but nested JSON remains tool-owned.

## Hosted/Launch Payload Boundary
- Launch payloads may seed this tool, but they do not become workspace-owned internals.
- toolState copies may be created later from the published output, but the copied JSON must still match this tool contract.
- Use file/path/name fields for assets. Do not persist `imageDataUrl`.

## Invalid JSON Behavior
- Reject malformed JSON before state mutation.
- Reject missing required fields from the schema baseline.
- Reject unsupported top-level fields when the schema disallows extras.
- Keep export/save/publish disabled until the current payload validates.
- Show a tool-specific error that names the failing field or control group.

## Manual Test Plan
- Paste a valid physics body and run a step.
- Confirm numeric position/velocity updates.
- Try malformed JSON and missing `physicsBody`; export and publish must stay blocked.
