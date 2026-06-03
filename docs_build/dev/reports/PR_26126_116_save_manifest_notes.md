# PR_26126_116 Save Manifest Notes

- Added a Workspace Manager V2 `Save` button beside `Launch Asset Manager V2`.
- Save is disabled until a valid game workspace context is selected.
- Save validates the generated manifest against `toolbox/schemas/workspace.manifest.schema.json` and referenced V2 payload schemas before export.
- Validation failures block export and log exact schema failures to Status.
- Successful save exports `<manifest-id>.workspace.manifest.json`.
- Playwright coverage validates successful export and blocked save behavior for schema-invalid generated context.
