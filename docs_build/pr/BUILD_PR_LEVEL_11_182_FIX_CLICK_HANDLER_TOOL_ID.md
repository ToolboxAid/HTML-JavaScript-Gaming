
# BUILD_PR_LEVEL_11_182_FIX_CLICK_HANDLER_TOOL_ID

## Purpose
Fix Workspace Manager click handler so it launches the correct tool (SVG) instead of always launching vector-map-editor.

## Root Cause
Click handler is not using `data-tool-id` from the clicked tile.

## Fix
Use closest `[data-tool-id]` element and pass its dataset value to launchTool.

## Implementation

File:
toolbox/Workspace Manager/main.js

Replace click handler logic with:

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-tool-id]");
  if (!el) return;

  const toolId = el.dataset.toolId;

  console.log("[WORKSPACE_TOOL_CLICK]", {
    clickedToolId: toolId,
    element: el
  });

  launchTool(toolId);
});

## Rules
- MUST use dataset.toolId
- MUST NOT fallback to default tool
- MUST NOT use activeTool/global state

## Acceptance
Click SVG Asset Studio:

Logs:
[WORKSPACE_TOOL_CLICK] svg-asset-studio
[WORKSPACE_TOOL_LAUNCH] svg-asset-studio

Then:
[SVG_ENTRY_TOP]
[SVG_HOSTED_WORKSPACE_ENTRY]

UI:
SVG loads correctly
