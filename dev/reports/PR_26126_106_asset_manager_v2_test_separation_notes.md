# PR_26126_106 Test Separation Notes

## Dedicated Spec
- Asset Manager V2 Playwright coverage moved from `tests/playwright/PreviewGeneratorV2Baseline.spec.mjs` to `tests/playwright/AssetManagerV2.spec.mjs`.
- Asset Manager launch, UAT palette/session, import/export, preview, Workspace insertion, and launch-guard assertions now live in the dedicated Asset Manager V2 spec.
- `PreviewGeneratorV2Baseline.spec.mjs` no longer contains Asset Manager V2 helpers or assertions.

## Workspace Gate
- `npm run test:workspace-v2` now runs both `PreviewGeneratorV2Baseline.spec.mjs` and `AssetManagerV2.spec.mjs` with one worker.
- Both specs share `tests/helpers/workspaceV2CoverageReporter.mjs` so the Playwright/V8 report remains combined across the separated suite.
- The required validation passed with 14/14 Playwright tests.

## Scope
- The separated suite preserves Palette Manager V2 coverage naming and Asset Manager V2 runtime coverage in the combined V8 report.
- No sample JSON was modified.
