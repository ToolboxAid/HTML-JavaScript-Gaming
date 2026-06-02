# Workspace Runtime-Only Contract Validation

PR: PR_26152_078-workspace-runtime-only-contract
Date: 2026-06-02

## Scope

- Added `src/shared/contracts/workspaceRuntimeContract.js`.
- Added `tests/shared/WorkspaceRuntimeContract.test.mjs`.
- Updated required reports only.
- No database implementation, authentication implementation, runtime UI, page, CSS, or HTML changes were made.

## Contract Summary

- Workspace is runtime-only.
- Workspace does not persist tool payloads.
- Workspace does not own saved tool state.
- Workspace does not duplicate project or tool state storage.
- Workspace may track runtime references and UI flow state:
  - `activeProjectId`
  - `activeToolId`
  - `activeToolStateId`
  - `dirty`
  - `recoveryAvailable`
  - `recoveryToolStateId`
  - `activePaletteContext`
  - `flowState`

## Data Ownership

- Project = persisted DB container.
- Tool State = persisted DB record for one tool.
- Workspace = current runtime session/UI context.
- Manifest = portable export/import format.

## Validation Commands

Targeted contract tests:

```powershell
$contractTests = @(
  'tests/shared/WorkspaceRuntimeContract.test.mjs',
  'tests/shared/ToolStateContract.test.mjs',
  'tests/shared/ProjectContract.test.mjs',
  'tests/shared/IdentityPermissionsContract.test.mjs'
)
$toolContractTests = Get-ChildItem -Path tests/shared/tools -Filter '*.test.mjs' | Sort-Object Name | ForEach-Object { $_.FullName }
node ./scripts/run-node-test-files.mjs $contractTests $toolContractTests
```

Result: PASS, `40/40 targeted node test file(s) passed`.

Static checks:

```powershell
git diff --check -- src/shared/contracts tests/shared docs/dev/reports/workspace_runtime_only_contract_validation.md docs/dev/commit_comment.txt
git diff --name-only -- '*.css' '*.html'
git diff --name-only
```

Results:

- PASS: Workspace runtime-only contract tests prove workspace cannot persist tool payload data.
- PASS: Workspace runtime-only contract tests prove workspace cannot create saved tool state records.
- PASS: Workspace runtime-only contract tests prove workspace can reference active project/tool/toolState IDs.
- PASS: Workspace runtime-only contract tests prove workspace can track dirty/recovery runtime status.
- PASS: Workspace runtime-only contract tests prove workspace recovery points to tool state recovery, not workspace-owned saved data.
- PASS: Tool State contract tests confirm Tool State remains the saved editing source.
- PASS: Project, Identity/Permissions, and Tool contract tests remain compatible.
- PASS: no CSS or HTML files changed.
- PASS: no whitespace errors from `git diff --check`.

## Skipped

- Repo-wide tests were not run.
- Samples tests were not run.
- Runtime/UI validation was not run because this PR only changes contracts, contract tests, and reports.
