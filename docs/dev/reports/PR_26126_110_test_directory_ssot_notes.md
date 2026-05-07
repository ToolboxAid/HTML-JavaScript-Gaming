# PR_26126_110 Test Directory SSoT Notes

## Tool Spec Location
- Moved Asset Manager V2 Playwright coverage to `tests/playwright/tools/AssetManagerV2.spec.mjs`.
- Moved Preview Generator V2 Playwright coverage to `tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs`.
- Updated both moved specs to import helpers from `../../helpers/...`.

## Script Ownership
- `test:asset-manager-v2` now targets `tests/playwright/tools/AssetManagerV2.spec.mjs`.
- `test:preview-generator-v2` now targets `tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs`.
- `test:workspace-v2` remains the aggregate Workspace V2/tool completion gate and includes both tools-directory specs in one Playwright run.

## Scope
- No Asset Manager V2 runtime behavior changed for the test move.
- No Preview Generator V2 runtime behavior changed.
- No sample JSON was modified.
