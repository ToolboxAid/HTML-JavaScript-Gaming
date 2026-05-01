# PR 11.179 Design Lock

## Decision
Now that legacy writers are removed/disabled, hosted SVG tile state must have exactly one writer: Workspace Manager receiving `workspaceShell.js` state.

## Source of Truth
`payloadJson.vectorAssetDocument`

## Writer
Workspace Manager tile update handler for `tools:workspace-shell-state`

## Forbidden Writers
- platformShell hosted badge renderer
- assetUsageIntegration shared handoff
- palette-first dependency
- fallback sample labels

## Expected Result
`Asset: sample-0901-ship.svg` or actual `vectorAssetDocument.sourceName`.
