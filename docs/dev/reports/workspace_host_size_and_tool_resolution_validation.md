# BUILD_PR_LEVEL_20_25_FIX_WORKSPACE_HOST_SIZE_AND_TOOL_RESOLUTION Validation

## Changed Files
- `tools/Workspace Manager/main.js`
- `tools/Workspace Manager/toolHost.css`
- `tools/shared/platformShell.js`
- `docs/dev/reports/workspace_host_size_and_tool_resolution_validation.md`

## Proof Host Page Fills Browser Viewport
- Host root dimensions are explicitly full-page:
  - `tools/Workspace Manager/toolHost.css:1` `html,`
  - `tools/Workspace Manager/toolHost.css:2` `body.tool-host-page {`
  - `tools/Workspace Manager/toolHost.css:3` `width: 100%;`
  - `tools/Workspace Manager/toolHost.css:4` `height: 100%;`
- Workspace host container also fills available area:
  - `tools/Workspace Manager/toolHost.css:14` `.tool-host-workspace {`
  - `tools/Workspace Manager/toolHost.css:15` `width: 100%;`
  - `tools/Workspace Manager/toolHost.css:16` `height: 100%;`

## Proof Mount Container Fills Available Browser Area
- Mount surface is full-size and flexed:
  - `tools/Workspace Manager/toolHost.css:23` `.tool-host-workspace__mount {`
  - `tools/Workspace Manager/toolHost.css:24` `width: 100%;`
  - `tools/Workspace Manager/toolHost.css:25` `height: 100%;`
  - `tools/Workspace Manager/toolHost.css:30` `.tool-host-workspace__mount {`

## Proof No Tiny Upper-Left Constrained Viewport Remains
- Direct mount iframes are now explicitly forced to full-size:
  - `tools/Workspace Manager/toolHost.css:111` `.tool-host-workspace__mount > iframe[data-tool-host-frame],`
  - `tools/Workspace Manager/toolHost.css:112` `.tool-host-workspace__mount > iframe[data-game-host-frame],`
  - `tools/Workspace Manager/toolHost.css:116` `width: 100%;`
  - `tools/Workspace Manager/toolHost.css:117` `height: 100%;`
- This fixes the default browser iframe size fallback (300x150) that causes the tiny upper-left rendering.

## Proof tool=palette-browser Resolves To Display Name
- Query tool id is validated against existing registry/SSoT host manifest:
  - `tools/Workspace Manager/main.js:301` `function readRequestedToolIdFromQuery() {`
  - `tools/Workspace Manager/main.js:304` `if (!requested || !getToolHostEntryById(manifest, requested) || !toolIds.includes(requested)) {`
- Pager label text is display-name based, not raw id/fallback string:
  - `tools/shared/platformShell.js:876` `data-tool-host-current-label>${escapeHtml(currentTool?.displayName || "Tool")}`

## Proof Pager No Longer Shows No tool available For Valid Game/Tool
- Pager default text at platform shell marker was changed from static `No tool available` to dynamic tool display name:
  - `tools/shared/platformShell.js:876` uses `${escapeHtml(currentTool?.displayName || "Tool")}`.

## Proof Selected Tool Mounts/Activates
- Runtime mount call remains active for selected tool:
  - `tools/Workspace Manager/main.js:563` `const mountResult = runtime.mountTool(toolId, {`
- Initial load path mounts selected tool:
  - `tools/Workspace Manager/main.js:804` `if (!mountSelectedTool("init")) {`

## Proof Missing Tool Selects First Available Tool
- First available tool fallback is used only when explicit valid tool is absent:
  - `tools/Workspace Manager/main.js:774` `const initialToolId = requestedToolId || (toolIds[0] || "");`

## Proof Invalid Tool Renders Visible Diagnostic
- Invalid explicit tool query path now fails visibly instead of silently falling back:
  - `tools/Workspace Manager/main.js:665` `if (rawRequestedToolId && !requestedToolId) {`
  - `tools/Workspace Manager/main.js:667` `renderMountDiagnostic(`
  - `tools/Workspace Manager/main.js:696` `if (rawRequestedToolId && !requestedToolId) {`
  - `tools/Workspace Manager/main.js:698` `renderMountDiagnostic(`
  - `tools/Workspace Manager/main.js:766` `if (rawRequestedToolId && !requestedToolId) {`
  - `tools/Workspace Manager/main.js:768` `renderMountDiagnostic(`

## Proof gameId || game Fallback Not Restored
- Search checks:
  - `NOT_FOUND gameId || game`
  - `NOT_FOUND searchParams.get("game")`
  - `NOT_FOUND searchParams.get('game')`

## Proof Samples Remain Untouched
- Check result:
  - `SAMPLES_UNCHANGED`
  - From `git diff --name-only -- samples`.

## Anti-Pattern Self-Check
- No `gameId || game`/legacy game fallback restored: PASS
- No second SSoT introduced: PASS
- No samples or label changes: PASS
- No broad Workspace Manager refactor: PASS
- Changes remained targeted to host size + tool resolution + validation: PASS