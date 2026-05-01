# Codex Commands — PR 11.179

Model: GPT-5.4
Reasoning: high

Implement the correct hosted SVG tile writer.

Goal:
- hosted SVG state flows from workspaceShell to Workspace Manager tile.
- no platformShell badge writes.
- no assetUsageIntegration handoff reads/writes.
- no palette dependency.

Primary files:
- `tools/shared/workspaceShell.js`
- `tools/SVG Asset Studio/main.js`
- `tools/Workspace Manager/main.js`

Steps:
1. Ensure `workspaceShell.js` exports `initWorkspaceShell()`.
2. In hosted SVG mode, SVG Asset Studio calls `initWorkspaceShell()`.
3. `workspaceShell.js` reads hosted context and normalizes `payloadJson.vectorAssetDocument`.
4. `workspaceShell.js` logs `[WORKSPACE_SHELL_STATE]`.
5. `workspaceShell.js` posts `tools:workspace-shell-state` to parent and logs `[SVG_POSTMESSAGE_SEND]`.
6. Workspace Manager listens for the message.
7. Workspace Manager matches `svg-asset-studio` tile by `hostContextId` where available.
8. Workspace Manager writes SVG tile label/status from normalized state and logs:
   - `[SVG_POSTMESSAGE_RECEIVE]`
   - `[SVG_TILE_WRITE]`
9. Do not restore shared handoff or palette-first logic.
10. Create report `docs/dev/reports/pr_11_179_validation.md`.

Validation:
- `node --check tools/shared/workspaceShell.js`
- `node --check "tools/SVG Asset Studio/main.js"`
- `node --check "tools/Workspace Manager/main.js"`
- `node --check tools/shared/platformShell.js`
- `node --check tools/shared/assetUsageIntegration.js`

Manual UAT:
- Open sample 1902.
- Launch Workspace Manager.
- Mount SVG Asset Studio.
- Confirm expected logs.
- Confirm SVG tile shows sourceName, not `Asset: none`.
- Confirm Vector Map Editor still works.

Full samples smoke:
- Skip.
- Reason: targeted hosted SVG tile write path; full samples smoke takes about 20 minutes and is not required.

Return ZIP artifact at:
`<project folder>/tmp/PR_11_179_20260430_01.zip`
