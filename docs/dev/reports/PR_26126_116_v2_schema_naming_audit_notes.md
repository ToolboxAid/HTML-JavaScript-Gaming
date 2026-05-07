# PR_26126_116 V2 Schema Naming Audit Notes

- Added canonical V2 tool payload schemas:
  - `tools/schemas/tools/asset-manager-v2.schema.json`
  - `tools/schemas/tools/palette-manager-v2.schema.json`
- Updated `tools/schemas/workspace.manifest.schema.json` so generated Workspace Manager V2 manifests require `tools.palette-manager-v2` and `tools.asset-manager-v2`.
- Updated Asset Manager V2 schema loading and validation messages from `asset-browser.schema.json` to `asset-manager-v2.schema.json`.
- Updated Workspace Manager V2 generated JSON and tests to reject old generated `palette-browser`/`asset-browser` tool keys.
- Updated visible V2 registry/shell naming for Asset Manager V2 and Palette Manager V2 where this lane directly references them.
- Preview Generator V2 remains under its existing `preview-generator-v2` tool ID and dedicated Playwright spec path; this lane only revalidated that reference through `test:workspace-v2`.
- Deprecated `tools/workspace-v2` was not modified.
- Sample JSON was not modified.
