# Physics Sandbox Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: rebuildable tool
Core priority: core-14
Source folder: `tools/Physics Sandbox`
Publish target: `tools.physics-sandbox`

## Tool Purpose
Physics payload inspection. Physics Sandbox owns `physicsBody`, step simulation inputs, validation, export, and publish to `tools.physics-sandbox`.

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
Owned JSON is the physics-sandbox payload. Required field is `physicsBody`; no other top-level fields are allowed. Physics body data owns position, velocity, acceleration, drag, and step output values.

## Publish Output
Publish only to `tools.physics-sandbox`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- missing `physicsBody`
- nonnumeric body movement values
- physics values the stepper cannot process
- unsupported top-level fields

## Manual Test Plan
- Paste a valid physics body and run a step.
- Confirm numeric position/velocity updates.
- Try malformed JSON and missing `physicsBody`; export and publish must stay blocked.
