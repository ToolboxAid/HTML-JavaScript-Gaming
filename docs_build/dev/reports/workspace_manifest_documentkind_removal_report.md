# Workspace Manifest DocumentKind Removal Report

PR: `PR_26140_055-remove-workspace-manifest-documentkind`

## Summary
- Replaced active `documentKind: "workspace-manifest"` usage with `documentKind: "project-manifest"`.
- Kept the existing `schema: "html-js-gaming.project"` contract and Workspace Manager V2 manifest/toolState behavior.
- Removed active code and test expectations that accepted `workspace-manifest` as the valid document kind.

## Updated Active Paths
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
  - Generates Workspace Manager contexts with `project-manifest`.
  - Validates generated contexts against `project-manifest`.
- `tools/shared/projectManifestContract.js`
  - Uses `PROJECT_DOCUMENT_KIND = "project-manifest"`.
- `tools/asset-manager-v2/js/services/WorkspaceBridge.js`
  - Validates workspace-launched contexts as project manifest contexts.
- `tools/preview-generator-v2/PreviewGeneratorV2App.js`
  - Resolves workspace launch contexts using the project manifest document kind.
- `tools/shared/documentModeGuards.js` and `tools/shared/platformShell.js`
  - Detect project manifests using `project-manifest` or `schema: "html-js-gaming.project"`.
- `scripts/validate-json-contracts.mjs`
  - Skips project-manifest sample-style documents using the new document kind.
- Template manifests:
  - `games/_template/workspace-manager-v2-template.manifest.json`
  - `games/_template/workspace-manager-v2-UAT.manifest.json`
- Tests and fixtures:
  - Workspace Manager V2 Playwright fixtures and assertions.
  - Asset Manager V2 workspace launch fixtures and assertions.
  - Collision Inspector V2 workspace launch fixture.
  - V2 Asset Manager workspace persistence runtime fixture.

## Active Reference Audit
- PASS: no active `"documentKind": "workspace-manifest"` JSON values remain outside excluded historical or out-of-scope paths.
- PASS: no active code/test expectations remain for `documentKind === "workspace-manifest"`, `PROJECT_DOCUMENT_KIND = "workspace-manifest"`, or `toBe("workspace-manifest")`.
- A non-documentKind schema id remains in the root `workspace.manifest.json`: `html-js-gaming.workspace-manifest.palette-links/1`. It was left unchanged because this PR is scoped to documentKind terminology.

## Validation
- PASS: targeted JSON parse validation for changed manifests.
- PASS: targeted syntax/import validation for changed files.
- PASS: `npm run test:workspace-v2` with 58 passed.
- PASS: active documentKind search checks.
- PASS: `git diff --check`.

## Out Of Scope
- Sample JSON was not modified.
- Roadmap text was not modified.
- Full samples smoke test was skipped as requested.
- Historical reports/docs snapshots were not modified.
