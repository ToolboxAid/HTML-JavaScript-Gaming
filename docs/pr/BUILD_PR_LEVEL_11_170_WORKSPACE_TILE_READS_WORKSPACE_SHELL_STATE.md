# BUILD_PR_LEVEL_11_170_WORKSPACE_TILE_READS_WORKSPACE_SHELL_STATE

## Purpose
Complete pass two of the Workspace-hosted shell migration by making Workspace Manager tiles read `workspaceShell.js` normalized state instead of legacy platform-shell badge/handoff state.

## Context
PR 11.169 pass one creates an independent contract-first `tools/shared/workspaceShell.js`.

If SVG Asset Studio still shows:

`Asset: none`

then the tool contract is loading, but the Workspace tile/badge renderer is still reading the old source.

## Correct Ownership
For Workspace Manager-hosted tools:

1. Hosted tool receives session context.
2. `workspaceShell.js` normalizes contract state.
3. Hosted tool publishes/returns normalized workspace state.
4. Workspace Manager tile reads that normalized workspace state.
5. Tile renders label/status from that state.

Legacy `platformShell.js` must not be used for hosted tile state.

## Hard Architecture Rule
`workspaceShell.js` and `platformShell.js` remain independent.

Codex must not:
- import `platformShell.js` into `workspaceShell.js`
- import `workspaceShell.js` into `platformShell.js`
- copy code between them
- export platform helpers for workspace use
- route hosted Workspace tile state through platform shell
- use shared asset handoff as hosted source of truth

## Scope
One PR purpose only:
- Wire Workspace Manager tile rendering to Workspace-hosted normalized state for SVG Asset Studio.

Do not migrate all 17 tools yet.
Do not modify schemas.
Do not modify sample 1902 JSON.
Do not rewrite unrelated shell/fullscreen/nav code.

## Implementation Requirements

### 1. Inspect pass-one implementation
Review:
- `tools/shared/workspaceShell.js`
- `tools/Workspace Manager/main.js`
- SVG Asset Studio hosted entry/init file

Confirm where normalized workspace state is exposed after PR 11.169.

### 2. Add explicit hosted tile state channel
If none exists, create one minimal channel for hosted tools to report normalized state to Workspace Manager.

Allowed pattern:
- `postMessage` from hosted iframe to parent Workspace Manager
- message type must be specific, e.g. `tools:workspace-shell-state`
- message payload must be the normalized state from `workspaceShell.js`

Do not use global shared asset handoff.

### 3. Workspace Manager listens and updates tile
In `tools/Workspace Manager/main.js`:
- listen for the specific workspace shell state message
- validate the message has:
  - `toolId`
  - `hostContextId`
  - `loaded`
  - `assetLabel` or `statusLabel`
- match the message to the correct mounted tile/tool instance
- update the tile/badge from that normalized state

### 4. SVG first
For this PR, only SVG Asset Studio must be required to publish enough state to update the tile.

Expected SVG state:
- `toolId: "svg-asset-studio"`
- `contractType: "vectorAssetDocument"`
- `loaded: true`
- `assetLabel: "sample-0901-ship.svg"` or actual `sourceName`

### 5. Failure state
If SVG contract is missing/incomplete, tile must show an actionable error, not silently `Asset: none`.

`Asset: none` is only valid when contract state proves no asset exists.

### 6. Dead code tracking
Create/update:

`docs/dev/reports/pr_11_170_workspace_tile_state_ledger.md`

Classify relevant old tile/badge paths:

- KEEP_STANDALONE
- REPLACE_WITH_WORKSPACE_STATE
- WRONG_OWNER
- DELETE_LATER
- UNKNOWN

Do not delete UNKNOWN in this PR.

## Acceptance
- Sample 1902 Workspace Manager opens.
- SVG Asset Studio hosted tool loads contract data.
- Workspace tile/badge updates from `workspaceShell.js` normalized state.
- SVG tile/badge shows actual source name, not `Asset: none`.
- No platformShell/workspaceShell import/copy/layering.
- Vector Map Editor still works.
- No new console errors.
- Targeted syntax checks pass.
- Full samples smoke skipped with documented reason.

## Validation
Run:
- `node --check tools/shared/workspaceShell.js`
- `node --check tools/shared/platformShell.js`
- `node --check "tools/Workspace Manager/main.js"`
- `node --check "tools/SVG Asset Studio/main.js"`

Manual:
- open sample 1902
- launch Workspace Manager
- mount SVG Asset Studio
- verify the Workspace tile/badge updates from the normalized workspace shell state
- verify it does not show `Asset: none` when `vectorAssetDocument.svgText` exists
