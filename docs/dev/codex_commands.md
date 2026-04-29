# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: medium

Apply PR_11_9_STANDALONE_SAMPLE_TOOL_JSON_DIRECT_LOAD_AUDIT.

Required:
- Treat samples as standalone tool launch users, not workspace launch users.
- Review sample 1208 first and fix duplicated JS-vs-JSON ownership.
- Ensure standalone tools load sample JSON payloads directly.
- Remove/demote JS data modules that mirror JSON and create duplicate SSoT.
- Scan all samples for standalone tool JSON payloads and verify all tool-visible data is JSON-owned.
- Include colors, palettes, fill, stroke, style, preview/render config in the audit.
- Do not use workspace-only validation as primary proof.
- Do not add fallback/default/hidden sample data.
- Do not scrape JS source.
- Do not modify start_of_day folders.
- Add validation report at docs/dev/reports/PR_11_9_STANDALONE_SAMPLE_TOOL_JSON_DIRECT_LOAD_AUDIT_report.md.
- Return ZIP artifact at tmp/PR_11_9_STANDALONE_SAMPLE_TOOL_JSON_DIRECT_LOAD_AUDIT_delta.zip.
