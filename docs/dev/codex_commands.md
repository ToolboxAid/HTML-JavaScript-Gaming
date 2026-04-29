# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: medium

Apply PR_11_14_WORKSPACE_SCHEMA_PALETTE_TOOL_AND_1902_REBUILD.

Required:
- Update `tools/schemas/workspace.manifest.schema.json` so Palette is a singular tool payload under `tools.palette`.
- Remove top-level required `palettes` collection from the manifest schema unless migration compatibility is required and documented.
- Rebuild only `samples/phase-19/1902/`.
- Delete/remove `sample.1902.palette.json`.
- Rebuild sample 1902 workspace payload so all tool data is under `tools`, including `tools.palette`.
- Allow only one palette in the workspace manifest.
- Ensure Workspace shows all valid tools, not only Palette.
- Do not modify other samples.
- Do not add fallback/default/hidden data.
- Do not modify start_of_day folders.
- Add validation report at docs/dev/reports/PR_11_14_WORKSPACE_SCHEMA_PALETTE_TOOL_AND_1902_REBUILD_report.md.
- Return ZIP artifact at tmp/PR_11_14_WORKSPACE_SCHEMA_PALETTE_TOOL_AND_1902_REBUILD_delta.zip.
