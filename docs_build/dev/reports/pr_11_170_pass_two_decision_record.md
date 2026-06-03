# PR 11.170 Pass Two Decision Record

## Decision
After creating `workspaceShell.js`, the next boundary to fix is Workspace Manager tile rendering.

## Why
If the SVG tool can load its contract but the Workspace tile still says `Asset: none`, then the remaining failure is not tool data. It is the tile still reading from the legacy badge/handoff path.

## New Rule
Workspace Manager-hosted tile state must come from normalized `workspaceShell.js` state.

## State Channel
The preferred minimal channel is a specific `postMessage` event from hosted iframe to parent Workspace Manager:

`tools:workspace-shell-state`

This avoids:
- platformShell coupling
- shared asset handoff
- global fallback paths
- guessed data labels

## Pass Two Scope
SVG Asset Studio only.

Once SVG passes, repeat the same pattern tool-by-tool:
1. Vector Map Editor
2. Tile Map Editor
3. Palette tools
4. Remaining Workspace-hosted tools
