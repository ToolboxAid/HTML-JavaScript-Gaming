Toolbox Aid
David Quesenberry
04/05/2026
APPLY_PR_VERSIONED_CONTRACTS.md

# APPLY_PR_VERSIONED_CONTRACTS

## Purpose
Apply BUILD_PR_VERSIONED_CONTRACTS exactly as defined.

## Applied Scope
- Shared version-policy utility added:
  - `tools/shared/contractVersioning.js`
- Render contract version checks migrated to shared policy:
  - `tools/shared/renderPipelineContract.js`
- Dev diagnostics version checks migrated to shared policy:
  - `tools/shared/devConsoleDebugOverlay.js`
- Targeted tests updated:
  - `tests/tools/RenderPipelineContractAll4Tools.test.mjs`
  - `tests/tools/DevConsoleDebugOverlay.test.mjs`
- Track J roadmap bracket update:
  - `Versioned contracts` -> `[x]`

## Validation Summary
- plugin/runtime separation preserved
- unsupported versions still rejected
- compatibility aliases accepted and normalized
- no regressions observed in affected test scope

## Output
<project folder>/tmp/PR_VERSIONED_CONTRACTS_FULL_bundle.zip
