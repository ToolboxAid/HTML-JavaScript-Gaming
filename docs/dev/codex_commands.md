# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: medium

Apply PR_11_13_WORKSPACE_1902_SCHEMA_CONFORMANCE_FIX.

Required:
- Validate sample 1902 against the actual Workspace schemas, not the sample tool-payload schema.
- Rewrite `samples/phase-19/1902/sample.1902.workspace-all-tools.json` to conform to the actual Workspace schema/manifest shape.
- Remove unsupported/misplaced fields such as `tool: workspace-all-tools-integration`, `activeWorkspaceTools`, duplicate `config`, duplicate `payload`, copied unrelated sample/game data, and palette sidecar references unless the actual schema requires them.
- Ensure Workspace resolves all active workspace-supported tools from the schema-valid manifest, not just Palette.
- Do not add fallback/default/hidden data.
- Do not modify standalone tool samples.
- Do not modify start_of_day folders.
- Add validation report at docs/dev/reports/PR_11_13_WORKSPACE_1902_SCHEMA_CONFORMANCE_FIX_report.md.
- Return ZIP artifact at tmp/PR_11_13_WORKSPACE_1902_SCHEMA_CONFORMANCE_FIX_delta.zip.
