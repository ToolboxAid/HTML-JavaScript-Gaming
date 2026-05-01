# Codex Commands — PR 11.181

Model: GPT-5 high
Reasoning: high

Fix Workspace Manager SVG launch mapping.

Primary files:
- `tools/Workspace Manager/main.js`
- `tools/shared/toolRegistry.js` only if registry data is wrong
- `tools/SVG Asset Studio/main.js` only if entry log is missing after correct launch URL

Hard rules:
- Do not modify schemas.
- Do not modify sample 1902 JSON.
- Do not modify shell behavior.
- Do not restore shared handoff.
- Do not migrate all tools.

Steps:
1. Add `[WORKSPACE_REGISTRY_RESOLVE]` logging for registry resolution.
2. Add `[WORKSPACE_TOOL_TILE_RENDER]` logging for rendered tool tiles/buttons.
3. Add `[WORKSPACE_TOOL_CLICK]` logging before launch dispatch.
4. Keep/add `[WORKSPACE_TOOL_LAUNCH]` logging.
5. Add `[SVG_LAUNCH_REQUEST]` for SVG launch.
6. Fix the first broken link causing SVG click not to launch `svg-asset-studio`.
7. Create report:
   - `docs/dev/reports/pr_11_181_validation.md`

Validation:
- `node --check "tools/Workspace Manager/main.js"`
- `node --check tools/shared/toolRegistry.js`
- `node --check "tools/SVG Asset Studio/main.js"`

Manual UAT:
- Open sample 1902.
- Click SVG Asset Studio.
- Confirm:
  - `[WORKSPACE_TOOL_CLICK] datasetToolId: svg-asset-studio`
  - `[WORKSPACE_TOOL_LAUNCH] requestedToolId: svg-asset-studio`
  - `[SVG_LAUNCH_REQUEST]`
  - `[SVG_ENTRY_TOP]`

Full samples smoke:
- Skip.
- Reason: targeted Workspace Manager registry/tile/click launch mapping fix.

Return ZIP artifact at:
`<project folder>/tmp/PR_11_181_20260430_01.zip`
