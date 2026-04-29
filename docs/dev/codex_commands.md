# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: high

Apply PR_11_18_FULL_STRICT_SCHEMA_MODE.

Required:
- Enforce `additionalProperties: false` on every object schema under `tools/schemas/**/*.json`.
- No schema object may use `additionalProperties: true`.
- No schema object may omit `additionalProperties`.
- Explicitly define every allowed field instead of allowing loose payloads.
- Complete missing/weak tool schemas rather than bypassing validation.
- Workspace manifest must reference tool schemas via `$ref`.
- Workspace `tools.palette` remains singular and required.
- Workspace `tools.additionalProperties` must be false.
- Validate all `$ref` targets resolve.
- Add tests/checks that unknown fields fail validation.
- Validate/rebuild only sample 1902 as needed.
- Ensure sample 1902 Workspace shows all valid tools, not only Palette.
- Do not add fallback/default/hidden data.
- Do not modify start_of_day folders.
- Add validation report at docs/dev/reports/PR_11_18_FULL_STRICT_SCHEMA_MODE_report.md.
- Return ZIP artifact at tmp/PR_11_18_FULL_STRICT_SCHEMA_MODE_delta.zip.
