# BUILD_PR_LEVEL_11_180_FIX_SVG_LAUNCH_ENTRY_PATH

## Purpose
Fix the reason `[SVG_HOSTED_WORKSPACE_ENTRY]` never appears: SVG Asset Studio is not reaching the hosted SVG entry branch.

## Proven State
After PR 11.179:
- Vector Map Editor hosted path logs correctly.
- `platformShell` hosted badge row is blocked for Vector Map Editor.
- No SVG hosted entry log appears.
- No workspaceShell SVG state appears.

Therefore the SVG tool is either:
1. not being launched/mounted when clicked, or
2. launched with the wrong URL params, or
3. launched through the wrong entry file/path, or
4. `hostToolId` does not equal `svg-asset-studio`.

## Scope
One PR purpose only:
- Trace and fix SVG Asset Studio launch URL/entry path from Workspace Manager.

Do not modify schemas.
Do not modify sample 1902 JSON.
Do not change vector map behavior.
Do not restore shared handoff.
Do not add fallback labels.

## Implementation Requirements

### 1. Log every Workspace Manager tool launch
In `tools/Workspace Manager/main.js`, before launching/mounting any tool, log:

`[WORKSPACE_TOOL_LAUNCH]`

Payload:
- requestedToolId
- normalizedToolId
- entryUrl / iframe src
- hostToolId param
- hostContextId
- hosted param
- hasPayloadJson
- payload keys

### 2. Log specifically for SVG
When requested/normalized tool is `svg-asset-studio`, log:

`[SVG_LAUNCH_REQUEST]`

Payload:
- toolId
- registry entry path/url
- iframe src
- hostToolId
- hostContextId
- payloadJson.vectorAssetDocument exists
- sourceName
- svgText length

### 3. Fix launch params
Ensure SVG iframe URL includes:
- `hosted=1`
- `hostToolId=svg-asset-studio`
- `hostContextId=<non-empty>`

### 4. Fix launch path if wrong
Ensure SVG launches the actual entry that loads:

`tools/SVG Asset Studio/main.js`

If Workspace Manager launches a different HTML/JS entry for SVG, wire the hosted guard there too or route to the correct entry.

### 5. Ensure SVG hosted guard condition matches actual params
In `tools/SVG Asset Studio/main.js`, log at top before any branching:

`[SVG_ENTRY_TOP]`

Payload:
- location.href
- hosted
- hostToolId
- hostContextId

Then ensure hosted detection matches the actual URL params.

### 6. Keep legacy blocked
Do not remove the hosted platformShell badge-row block.
Do not re-enable assetUsageIntegration hosted reads/writes.

## Acceptance
Manual UAT:

Click/mount SVG Asset Studio in sample 1902.

Expected logs:
- `[WORKSPACE_TOOL_LAUNCH]` with requested/normalized `svg-asset-studio`
- `[SVG_LAUNCH_REQUEST]`
- `[SVG_ENTRY_TOP]`
- `[SVG_HOSTED_WORKSPACE_ENTRY]`
- `[WORKSPACE_SHELL_STATE]`
- `[SVG_POSTMESSAGE_SEND]`
- `[SVG_POSTMESSAGE_RECEIVE]`
- `[SVG_TILE_WRITE]`

Expected UI:
- SVG tile shows actual `sourceName`
- no `Asset: none`

## Validation
Run:
- `node --check "tools/Workspace Manager/main.js"`
- `node --check "tools/SVG Asset Studio/main.js"`
- `node --check tools/shared/workspaceShell.js`
- `node --check tools/shared/platformShell.js`

Full samples smoke:
- Skip.
- Reason: targeted SVG launch path and hosted entry verification; full samples smoke takes about 20 minutes and is not required.
