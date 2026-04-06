Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_VERSIONED_CONTRACTS.md

# BUILD_PR_VERSIONED_CONTRACTS

## Purpose
Build and apply the approved versioned-contracts implementation in one surgical slice.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## Implemented Build Scope
- Added `tools/shared/contractVersioning.js` for:
  - semver normalization
  - supported/deprecated version policy construction
  - deterministic version support evaluation
  - version metadata export helpers
- Updated `tools/shared/renderPipelineContract.js` to:
  - evaluate `contractVersion` via shared policy
  - normalize accepted aliases to canonical semver
  - expose `getRenderContractVersionMetadata()`
- Updated `tools/shared/devConsoleDebugOverlay.js` to:
  - evaluate diagnostics `contractVersion` via shared policy
  - expose `getDevDiagnosticsContractVersionMetadata()`
- Updated targeted tests for metadata + compatibility behavior

## Compatibility Contract
- Canonical current version remains `1.0.0`
- Accepted compatibility aliases now include:
  - `1`
  - `1.0`
  - `1.0.0`
  - `v1.0` and `v1.0.0` through normalization
- Unsupported versions (for example `2.0.0`) continue to fail validation

## Safety Rules Enforced
- No engine-core API changes
- No unrelated runtime/module refactors
- No destructive file operations
- Existing contract behavior preserved for current canonical version

## Validation Targets
- Syntax checks pass for all touched JS files
- Render contract test suite passes with compatibility case
- Dev diagnostics test suite passes with version metadata check
- Roadmap update remains bracket-only

## Apply Handoff
APPLY_PR_VERSIONED_CONTRACTS should package only the versioned-contract files and reports for this bundle.
