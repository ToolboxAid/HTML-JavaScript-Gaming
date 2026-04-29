# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: high

Apply PR_11_20_WORKSPACE_LOADER_SCHEMA_V2_TOOLS_PAYLOAD_SUPPORT.

Required:
- Update Workspace loader/runtime to consume the corrected strict Workspace manifest shape where tool payloads live under `tools`.
- Build available tool list from `Object.keys(manifest.tools)` filtered/validated against tool registry.
- Ensure valid tools are not silently dropped.
- Map singular `tools.palette` to the Palette Browser UI if that is the schema decision, but do not let it become the only visible tool.
- Stop relying on old top-level `palettes`, `activeWorkspaceTools`, `games[].tools`, top-level `config`, top-level `payload`, or sample tool-payload wrappers for sample 1902.
- Validate sample 1902 opens Workspace with all valid tools, not only Palette.
- Do not loosen schemas.
- Do not add fallback/default/hidden data.
- Do not modify other samples.
- Do not modify start_of_day folders.
- Add validation report at docs/dev/reports/PR_11_20_WORKSPACE_LOADER_SCHEMA_V2_TOOLS_PAYLOAD_SUPPORT_report.md.
- Return ZIP artifact at tmp/PR_11_20_WORKSPACE_LOADER_SCHEMA_V2_TOOLS_PAYLOAD_SUPPORT_delta.zip.
