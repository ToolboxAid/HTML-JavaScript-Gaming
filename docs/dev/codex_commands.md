# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: high

Apply PR_11_19_SCHEMA_CLEANUP_TOOL_PAYLOADS_AND_PALETTE_CANONICALIZATION.

Required:
- Make `tools/schemas/tools/palette-browser.schema.json` the only canonical palette schema.
- Move/merge correct palette schema content into `palette-browser.schema.json`.
- Delete/remove all `tools/schemas/palette.schema*` files.
- Ensure palette-browser schema is strict with `additionalProperties: false` everywhere.
- Review `tools/schemas/sample.tool-payload.schema.json`; tools must validate only direct tool JSON schemas, not broad sample wrapper objects.
- Remove/demote/narrow `sample.tool-payload.schema.json` so it cannot be used to validate arbitrary extra objects as tool payloads.
- Rename tool schema `config` fields to a clearer field, preferably `payload`, consistently across schemas and sample 1902.
- Replace generic use of `gameId` with a more generic identifier, preferably `projectId`; keep `gameId` only inside explicitly game-specific schemas.
- Update Workspace manifest `$ref` targets to the canonical tool schemas.
- Keep full strict mode: no `additionalProperties: true`, no omitted object `additionalProperties`.
- Validate/rebuild only sample 1902 as needed.
- Do not modify other samples.
- Do not add fallback/default/hidden data.
- Do not modify start_of_day folders.
- Add validation report at docs/dev/reports/PR_11_19_SCHEMA_CLEANUP_TOOL_PAYLOADS_AND_PALETTE_CANONICALIZATION_report.md.
- Return ZIP artifact at tmp/PR_11_19_SCHEMA_CLEANUP_TOOL_PAYLOADS_AND_PALETTE_CANONICALIZATION_delta.zip.
