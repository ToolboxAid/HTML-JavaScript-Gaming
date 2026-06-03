# PR_26140_085 Final Workspace/Deprecated Tool Residue Cleanup

## Summary
- Cleaned active tool documentation and UAT wording so Object Vector Studio V2 and World Vector Studio V2 are described as the current tool surfaces without deprecated-tool replacement language.
- Updated starter/project validation scripts and the new-game scaffold generator to use current vector tool ids and active tool names.
- Removed active display-name residue from Workspace Manager/tests and updated the GravityWell vector tool launch check to Object Vector Studio V2.
- Renamed local workspace context variables in active asset/preview loaders where they produced stale `workspace.asset` pattern hits, without changing the manifest contract or runtime behavior.

## Files Cleaned
- `docs/tools/object-vector-studio-v2/uat.md`
- `docs/tools/world-vector-studio-v2/uat.md`
- `toolbox/object-vector-studio-v2/README.md`
- `toolbox/object-vector-studio-v2/how_to_use.html`
- `toolbox/world-vector-studio-v2/README.md`
- `toolbox/world-vector-studio-v2/how_to_use.html`
- `scripts/validate-starter-project-template.mjs`
- `scripts/validate-project-system.mjs`
- `scripts/PS/New-Game-from-Template.ps1`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tests/runtime/GamesIndexWorkspaceManagerOpen.test.mjs`
- `tests/runtime/V2SessionValidation.test.mjs`
- `tests/tools/ObjectVectorFinalRuntimeCleanup.test.mjs`
- `tests/tools/ToolLocalSampleMigration.test.mjs`
- `games/shared/gameManifestAssets.js`
- `toolbox/shared/platformShell.js`
- `toolbox/preview-generator-v2/PreviewGeneratorV2App.js`

## Out Of Scope Left Alone
- No schema files were changed.
- No sample JSON files were changed.
- Historical docs, archived docs, generated duplicate-scan snapshots, and generated report artifacts were left alone.
- Existing deprecated schema files remain untouched because the PR explicitly disallowed schema changes.

## Validation
- PASS: targeted JS syntax checks for changed JavaScript/MJS files.
- PASS: PowerShell parser check for `scripts/PS/New-Game-from-Template.ps1`.
- PASS: active-reference scan returned no matches outside excluded historical/report/schema/sample-json/generated paths.
- PASS: `git diff --check` completed with no whitespace errors; Git only reported line-ending normalization warnings.
- PASS: `npm run test:workspace-v2` (59 passed).
