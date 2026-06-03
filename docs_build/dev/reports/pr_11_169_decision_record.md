# PR 11.169 Decision Record

## Decision
Stop using the legacy platform shell path as the primary owner for Workspace-hosted tool data.

Create a new `tools/shared/workspaceShell.js` for Workspace Manager-hosted tools.

## Independence Rule
`workspaceShell.js` and `platformShell.js` are parallel shells.

There must be no:
- import from one shell to the other
- code copy from platform shell into workspace shell
- shared mutable shell state
- exported platform shell helpers used by workspace shell
- hosted Workspace Manager tile/badge state routed through platform shell

## Reason
Repeated attempts from PR 11.154 through PR 11.168 failed to make the SVG badge show the loaded asset even though the tool payload loads. This shows the legacy shell/handoff path is the wrong abstraction.

## New Rule
For Workspace-hosted tools:

- hosted session context is the source of truth
- tool contract payload proves data loaded
- tile/badge update happens after loaded state is proven
- shared/global handoff is not used for hosted contract data
- platform shell is not part of hosted workspace shell state

## Migration Pattern
Start with SVG Asset Studio only.

After SVG is proven:
1. Vector Map Editor
2. Tile Map Editor
3. Palette tools
4. Remaining Workspace-hosted tools

## Legacy Handling
`platformShell.js` remains for standalone/non-hosted tool paths until each hosted tool is migrated and validated.
