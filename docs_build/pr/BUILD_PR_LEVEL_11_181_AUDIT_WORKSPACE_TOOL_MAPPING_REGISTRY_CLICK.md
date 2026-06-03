# BUILD_PR_LEVEL_11_181_AUDIT_WORKSPACE_TOOL_MAPPING_REGISTRY_CLICK

## Purpose
Fix the upstream reason SVG Asset Studio is not launching: audit and correct Workspace Manager tool mapping in this order:

1. tool registry
2. rendered tile metadata
3. click handler dispatch
4. launch request

## Proven State
Recent logs show Workspace Manager launches only:

`requestedToolId: vector-map-editor`

No SVG launch logs appear:
- no `[WORKSPACE_TOOL_LAUNCH] svg-asset-studio`
- no `[SVG_LAUNCH_REQUEST]`
- no `[SVG_ENTRY_TOP]`
- no `[SVG_HOSTED_WORKSPACE_ENTRY]`

Therefore the current problem is upstream of shell/runtime:
SVG is not being launched.

## Scope
One PR purpose only:
- Ensure clicking SVG Asset Studio launches `svg-asset-studio`, not `vector-map-editor`.

Do not modify schemas.
Do not modify sample 1902 JSON.
Do not modify SVG payload parsing.
Do not change platformShell/workspaceShell behavior.
Do not restore shared handoff.
Do not migrate all tools.

## Implementation Requirements

### 1. Registry audit
Inspect the registry source used by Workspace Manager.

Verify:
- `svg-asset-studio` exists
- display name is SVG Asset Studio
- entry URL points to SVG Asset Studio, not Vector Map Editor
- normalized ID remains `svg-asset-studio`

Add log during registry resolution:

`[WORKSPACE_REGISTRY_RESOLVE]`

Payload:
- requestedToolId
- normalizedToolId
- registryToolId
- displayName
- entryUrl
- isSvg

### 2. Rendered tile audit
Where Workspace Manager renders the tool list/buttons/tiles, ensure each tile/button gets its own correct tool id.

For SVG tile/button:
- `data-tool-id="svg-asset-studio"`
- display text includes `SVG Asset Studio`
- click target is not reused from Vector Map Editor

Add log during render:

`[WORKSPACE_TOOL_TILE_RENDER]`

Payload:
- toolId
- displayName
- entryUrl
- dataToolId

### 3. Click handler audit
In the Workspace Manager click handler, log before any launch:

`[WORKSPACE_TOOL_CLICK]`

Payload:
- clickedText
- datasetToolId
- resolvedToolId
- eventTarget
- closestToolId

Fix any handler that:
- reads the first tile
- uses stale closure state
- uses active/current tool instead of clicked tile
- defaults to vector-map-editor
- normalizes SVG incorrectly

### 4. Launch audit
Before launch, keep existing:

`[WORKSPACE_TOOL_LAUNCH]`

For SVG specifically, log:

`[SVG_LAUNCH_REQUEST]`

Payload:
- requestedToolId
- normalizedToolId
- registry entry URL
- iframe src
- hostToolId param
- hostContextId
- has vectorAssetDocument
- sourceName
- svgText length

### 5. Fix first broken link
Codex must fix the first confirmed broken point:
- registry mismatch
- tile data attribute mismatch
- click handler mismatch
- launch normalization mismatch

Keep the change surgical.

## Acceptance
Manual UAT:

Open sample 1902 Workspace Manager.
Click SVG Asset Studio.

Expected logs:
- `[WORKSPACE_REGISTRY_RESOLVE]` for `svg-asset-studio`
- `[WORKSPACE_TOOL_TILE_RENDER]` for `svg-asset-studio`
- `[WORKSPACE_TOOL_CLICK]` with `datasetToolId: svg-asset-studio`
- `[WORKSPACE_TOOL_LAUNCH]` with `requestedToolId: svg-asset-studio`
- `[SVG_LAUNCH_REQUEST]`
- `[SVG_ENTRY_TOP]`

Not acceptable:
- clicking SVG launches `vector-map-editor`
- SVG click has missing datasetToolId
- SVG registry entry points to Vector Map Editor
- SVG normalized ID becomes vector-map-editor

## Validation
Run:
- `node --check "tools/Workspace Manager/main.js"`
- `node --check tools/shared/toolRegistry.js`
- `node --check "tools/SVG Asset Studio/main.js"`

Full samples smoke:
- Skip.
- Reason: targeted Workspace Manager registry/tile/click launch mapping fix; full samples smoke takes about 20 minutes and is not required.

## Report
Create:
`docs_build/dev/reports/pr_11_181_validation.md`

Include:
- where the broken link was found
- files changed
- console proof for SVG click
- targeted validation result
- full smoke skipped reason
