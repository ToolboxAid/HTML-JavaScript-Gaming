# PR 11.172 Root Cause Lock

## Evidence
PR 11.171 console trace showed:

- Workspace manifest accepted `svg-asset-studio`.
- Shared handoff repeatedly read the vector map asset, not the SVG asset.
- `platformShell.js:1507 renderToolAssetBadge` wrote:
  - `toolId: 'svg-asset-studio'`
  - `label: 'none'`
- No workspace-shell state logs appeared:
  - no `[WORKSPACE_SHELL_STATE]`
  - no `[SVG_POSTMESSAGE_SEND]`
  - no `[SVG_POSTMESSAGE_RECEIVE]`

## Conclusion
`workspaceShell.js` is not on the active hosted SVG path, and `platformShell.js` remains the active bad writer.

## Fix Constraint
Do not improve the old writer.
Remove the old writer from hosted SVG.

## Required Outcome
Hosted SVG uses:
- session context
- SVG contract
- workspaceShell normalized state
- parent postMessage
- Workspace Manager tile update

Hosted SVG does not use:
- platformShell badge rendering
- shared asset handoff
- vector-map global handoff
- fallback labels
