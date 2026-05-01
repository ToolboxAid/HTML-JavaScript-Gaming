# PR 11.183 Validation

## Scope
Hard-replaced Workspace Manager rendered tool tile click dispatch so tile clicks launch only from the clicked element's `data-tool-id`.

## Files changed
- `tools/Workspace Manager/main.js`
- `docs/dev/reports/pr_11_183_validation.md`

## Old bad path found
Workspace Manager had a delegated `.tools-platform-frame__nav-link` / `.tools-platform-frame__nav-tool-row` click path that could resolve launches indirectly instead of requiring the clicked tile's own dataset. This left room for stale selected-tool/global/default behavior to launch the wrong tool, including `vector-map-editor` when the intended click was SVG Asset Studio.

## Click handler replaced
Added a direct binding layer for rendered `[data-tool-id]` elements:
- `bindWorkspaceToolTileClickHandlers(...)` attaches a direct click handler to each `[data-tool-id]` element.
- A `MutationObserver` binds future rendered tiles/buttons as they appear.
- The handler calls `event.preventDefault()` and `event.stopPropagation()`.
- The handler reads only `tileElement.dataset.toolId`.
- If `data-tool-id` is missing or not launchable, it logs `[WORKSPACE_TOOL_CLICK]` with an actionable error and does not launch.
- If valid, it logs `[WORKSPACE_TOOL_CLICK]` with `clickedToolId`, sets selected tool to that exact id, and calls the existing `mountSelectedTool("tool-click")` path.

The old delegated nav path is now bypassed for tool nav clicks: it logs an error if a click reaches it without direct `[data-tool-id]` handling and does not launch a fallback/default tool.

## Expected console proof
Manual UAT was not run in this terminal session. Expected browser logs:
- SVG click: `[WORKSPACE_TOOL_CLICK] clickedToolId: svg-asset-studio`
- SVG launch: `[WORKSPACE_TOOL_LAUNCH] requestedToolId: svg-asset-studio`
- SVG entry: `[SVG_ENTRY_TOP]`
- Vector Map click: `[WORKSPACE_TOOL_CLICK] clickedToolId: vector-map-editor`
- Vector Map launch: `[WORKSPACE_TOOL_LAUNCH] requestedToolId: vector-map-editor`

## Explicit query route
The direct query route `?tool=svg-asset-studio` is preserved because initial query handling still writes the selected tool id and calls the existing launch path.

## Validation
- PASS: `node --check "tools/Workspace Manager/main.js"`
- PASS: `node --check "tools/SVG Asset Studio/main.js"`
- PASS: `node --check tools/shared/workspaceShell.js`

## Full samples smoke
Skipped. Reason: targeted Workspace Manager click dispatch fix; full samples smoke takes about 20 minutes and is not required.
