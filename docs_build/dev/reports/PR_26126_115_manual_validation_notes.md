# PR_26126_115 Manual Validation Notes

## Automated Validation
- `npm run test:workspace-v2` passed.
- Result: 19 Playwright tests passed.
- Direct generated manifest validation passed against `toolbox/schemas/workspace.manifest.schema.json`.

## Manual Checks
1. Open `toolbox/workspace-manager-v2/index.html`.
   - Expected: selecting Asteroids produces a manifest-only JSON object in Workspace Context.
   - Expected: the JSON includes `documentKind`, `schema`, `version`, `id`, `name`, `gameId`, `gameRoot`, `assetsPath`, and `tools`.
   - Expected: the JSON does not include root `toolId`, root `activePalette`, or nested `workspaceManifest`.
2. Inspect generated `tools`.
   - Expected: `tools.asset-manager-v2.assets` exists.
   - Expected: `tools.palette-browser.swatches` exists.
   - Expected: `tools.asset-browser` is not generated.
3. Launch Asset Manager V2 from Workspace Manager V2.
   - Expected: Asset Manager V2 loads the schema-valid manifest from sessionStorage and remains usable.
   - Expected: validated assets insert into `tools.asset-manager-v2.assets`.
4. Open `toolbox/asset-manager-v2/index.html`.
   - Expected: direct launch without valid manifest context hard-fails to the launch guard overlay.

## Out Of Scope
- Full samples smoke test was skipped because this PR is scoped to Workspace Manager V2 manifest handoff and targeted Playwright coverage.
- Deprecated `toolbox/workspace-v2/` was not modified.
- Sample JSON was not modified.

