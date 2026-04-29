# REPORT_PR_11_17_SCHEMA_SET_NORMALIZATION_AND_WORKSPACE_REF_ENFORCEMENT

## Summary
This PR instructs Codex to correct the full schema set and make Workspace validation follow tool schemas as SSoT.

## Key Requirements
- Palette is singular at `tools.palette`.
- Tool payload schemas are imported with `$ref`.
- Unknown tool keys fail validation.
- Sample 1902 is rebuilt only as needed to validate correctly.
