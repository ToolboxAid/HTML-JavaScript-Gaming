# Codex Commands — PR 11.180

Model: GPT-5.4
Reasoning: high

Fix SVG launch/entry path so `[SVG_HOSTED_WORKSPACE_ENTRY]` appears.

Primary files:
- `tools/Workspace Manager/main.js`
- `tools/SVG Asset Studio/main.js`

Steps:
1. Add `[WORKSPACE_TOOL_LAUNCH]` logging for every mounted tool.
2. Add `[SVG_LAUNCH_REQUEST]` logging for SVG with iframe URL and payload proof.
3. Add `[SVG_ENTRY_TOP]` at the top of SVG Asset Studio entry.
4. Ensure SVG iframe URL has:
   - hosted=1
   - hostToolId=svg-asset-studio
   - hostContextId non-empty
5. Ensure SVG hosted guard condition matches actual URL params.
6. Ensure hosted SVG calls `initWorkspaceShell()`.
7. Do not restore shared handoff or platformShell badge writes.
8. Add report:
   - `docs/dev/reports/pr_11_180_validation.md`

Validation:
- `node --check "tools/Workspace Manager/main.js"`
- `node --check "tools/SVG Asset Studio/main.js"`
- `node --check tools/shared/workspaceShell.js`
- `node --check tools/shared/platformShell.js`

Manual:
- Open sample 1902.
- Click/mount SVG Asset Studio.
- Confirm logs:
  - `[WORKSPACE_TOOL_LAUNCH]`
  - `[SVG_LAUNCH_REQUEST]`
  - `[SVG_ENTRY_TOP]`
  - `[SVG_HOSTED_WORKSPACE_ENTRY]`
  - `[WORKSPACE_SHELL_STATE]`
  - `[SVG_POSTMESSAGE_SEND]`
  - `[SVG_POSTMESSAGE_RECEIVE]`

Return ZIP artifact at:
`<project folder>/tmp/PR_11_180_20260430_01.zip`
