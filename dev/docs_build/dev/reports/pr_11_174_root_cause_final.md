# PR 11.174 Final Root Cause

## Final proven issue
`workspaceShell.js` and the Workspace Manager bridge exist, but SVG Asset Studio does not enter the workspace shell path.

The active path remains:
- SVG hosted iframe
- legacy platformShell badge renderer
- shared handoff reads vector-map asset
- SVG badge renders `Asset: none`

## Fix
Wire `toolbox/SVG Asset Studio/main.js` hosted mode directly to `toolbox/shared/workspaceShell.js`.

## Why this should end the loop
Previous PRs tried to:
- patch handoff reads
- patch platformShell label resolution
- add workspaceShell
- add Workspace Manager bridge

But none changed the actual SVG entry path.

This PR changes the missing point of control: SVG hosted entry.
