# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: high

Apply PR_11_17_SCHEMA_SET_NORMALIZATION_AND_WORKSPACE_REF_ENFORCEMENT.

Use the schema set as the contract source and correct it.

Required:
- Normalize `src/shared/schemas/workspace.manifest.schema.json`.
- Remove top-level `palettes`.
- Make `tools.palette-browser` singular and required.
- List all supported Workspace tool ids explicitly under `tools.properties`.
- Set `tools.additionalProperties` to false.
- Use `$ref` to each tool's canonical schema instead of duplicating schema bodies.
- Use actual registry ids only; no aliases or display names as keys.
- Ensure all `$ref` targets resolve.
- Validate schema syntax and references.
- Validate sample 1902 against corrected schemas.
- Rebuild only `samples/phase-19/1902/sample.1902.workspace-all-tools.json` if needed.
- Remove/avoid `sample.1902.palette.json`.
- Ensure Workspace shows all valid tools, not only Palette.
- Do not modify other samples.
- Do not add fallback/default/hidden data.
- Do not modify start_of_day folders.
- Add validation report at docs_build/dev/reports/PR_11_17_SCHEMA_SET_NORMALIZATION_AND_WORKSPACE_REF_ENFORCEMENT_report.md.
- Return ZIP artifact at tmp/PR_11_17_SCHEMA_SET_NORMALIZATION_AND_WORKSPACE_REF_ENFORCEMENT_delta.zip.
