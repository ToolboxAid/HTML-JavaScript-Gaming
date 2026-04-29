# REPORT_PR_11_20_WORKSPACE_LOADER_SCHEMA_V2_TOOLS_PAYLOAD_SUPPORT

## Summary
This PR updates Workspace runtime loading to match the corrected strict Workspace manifest schema.

## Target
- Workspace reads `manifest.tools`.
- Tool list is built from valid manifest tool keys.
- Palette is singular but not exclusive.
- Sample 1902 shows all valid tools.
