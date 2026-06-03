# Workspace Manifest Final Removal Report

PR: `PR_26140_057-finish-workspace-manifest-removal`

## Summary
- Removed the active root workspace manifest file path.
- Moved the old root sample-link registry to `samples/sample.to.workspace.json`.
- Converted the sample-link registry to a tool-first contract using `schema: "html-js-gaming.sample-tool-links/1"`.
- Moved template/UAT Workspace Manager V2 fixtures to their current responsibilities.
- Preserved Workspace Manager V2 launch/save behavior.

## File Moves
- `workspace.manifest.json` -> `samples/sample.to.workspace.json`
  - Replaced the old `html-js-gaming.workspace-manifest.palette-links/1` schema value.
  - Removed top-level `games[]` and `samples[]`.
  - Added `tools.<toolName>[]` arrays with `sampleId`, `phase`, `sampleType`, `primaryTool`, and `palettePath`.
- `games/_template/workspace-manager-v2-template.manifest.json` -> `games/_template/game.manifest.json`
  - Converted the file to the current `html-js-gaming.game-manifest` shape.
  - Kept Palette Manager V2 and Asset Manager V2 payloads under `tools`.
- `games/_template/workspace-manager-v2-UAT.manifest.json` -> `tests/fixtures/workspace-v2/uat.manifest.json`
  - Kept this as a temporary UAT project-context fixture.
  - Updated the palette `sourceId` to the new fixture path.

## Active Usage Updates
- Workspace Manager V2 temporary UAT loading now fetches `/tests/fixtures/workspace-v2/uat.manifest.json`.
- Workspace Manager V2 UAT status text now reports the fixture path.
- Workspace Manager V2 and Asset Manager V2 Playwright tests now read/expect the fixture path.
- `tools/workspace-manager-v2/README.md` now documents the fixture path.
- `scripts/PS/New-Game-from-Template.ps1` now generates game manifests from `games/_template/game.manifest.json`.

## Active Dependency Audit
- PASS: no active root `workspace.manifest.json` dependency remains in:
  - `tools`
  - `scripts`
  - `tests`
  - `games`
  - `samples`
- PASS: no active `html-js-gaming.workspace-manifest.palette-links/1` dependency remains in:
  - `tools`
  - `scripts`
  - `tests`
  - `games`
  - `samples`
- PASS: old active template/UAT file names are no longer referenced in active code or tests.
- Historical docs snapshots were not rewritten.
- Sample JSON content was not touched beyond the moved sample link registry.

## Validation
- PASS: targeted JSON parse validation for:
  - `samples/sample.to.workspace.json`
  - `games/_template/game.manifest.json`
  - `tests/fixtures/workspace-v2/uat.manifest.json`
- PASS: targeted syntax/import validation for changed scripts/tests/runtime files.
- PASS: `_template` load path validation through `games/_template/game.manifest.json`.
- PASS: UAT load path validation through `tests/fixtures/workspace-v2/uat.manifest.json`.
- PASS: `npm run test:workspace-v2` with 58 passed.
- PASS: active dependency searches for removed schema/path references.
- PASS: `git diff --check`.

## Out Of Scope
- Full samples smoke test was skipped as requested.
- No compatibility shims were added.
- No unrelated sample JSON files were modified.
