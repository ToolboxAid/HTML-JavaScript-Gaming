# BUILD_PR_LEVEL_11_179_WRITE_SVG_TILE_FROM_WORKSPACE_SHELL

## Purpose
Add the single correct writer for hosted SVG tile state.

## Current State
After PR 11.178:
- legacy platformShell badge row is blocked/removed for hosted tools
- assetUsageIntegration shared read/write path is disabled in hosted mode
- shared handoff no longer owns SVG state

That means the bad writers are gone.

Now Workspace Manager must write the SVG tile label from `workspaceShell.js` state only.

## Correct Data Flow
```text
SVG Asset Studio hosted iframe
  -> workspaceShell.js
  -> payloadJson.vectorAssetDocument
  -> normalized state
  -> postMessage tools:workspace-shell-state
  -> Workspace Manager
  -> SVG tile label/status
```

## Scope
One PR purpose only:
- Create the correct hosted SVG workspace-shell write path.

Do not modify schemas.
Do not modify sample 1902 JSON.
Do not restore shared handoff.
Do not use assetUsageIntegration.
Do not route hosted SVG through platformShell.
Do not migrate all tools.

## Implementation Requirements

### 1. Ensure workspaceShell has a public init
File:
`src/shared/toolbox/workspaceShell.js`

Export a clear initializer, for example:
`initWorkspaceShell()`

It must:
- detect hosted mode from URL:
  - `hosted=1`
  - `hostToolId`
  - `hostContextId`
- read hosted context using the existing host context utility
- normalize state for `svg-asset-studio`

SVG normalized state:
- `toolId: "svg-asset-studio"`
- `hostContextId`
- `contractType: "vectorAssetDocument"`
- `loaded: true` when `payloadJson.vectorAssetDocument.svgText` is non-empty
- `assetLabel: vectorAssetDocument.sourceName || "Inline SVG"`
- `statusLabel: "Loaded"` when loaded
- `errors: []`

If not loaded:
- `loaded: false`
- `assetLabel: ""`
- `statusLabel` must be actionable
- `errors` contains missing contract reason

Required log:
`[WORKSPACE_SHELL_STATE]`

### 2. SVG hosted entry must call workspaceShell
File:
`toolbox/SVG Asset Studio/main.js`

In hosted SVG mode:
- log `[SVG_HOSTED_WORKSPACE_ENTRY]`
- call `initWorkspaceShell()`
- do not use platformShell or assetUsageIntegration for hosted SVG tile labels

### 3. workspaceShell sends parent message
When normalized state is created, post to parent:

Message:
```js
{
  type: "tools:workspace-shell-state",
  payload: state
}
```

Required log before send:
`[SVG_POSTMESSAGE_SEND]`

### 4. Workspace Manager receives and writes tile
File:
`toolbox/Workspace Manager/main.js`

Listen for message type:
`tools:workspace-shell-state`

When payload is for:
`toolId === "svg-asset-studio"`

Match by `hostContextId` if the mounted tile tracks it. If no existing hostContextId mapping is available, Codex must add the smallest mapping when launching/mounting the tool.

On loaded state:
- set SVG tile asset label to `assetLabel`
- set SVG tile status to `statusLabel`
- mark tile loaded/active if existing model supports it
- log `[SVG_POSTMESSAGE_RECEIVE]`
- log `[SVG_TILE_WRITE]`

On error state:
- show actionable status from `statusLabel`
- do not show `Asset: none`

### 5. No legacy fallback
Do not fallback to:
- shared asset handoff
- shared palette handoff
- platformShell badge value
- guessed sample names
- palette-first ordering

## Acceptance
Manual UAT on sample 1902:

Expected console:
- `[SVG_HOSTED_WORKSPACE_ENTRY]`
- `[WORKSPACE_SHELL_STATE]`
- `[SVG_POSTMESSAGE_SEND]`
- `[SVG_POSTMESSAGE_RECEIVE]`
- `[SVG_TILE_WRITE]`

Expected UI:
- SVG tile shows `Asset: sample-0901-ship.svg` or actual `sourceName`
- SVG does not show `Asset: none`
- legacy platformShell badge row remains removed/blocked
- Vector Map Editor still works

Expected no logs:
- no hosted SVG `renderToolAssetBadge -> none`
- no hosted SVG shared asset handoff read/write
- no hosted SVG palette-first dependency

## Validation
Run:
- `node --check src/shared/toolbox/workspaceShell.js`
- `node --check "toolbox/SVG Asset Studio/main.js"`
- `node --check "toolbox/Workspace Manager/main.js"`
- `node --check src/shared/toolbox/platformShell.js`
- `node --check src/shared/toolbox/assetUsageIntegration.js`

Full samples smoke:
- Skip.
- Reason: targeted hosted SVG tile write path; full samples smoke takes about 20 minutes and is not required.

## Report
Create:
`docs_build/dev/reports/pr_11_179_validation.md`

Include:
- files changed
- console evidence
- tile label result
- targeted validation result
- full samples smoke skipped reason
