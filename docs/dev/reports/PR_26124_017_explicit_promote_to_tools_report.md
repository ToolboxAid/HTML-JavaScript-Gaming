# PR_26124_017

## Scope
- `tools/workspace-v2/index.html`
- `tools/workspace-v2/index.js`
- `tests/ui/workspace-v2.asset-manager.spec.js`
- `tests/playwright/workspace-v2.validation.spec.js`

## Changes
- Added explicit active promotion action in Workspace V2 Producer:
  - `Promote Active Tool State to Tools`
- Added explicit saved-entry promotion action per Tool State Library row:
  - `Promote to Tools`
- Promotion behavior:
  - validates selected tool state
  - reads `toolState.toolId`
  - reads `toolState.payloadJson`
  - writes cloned payload into `tools[toolId]` in workspace manifest JSON
- Guard behavior:
  - blocks `palette-manager-v2` promotion
  - blocks invalid tool states
  - keeps `tools.workspace-v2` and `tools.palette-browser` intact
  - keeps `activeToolState` and `savedToolStates` unchanged
  - no auto-promotion on save/export

## Validation
- `node --check tools/workspace-v2/index.js` -> pass
- `node --check tests/ui/workspace-v2.asset-manager.spec.js` -> pass
- `node --check tests/playwright/workspace-v2.validation.spec.js` -> pass
- `npm run test:workspace-v2` -> pass (`20 passed`, `0 failed`)

## Notes
- Full samples smoke was skipped because this PR is limited to Workspace V2 tool-state promotion actions and Playwright coverage updates.
