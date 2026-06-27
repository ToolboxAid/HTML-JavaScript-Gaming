# PR_26126_109 Test Script SSoT Notes

## Script Ownership
- Added `npm run test:asset-manager-v2` as the dedicated Asset Manager V2 Playwright SSoT script.
- Added `npm run test:preview-generator-v2` as the dedicated Preview Generator V2 Playwright SSoT script.
- Kept `npm run test:workspace-v2` as the aggregate Workspace V2/tool completion gate.

## Aggregate Gate
- `test:workspace-v2` includes both dedicated suites in one Playwright invocation:
  - `tests/playwright/AssetManagerV2.spec.mjs`
  - `tests/playwright/PreviewGeneratorV2Baseline.spec.mjs`
- The aggregate script uses `--workers=1` so the shared Playwright/V8 coverage reporter writes one combined report after the aggregate validation.

## Scope
- No Asset Manager V2 runtime behavior was changed.
- No Preview Generator V2 runtime behavior was changed.
- No sample JSON was modified.
