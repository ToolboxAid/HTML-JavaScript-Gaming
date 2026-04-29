# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: medium

Apply PR_11_10_ALL_SAMPLES_STANDALONE_TOOL_JSON_SSOT_ENFORCEMENT.

Required:
- Scan every sample under samples/ for standalone tool ties.
- Enforce JSON as the only canonical source for all tool-visible data.
- Include color, palette, fill, stroke, style, and preview/render config in the SSoT check.
- Remove or demote JS mirror data modules that duplicate JSON payloads.
- Ensure standalone tools load sample JSON directly.
- Use standalone sample/tool validation as primary proof, not workspace-only validation.
- Preserve empty state when no explicit JSON exists.
- Do not add fallback/default/hidden sample data.
- Do not scrape JS source.
- Do not modify start_of_day folders.
- Add validation report at docs/dev/reports/PR_11_10_ALL_SAMPLES_STANDALONE_TOOL_JSON_SSOT_ENFORCEMENT_report.md.
- Return ZIP artifact at tmp/PR_11_10_ALL_SAMPLES_STANDALONE_TOOL_JSON_SSOT_ENFORCEMENT_delta.zip.
