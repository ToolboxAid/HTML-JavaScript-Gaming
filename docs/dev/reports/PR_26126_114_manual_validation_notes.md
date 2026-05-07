# PR_26126_114 Schema Alignment Manual Validation Notes

## Automated Validation
- `npm run test:asset-manager-v2` passed.
- Result: 8 Playwright tests passed.
- `npm run test:workspace-v2` passed.
- Result: 19 Playwright tests passed.
- Generated Workspace Manager V2 context schema validation passed against:
  - `tools/schemas/workspace.manifest.schema.json`
  - `tools/schemas/tools/palette-browser.schema.json`
  - `tools/schemas/tools/asset-browser.schema.json`

## Manual Checks
1. Open `tools/workspace-manager-v2/index.html`.
   - Expected: selecting a game creates context with active game, active palette, and active assets path.
   - Expected: generated `workspaceManifest` has only schema-supported root fields.
   - Expected: generated `workspaceManifest.tools.asset-browser` contains only `assets`.
2. Launch Asset Manager V2 from Workspace Manager V2.
   - Expected: Asset Manager V2 opens with `launch=workspace`, `fromTool=workspace-manager-v2`, and a `hostContextId`.
   - Expected: Asset Manager V2 loads assets and palette from Workspace Manager V2 session context.
3. Open `tools/asset-manager-v2/index.html`.
   - Expected: direct launch without session/context hard-fails to the launch guard overlay.
4. Open `tools/asset-manager-v2/index.html?workspace=prod`.
   - Expected: direct production URL launch hard-fails to the launch guard overlay.
5. Open `tools/asset-manager-v2/index.html?workspace=UAT`.
   - Expected: temporary UAT-only launch remains available for isolated testing.

## Out Of Scope
- Full samples smoke test was skipped because this PR is scoped to Workspace Manager V2 schema alignment and targeted Playwright coverage.
- Deprecated `tools/workspace-v2/` was not modified.
- Sample JSON was not modified.

