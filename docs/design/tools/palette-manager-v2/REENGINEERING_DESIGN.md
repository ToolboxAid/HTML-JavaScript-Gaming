# palette-manager-v2 Reengineering Design (palette-manager-v2)

## Purpose
- See tool runtime file for current behavior.

## Current V1 Capability
- Not part of V1 active registry.
- Runtime entry point: `palette-manager-v2/index.html`.
- Runtime implementation file: `tools/palette-manager-v2/index.js`.

## Current V2 / Workspace Status
- PASS in current Workspace V2 audit coverage.
- Workspace integration classification:
  - global tool: yes
  - toolState-capable tool: no
  - published `tools.*` output candidate: no
- Readiness: Needs additional schema/contract alignment

## Expected JSON Schema/Input
- Current fixture contract (no dedicated schema file in `tools/schemas/tools`): `version`, `toolId`, and `payloadJson` with `payloadJson.paletteDocument`.

## Valid JSON Load Behavior (Target)
- Parse incoming tool payload once.
- Validate against the tool schema/contract before rendering.
- Render the fully valid state and expose clear contract readout text.

## Invalid JSON Rejection Behavior (Target)
- Reject before rendering domain state.
- Show one clear actionable invalid message.
- Avoid fallback/default injections and avoid mutating inbound payload structure.

## Current Components/Functions
- Class `PaletteManagerV2` in `tools/palette-manager-v2/index.js`.
- Class methods: `constructor()`, `goBack()`, `openVectorMapEditorV2()`, `handleNavigationState()`, `readUrlState()`, `toolLabel()`, `renderNavigation()`, `buildToolUrl()`, `optionalUrlStateSummary()`, `handleSessionVersion()`, `buildRuntimeSnapshot()`, `registerSnapshotHook()`, `logStructuredError()`, `readSession()`, `loadContract()`, `renderPalette()`, `renderMissing()`, `renderError()`.

## Target Components/Functions
- Separate explicit JSON contract functions (`import`, `validate`, `load`, `export`) from view-only rendering methods.
- Keep tool-specific logic inside the tool runtime; avoid Workspace V2 owning tool-specific compare/merge/edit behavior.
- Keep one visible invalid-state path that blocks render before any partial state draws.

## Tool-Owned JSON Functions
- Import: `readUrlState()`, `readSession()`, `loadContract()`
- Validate: No explicit validate helper surfaced in current file inventory.
- Edit/process: `openVectorMapEditorV2()`, `renderNavigation()`, `renderPalette()`, `renderMissing()`, `renderError()`
- Export: No explicit export helper surfaced in current file inventory.
- Add/copy to Workspace toolState: Not yet explicit in current tool runtime.
- Publish to `tools.palette-manager-v2`: Not currently a published tools.* ownership target.
- Compare/merge for own schema: Not currently tool-local; Workspace V2 has cross-toolState compare/merge UI today.

## Workspace Integration Contract
- Workspace passes: `hostContextId` URL param + toolState payload for validation/render.
- Tool returns/publishes: read-only render; no Workspace publish path in current lane.

## Playwright Expectations
- Valid payload path should show visible valid-state surface.
- Invalid payload path should show visible invalid-state surface and hide valid state.
- Workspace launch handoff should open the tool with hostContext/toolState payload when applicable.

## Manual Test Expectations
- Launch from `tools/index.html` and confirm baseline UI renders.
- Launch from Workspace V2 when applicable and confirm payload handoff path.
- Provide an invalid JSON contract and confirm the tool blocks render with explicit error.

## Known Gaps
- Palette manager is intentionally excluded from Workspace V2 toolState producer flow; palette ownership is global via `tools.palette-browser`.
