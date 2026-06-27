Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_OVERLAY_BOUNDARY.md

# PLAN_PR_OVERLAY_BOUNDARY

## Goal
Define one clear architectural boundary between Dev Console and Debug Overlay while keeping integration sample-level and non-destructive.

## Single PR Purpose
Dev Console vs Debug Overlay boundary only.

## In Scope
- Role separation for Dev Console and Debug Overlay
- Allowed interactions and prohibited coupling
- Public contract candidates for shared state access
- Ownership matrix for responsibilities
- Validation goals and rollout notes
- Sample-level reference using `samples/Phase 12 - Demo Games/Demo 1205 - Multi-System Demo/MultiSystemDemoScene.js`

## Out of Scope
- Engine core API changes
- Runtime renderer redesign
- Cross-tool refactors outside the sample-level boundary guidance
- New debug feature implementation code

## Boundary Definition
- Dev Console: command and input surface
- Debug Overlay: passive visual telemetry and HUD surface

## Allowed Interactions
1. Console commands may update runtime/debug state through public command pathways.
2. Overlay may read shared diagnostics state through approved selectors/adapters only.
3. Overlay may reflect command outcomes only from shared/public state, never from console-private internals.
4. Sample integration may wire both surfaces to the same runtime snapshot provider.

## Prohibited Coupling
1. Overlay cannot parse or execute console input.
2. Console cannot directly mutate overlay panel internals.
3. No direct cross-calls into private state, private UI buffers, or private render internals.
4. No engine-core additions that exist only to bridge console and overlay.

## Public Contract Candidates
- `getDebugSnapshot()` selector contract
- `runDebugCommand(commandText, context)` command gateway contract
- `debugSnapshotUpdated` event contract (optional)
- `overlayPanelDescriptor` read contract for panel metadata
- structured execution result contract:
  - `status`
  - `title`
  - `lines`
  - `code`
  - `details`

## Ownership Matrix
| Concern | Dev Console | Debug Overlay |
|---|---|---|
| Text input | Owns | Prohibited |
| Command parsing | Owns | Prohibited |
| Command history/autocomplete | Owns | Prohibited |
| Runtime telemetry display | Reads only | Owns |
| HUD panel layout | Prohibited | Owns |
| Panel cycling/visual focus | No | Owns |
| Explicit command actions | Owns | No |
| Passive diagnostics view | Optional | Owns |

## Validation Goals
- Console remains fully usable without overlay visibility.
- Overlay remains fully usable without console focus.
- Shared state flow is explainable through public boundaries only.
- No engine-core changes required.
- Sample-level integration reference remains `MultiSystemDemoScene.js`.

## Rollout Notes
1. Land docs first (this bundle).
2. If needed later, run a focused APPLY PR to replace any private cross-calls with approved selectors/events at sample integration points only.
3. Keep command/input changes in console code and telemetry/HUD changes in overlay code.
