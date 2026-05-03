# tilemap-studio-v2 Reengineering Design (tilemap-studio-v2)

## Purpose
- See tool runtime file for current behavior.

## Current V1 Capability
- Not part of V1 active registry.
- Runtime entry point: `tilemap-studio-v2/index.html`.
- Runtime implementation file: `tools/tilemap-studio-v2/index.js`.

## Current V2 / Workspace Status
- PASS in current Workspace V2 audit coverage.
- Workspace integration classification:
  - global tool: no
  - toolState-capable tool: yes
  - published `tools.*` output candidate: yes
- Readiness: In active lane

## Expected JSON Schema/Input
- Current fixture contract (no dedicated schema file in `tools/schemas/tools`): `version`, `toolId`, and `payloadJson` with `payloadJson.tileMapDocument`.

## Valid JSON Load Behavior (Target)
- Parse incoming tool payload once.
- Validate against the tool schema/contract before rendering.
- Render the fully valid state and expose clear contract readout text.

## Invalid JSON Rejection Behavior (Target)
- Reject before rendering domain state.
- Show one clear actionable invalid message.
- Avoid fallback/default injections and avoid mutating inbound payload structure.

## Current Components/Functions
- Class `TilemapStudioV2` in `tools/tilemap-studio-v2/index.js`.
- Class methods: `constructor()`, `goBack()`, `openAssetBrowserV2()`, `handleNavigationState()`, `readUrlState()`, `toolLabel()`, `renderNavigation()`, `buildToolUrl()`, `optionalUrlStateSummary()`, `handleSessionVersion()`, `buildRuntimeSnapshot()`, `registerSnapshotHook()`, `logStructuredError()`, `readSession()`, `loadContract()`, `renderTilemap()`, `renderMissing()`, `renderError()`.

## Target Components/Functions
- Separate explicit JSON contract functions (`import`, `validate`, `load`, `export`) from view-only rendering methods.
- Keep tool-specific logic inside the tool runtime; avoid Workspace V2 owning tool-specific compare/merge/edit behavior.
- Keep one visible invalid-state path that blocks render before any partial state draws.

## Tool-Owned JSON Functions
- Import: `readUrlState()`, `readSession()`, `loadContract()`
- Validate: No explicit validate helper surfaced in current file inventory.
- Edit/process: `renderNavigation()`, `renderTilemap()`, `renderMissing()`, `renderError()`
- Export: No explicit export helper surfaced in current file inventory.
- Add/copy to Workspace toolState: Not yet explicit in current tool runtime.
- Publish to `tools.tilemap-studio-v2`: Supported as target ownership in design; concrete publish path varies by tool.
- Compare/merge for own schema: Not currently tool-local; Workspace V2 has cross-toolState compare/merge UI today.

## Workspace Integration Contract
- Workspace passes: `hostContextId` URL param + `sessionStorage[hostContextId]` toolState payload.
- Tool returns/publishes: current runtime writes are mostly read-only; explicit publish back is coordinated in Workspace V2 `promote*` actions.

## Playwright Expectations
- Valid payload path should show visible valid-state surface.
- Invalid payload path should show visible invalid-state surface and hide valid state.
- Workspace launch handoff should open the tool with hostContext/toolState payload when applicable.

## Manual Test Expectations
- Launch from `tools/index.html` and confirm baseline UI renders.
- Launch from Workspace V2 when applicable and confirm payload handoff path.
- Provide an invalid JSON contract and confirm the tool blocks render with explicit error.

## Known Gaps
- No additional gaps recorded in this pass beyond normal contract hardening and test expansion.
