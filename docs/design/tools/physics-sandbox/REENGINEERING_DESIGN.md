# Physics Sandbox Reengineering Design (physics-sandbox)

## Purpose
- Minimal reusable physics helper sandbox for acceleration, drag, and integration previews.

## Current V1 Capability
- Active in registry-driven tools surface.
- Runtime entry point: `Physics Sandbox/index.html`.
- Runtime implementation file: `tools/Physics Sandbox/main.js`.

## Current V2 / Workspace Status
- Legacy/first-class tool present in registry; not fully mapped into Workspace V2 toolState lane.
- Workspace integration classification:
  - global tool: no
  - toolState-capable tool: no
  - published `tools.*` output candidate: yes
- Readiness: Needs additional schema/contract alignment

## Expected JSON Schema/Input
- Schema ref: `tools/schemas/tools/physics-sandbox.schema.json`. Required root keys: `physicsBody`. Defined root properties: `physicsBody`.

## Valid JSON Load Behavior (Target)
- Parse incoming tool payload once.
- Validate against the tool schema/contract before rendering.
- Render the fully valid state and expose clear contract readout text.

## Invalid JSON Rejection Behavior (Target)
- Reject before rendering domain state.
- Show one clear actionable invalid message.
- Avoid fallback/default injections and avoid mutating inbound payload structure.

## Current Components/Functions
- Top-level functions: `normalizeSamplePresetPath()`, `buildPresetLoadedStatus()`, `setStatus()`, `parseBody()`, `runStep()`, `bootPhysicsSandbox()`.

## Target Components/Functions
- Separate explicit JSON contract functions (`import`, `validate`, `load`, `export`) from view-only rendering methods.
- Keep tool-specific logic inside the tool runtime; avoid Workspace V2 owning tool-specific compare/merge/edit behavior.
- Keep one visible invalid-state path that blocks render before any partial state draws.

## Tool-Owned JSON Functions
- Import: `buildPresetLoadedStatus()`, `parseBody()`
- Validate: `normalizeSamplePresetPath()`
- Edit/process: No explicit edit/process helper surfaced in current file inventory.
- Export: No explicit export helper surfaced in current file inventory.
- Add/copy to Workspace toolState: Not yet explicit in current tool runtime.
- Publish to `tools.physics-sandbox`: Supported as target ownership in design; concrete publish path varies by tool.
- Compare/merge for own schema: Not currently tool-local; Workspace V2 has cross-toolState compare/merge UI today.

## Workspace Integration Contract
- Workspace launch path exists via tools index/workspace-manager registry entry points.
- Explicit Workspace V2 toolState contract is not yet completed for this tool.

## Playwright Expectations
- Valid payload path should show visible valid-state surface.
- Invalid payload path should show visible invalid-state surface and hide valid state.
- Workspace launch handoff should open the tool with hostContext/toolState payload when applicable.

## Manual Test Expectations
- Launch from `tools/index.html` and confirm baseline UI renders.
- Launch from Workspace V2 when applicable and confirm payload handoff path.
- Provide an invalid JSON contract and confirm the tool blocks render with explicit error.

## Known Gaps
- Tool is not fully in the current Workspace V2 toolState-capable Playwright lane.
