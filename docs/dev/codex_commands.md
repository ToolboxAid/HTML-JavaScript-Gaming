# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: high

Apply PR_11_21_WORKSPACE_MANAGER_TOOL_PRESENT_DETECTION_FIX.

Required:
- Fix Workspace Manager/tool presence detection so tools are marked present from `manifest.tools[toolId]`.
- Use strict manifest.tools keys as the source for presence.
- Validate keys against tool registry and tool schemas.
- Map singular `tools.palette` to Palette Browser UI/presence without suppressing other tools.
- Stop using old presence sources for sample 1902: top-level palettes, games[].tools, activeWorkspaceTools, config, top-level payload, sample tool-payload wrappers.
- Add evidence/report listing raw loaded tool keys, normalized keys, valid present keys, invalid keys, and visible Workspace Manager tools.
- Do not loosen schemas.
- Do not modify other samples.
- Do not add fallback/default/hidden data.
- Do not modify start_of_day folders.
- Add validation report at docs/dev/reports/PR_11_21_WORKSPACE_MANAGER_TOOL_PRESENT_DETECTION_FIX_report.md.
- Return ZIP artifact at tmp/PR_11_21_WORKSPACE_MANAGER_TOOL_PRESENT_DETECTION_FIX_delta.zip.
