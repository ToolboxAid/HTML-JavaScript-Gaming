# PR 11.170 Workspace Tile State Ledger

## Result
Implemented pass two of the Workspace-hosted shell migration for SVG Asset Studio.

## Hosted State Notification
`toolbox/shared/workspaceShell.js` now posts normalized hosted shell state to the parent Workspace Manager:

- message type: `tools:workspace-shell-state`
- payload: normalized workspace shell state

The posted state includes the existing normalized fields:

- `hosted`
- `toolId`
- `hostContextId`
- `payloadJson`
- `paletteJson`
- `loaded`
- `assetLabel`
- `paletteLabel`
- `statusLabel`
- `contractType`
- `errors`

## Workspace Manager Wiring
`toolbox/Workspace Manager/main.js` now listens for `tools:workspace-shell-state` messages.

Message acceptance requires:

- same origin
- active mounted iframe as `event.source`
- matching `toolId`
- matching `hostContextId`

Only `svg-asset-studio` is wired through this hosted state path in this PR.

## Tile/Badge State Applied
For hosted SVG Asset Studio, Workspace Manager updates the mounted tool label/status from normalized workspace shell state:

- `loaded`
- `assetLabel`
- `statusLabel`
- `contractType`

The mounted iframe also receives dataset markers for focused inspection:

- `data-workspace-shell-loaded`
- `data-workspace-shell-asset-label`
- `data-workspace-shell-contract`

## Shell Boundary
- No import between `workspaceShell.js` and `platformShell.js`.
- No shared mutable shell state between the shells.
- Hosted Workspace Manager tile state does not read shared asset handoff.
- Legacy platform shell behavior remains for standalone/direct-open flows.

## Files Changed
- `toolbox/shared/workspaceShell.js`
- `toolbox/Workspace Manager/main.js`
- `docs_build/dev/reports/pr_11_170_workspace_tile_state_ledger.md`

## Validation
- `node --check toolbox/shared/workspaceShell.js` - PASS
- `node --check toolbox/shared/platformShell.js` - PASS
- `node --check "toolbox/Workspace Manager/main.js"` - PASS
- `node --check "toolbox/SVG Asset Studio/main.js"` - PASS

## Manual UAT
Required browser check:

- Open sample 1902.
- Launch Workspace Manager.
- Mount SVG Asset Studio.
- Confirm SVG tile/badge shows the actual vector asset source name, not `Asset: none`.
- Confirm Vector Map Editor still works.

## Full Samples Smoke
Skipped.

Reason: targeted Workspace Manager hosted tile state wiring; full samples smoke takes about 20 minutes and is not required.
