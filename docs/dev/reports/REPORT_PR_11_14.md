# REPORT_PR_11_14_WORKSPACE_SCHEMA_PALETTE_TOOL_AND_1902_REBUILD

## Summary
This PR updates the Workspace manifest contract so Palette is a singular tool payload under `tools.palette-browser`, then rebuilds only sample 1902 against that schema.

## Target
- No top-level palette collection.
- No palette sidecar.
- One palette under tools.palette-browser.
- Workspace shows all valid tools for sample 1902.
