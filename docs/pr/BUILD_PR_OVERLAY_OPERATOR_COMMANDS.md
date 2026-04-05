Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_OVERLAY_OPERATOR_COMMANDS.md

# BUILD_PR_OVERLAY_OPERATOR_COMMANDS

## Objective
Implement debug-only `overlay.*` operator commands through the Dev Console command registry using approved public overlay/registry APIs.

## Implementation Scope
- Add `tools/dev/commandPacks/overlayCommandPack.js`
- Wire pack into `tools/dev/devConsoleIntegration.js`
- Keep integration sample-level (`MultiSystemDemoScene.js` remains the target reference)

## API Boundary
Allowed public calls:
- `runtime.getState()`
- `runtime.showOverlay()` / `runtime.hideOverlay()`
- `runtime.panelRegistry.getOrderedPanels(includeDisabled)`
- `runtime.panelRegistry.setPanelEnabled(panelId, enabled)`
- `runtime.panelRegistry.getCount()`

Not allowed:
- private overlay host field access
- direct panel object mutation
- engine core changes

## Commands Implemented
- `overlay.help`
- `overlay.list`
- `overlay.status`
- `overlay.show <panelId>`
- `overlay.hide <panelId>`
- `overlay.toggle <panelId>`
- `overlay.showAll`
- `overlay.hideAll`
- `overlay.order`

## Deterministic Output Rules
- panel listings use ordered registry snapshots
- list/order rows are stable and index-prefixed
- status lines use key=value format
- failures include explicit error code and available panel IDs when relevant

## Safe Failure Rules
- missing runtime/registry -> failed result with explicit code
- missing/unknown panel ID -> `OVERLAY_PANEL_NOT_FOUND`
- failed state set -> `OVERLAY_PANEL_SET_FAILED`

## Validation Evidence
- `node --check tools/dev/commandPacks/overlayCommandPack.js` passed
- `node --check tools/dev/devConsoleIntegration.js` passed
- sample command harness execution passed for:
  - help/list/status/order
  - show/hide/toggle
  - showAll/hideAll
  - invalid panel ID failure path

## APPLY Guidance
Apply scope stays surgical:
- keep command logic isolated to Dev Console pack wiring
- keep overlay interaction read/toggle-only through public APIs
- keep behavior debug-only and sample-aligned
