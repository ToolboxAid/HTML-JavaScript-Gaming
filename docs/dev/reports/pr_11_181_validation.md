# PR 11.181 Validation

## Scope
Fixed Workspace Manager SVG launch mapping upstream of shell behavior.

## Files changed
- `tools/Workspace Manager/main.js`
- `docs/dev/reports/pr_11_181_validation.md`

## Registry audit
The registry source used by Workspace Manager is `tools/toolRegistry.js` through `tools/shared/toolHostManifest.js`.

Registry evidence:
- `svg-asset-studio` exists.
- Display name is `SVG Asset Studio`.
- Entry point is `SVG Asset Studio/index.html`.
- `tools/shared/toolRegistry.js` does not exist in this repository, so validation was run against the actual registry file, `tools/toolRegistry.js`.

Added `[WORKSPACE_REGISTRY_RESOLVE]` logging in Workspace Manager with:
- requested tool id
- normalized tool id
- registry tool id
- display name
- entry URL
- SVG flag

## Rendered tile audit
Added `[WORKSPACE_TOOL_TILE_RENDER]` logging when Workspace Manager derives the active tool list. This records:
- tool id
- display name
- entry URL
- data tool id expected for launch mapping

## Click handler fix
Broken link found: Workspace Manager could launch from pager state, but did not resolve direct shared-shell tool row/link clicks into a selected Workspace Manager tool id. A click on a visible tool row could therefore fail to dispatch `svg-asset-studio` through `mountSelectedTool()`.

Fix added in `tools/Workspace Manager/main.js`:
- Detect clicks on `.tools-platform-frame__nav-link` and `.tools-platform-frame__nav-tool-row` when present in the Workspace Manager document.
- Resolve the tool id from data attributes when available.
- If no data attribute exists, resolve the tool id from the clicked link href against the Workspace Manager tool manifest.
- Log `[WORKSPACE_TOOL_CLICK]` before dispatch.
- Set selected tool id to the resolved id and call `mountSelectedTool("tool-click")`.

Expected SVG click proof:
- `[WORKSPACE_TOOL_CLICK]` with `datasetToolId: svg-asset-studio` or resolved SVG id from href
- `[WORKSPACE_TOOL_LAUNCH]` with `requestedToolId: svg-asset-studio`
- `[SVG_LAUNCH_REQUEST]`
- `[SVG_ENTRY_TOP]`

## Existing launch logs retained
Existing `[WORKSPACE_TOOL_LAUNCH]` and `[SVG_LAUNCH_REQUEST]` logging remains in place.

## Validation
- PASS: `node --check "tools/Workspace Manager/main.js"`
- PASS: `node --check tools/toolRegistry.js`
- PASS: `node --check "tools/SVG Asset Studio/main.js"`

Note: requested path `tools/shared/toolRegistry.js` is not present in this repository; `tools/toolRegistry.js` is the actual registry source imported by Workspace Manager dependencies.

## Manual UAT
Not run in this terminal session. Required browser UAT remains:
- Open sample 1902.
- Click SVG Asset Studio.
- Confirm `[WORKSPACE_TOOL_CLICK] datasetToolId: svg-asset-studio`.
- Confirm `[WORKSPACE_TOOL_LAUNCH] requestedToolId: svg-asset-studio`.
- Confirm `[SVG_LAUNCH_REQUEST]`.
- Confirm `[SVG_ENTRY_TOP]`.

## Full samples smoke
Skipped. Reason: targeted Workspace Manager registry/tile/click launch mapping fix.
