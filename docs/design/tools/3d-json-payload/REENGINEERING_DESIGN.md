# 3D JSON Payload Reengineering Design (3d-json-payload)

## Purpose
- 3D payload normalization utility for point/segment JSON documents with deterministic sanitized output.

## Current V1 Capability
- Active in registry-driven tools surface.
- Runtime entry point: `3D JSON Payload/index.html`.
- Runtime implementation file: `tools/3D JSON Payload/main.js`.

## Current V2 / Workspace Status
- Legacy/first-class tool present in registry; not fully mapped into Workspace V2 toolState lane.
- Workspace integration classification:
  - global tool: no
  - toolState-capable tool: no
  - published `tools.*` output candidate: yes
- Readiness: Needs additional schema/contract alignment

## Expected JSON Schema/Input
- Schema ref: `tools/schemas/tools/3d-json-payload.schema.json`. Required root keys: `mapPayload`. Defined root properties: `mapPayload`.

## Valid JSON Load Behavior (Target)
- Parse incoming tool payload once.
- Validate against the tool schema/contract before rendering.
- Render the fully valid state and expose clear contract readout text.

## Invalid JSON Rejection Behavior (Target)
- Reject before rendering domain state.
- Show one clear actionable invalid message.
- Avoid fallback/default injections and avoid mutating inbound payload structure.

## Current Components/Functions
- Top-level functions: `sanitizeNumber()`, `normalizeMapPayload()`, `normalizeSamplePresetPath()`, `buildPresetLoadedStatus()`, `setStatus()`, `normalizeMapPayloadAction()`, `boot3dMapEditor()`.

## Target Components/Functions
- Separate explicit JSON contract functions (`import`, `validate`, `load`, `export`) from view-only rendering methods.
- Keep tool-specific logic inside the tool runtime; avoid Workspace V2 owning tool-specific compare/merge/edit behavior.
- Keep one visible invalid-state path that blocks render before any partial state draws.

## Tool-Owned JSON Functions
- Import: `normalizeMapPayload()`, `buildPresetLoadedStatus()`, `normalizeMapPayloadAction()`
- Validate: `sanitizeNumber()`, `normalizeMapPayload()`, `normalizeSamplePresetPath()`, `normalizeMapPayloadAction()`
- Edit/process: `boot3dMapEditor()`
- Export: No explicit export helper surfaced in current file inventory.
- Add/copy to Workspace toolState: Not yet explicit in current tool runtime.
- Publish to `tools.3d-json-payload`: Supported as target ownership in design; concrete publish path varies by tool.
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
