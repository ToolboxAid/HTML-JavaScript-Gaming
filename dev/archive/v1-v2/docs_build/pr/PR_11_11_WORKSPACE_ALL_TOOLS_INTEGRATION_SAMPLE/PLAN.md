# PLAN_PR_11_11_WORKSPACE_ALL_TOOLS_INTEGRATION_SAMPLE

## Purpose
Add one workspace integration sample that launches Workspace with every active tool using explicit JSON-backed data.

## Scope
- Add a new sample dedicated to Workspace + all tools integration.
- The sample must use Workspace as the container.
- The sample must include every active tool:
  - Asset Browser
  - Sprite Editor
  - Tilemap Studio
  - Vector Asset Studio
  - Vector Map Editor
  - any currently active workspace-supported tool discovered in tool registry
- All tool-visible data must come from JSON.
- No fallback/hidden/default data.
- Do not modify start_of_day folders.

## Non-Goals
- Do not replace standalone tool samples.
- Do not move tools into samples.
- Do not create new tool features.
- Do not hardcode sample data in JS.

## Acceptance
- New sample appears in samples/index.html.
- Opening the sample launches Workspace.
- Workspace can switch through every active tool.
- Each tool loads explicit JSON data.
- Each tool has first selection and visible state where data exists.
- Fullscreen header behavior still works.
- PREV/NEXT navigation still works.
- Report confirms standalone samples remain separate from this workspace integration sample.
