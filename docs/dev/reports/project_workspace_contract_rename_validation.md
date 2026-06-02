# Project Workspace Contract Rename Validation

PR: PR_26152_079-project-workspace-contract-rename
Date: 2026-06-02

## Scope

- Continued from PR_26152_078.
- Renamed runtime-only Workspace terminology to Project Workspace.
- Updated contracts, contract tests, docs/specs, and required reports only.
- No database implementation, authentication implementation, runtime UI, page, CSS, or HTML changes were made.

## Contract Rename

- The previous runtime-only contract file was renamed to `src/shared/contracts/projectWorkspaceRuntimeContract.js`.
- The matching runtime-only contract test was renamed to `tests/shared/ProjectWorkspaceRuntimeContract.test.mjs`.
- The runtime-only contract terminology was renamed to Project Workspace Runtime Contract.
- Project Workspace is the active runtime working context for a Project.

## Project Workspace Rules

- Project Workspace is runtime-only.
- Project Workspace does not persist tool payloads.
- Project Workspace does not own saved tool state.
- Project Workspace does not duplicate project storage.
- Project Workspace does not duplicate tool state storage.
- Project Workspace recovery points to Tool State recovery.

## Data Ownership

- Project = persisted DB container.
- Project Workspace = current runtime working context for the Project.
- Tool State = persisted DB record for one tool.
- Manifest = portable export/import format.

## Docs

- Added `docs/dev/specs/PROJECT_WORKSPACE_RUNTIME_CONTRACT.md`.
- Updated `docs/dev/specs/TOOL_LAUNCH_SSOT.md` to use Project Workspace terminology for prior runtime launch state.

## Validation Commands

Targeted contract tests:

```powershell
$contractTests = @(
  'tests/shared/ProjectWorkspaceRuntimeContract.test.mjs',
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
git diff --check -- src/shared/contracts tests/shared docs/dev/specs docs/dev/reports/project_workspace_contract_rename_validation.md docs/dev/commit_comment.txt
git diff --name-only -- '*.css' '*.html'
Test-Path src/shared/contracts/workspaceRuntimeContract.js
Test-Path tests/shared/WorkspaceRuntimeContract.test.mjs
rg -P "^# Workspace|^- Workspace|^Workspace(?! Manager)|^- workspace|^workspace" -n src/shared/contracts/projectWorkspaceRuntimeContract.js tests/shared/ProjectWorkspaceRuntimeContract.test.mjs docs/dev/specs/PROJECT_WORKSPACE_RUNTIME_CONTRACT.md docs/dev/specs/TOOL_LAUNCH_SSOT.md docs/dev/reports/project_workspace_contract_rename_validation.md
rg '"workspaceState"' -n src/shared/contracts/projectWorkspaceRuntimeContract.js tests/shared/ProjectWorkspaceRuntimeContract.test.mjs
```

## Expected Results

- PASS: Project Workspace contract tests validate terminology and behavior remain unchanged.
- PASS: Project Workspace rejects old standalone workspace storage fields such as `workspaceState`.
- PASS: Tool State remains the saved editing source.
- PASS: Project, Identity/Permissions, and Tool contract tests remain compatible.
- PASS: no runtime/UI/CSS/HTML files changed.
- PASS: no repo-wide or samples tests run.

## Skipped

- Repo-wide tests were not run.
- Samples tests were not run.
- Runtime/UI validation was not run because this PR only changes contracts, contract tests, docs/specs, and reports.
## Lanes Executed

- contract - targeted shared contract validation for this report's contract surface.

## Lanes Skipped

- runtime - no runtime behavior changed.
- integration - no handoff behavior changed.
- engine - no engine code changed.
- samples - no sample JSON or sample runtime changed.
- recovery/UAT - no Workspace V2 runtime behavior changed.

## Samples Decision

SKIP because contract validation reports do not touch samples or sample fixtures.

## Playwright

Playwright impacted: No

No Playwright impact. This report covers contract validation evidence only.

## Blocker Scope

Targeted contract lane validation only.

## Manual Validation

- Confirm the report remains scoped to contract validation evidence.
- Confirm no runtime, UI, CSS, HTML, JavaScript, storage, auth, payment, installer, downloader, or sample behavior changed.

## Expected PASS Behavior

The targeted contract validation command for this report passes.

## Expected WARN Behavior

Warnings are limited to skipped non-contract lanes or unrelated pre-existing repository state.
