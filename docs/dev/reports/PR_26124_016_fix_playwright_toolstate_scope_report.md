# PR_26124_016-fix-playwright-toolstate-scope

## Scope
- Playwright validation/tests and audit/report integration only.
- No runtime code changes.
- No schema changes.

## Changes
- Updated `tests/playwright/tool-validation/workspace-v2.tool-validation.spec.js`:
  - Removed `palette-manager-v2` from toolState-capable tool selector map.
  - Added explicit assertion that toolState-capable scope excludes `palette-manager-v2`.
  - Kept full audited tool list visibility assertion.
  - Switched workspace import helper to hidden file input `setInputFiles` for deterministic import flow.
- Updated `tests/playwright/workspace-v2.validation.spec.js`:
  - Added producer assertions:
    - `palette-manager-v2` is not present in Producer/Tool options.
    - default selected tool is not `palette-manager-v2`.
    - `Load Tool State` works for `asset-manager-v2`.
    - `Create & Open Tool State` works for `asset-manager-v2`.
  - Switched import helper to hidden file input `setInputFiles`.
  - Stabilized tool-switch test by reading manifest from textarea after fixture load.
- Updated `scripts/update-tool-completion-audit-from-playwright.mjs`:
  - Distinguishes `palette-manager-v2` as global workspace palette state coverage via `tools.palette-browser.swatches`.
  - Treats `palette-manager-v2` as excluded from toolState-capable mapping.
  - Added `Scope` column in `docs/dev/reports/tool_validation_results.md`.

## Validation
- `node --check tests/playwright/tool-validation/workspace-v2.tool-validation.spec.js` -> pass
- `node --check tests/playwright/workspace-v2.validation.spec.js` -> pass
- `node --check scripts/update-tool-completion-audit-from-playwright.mjs` -> pass
- `npm run test:workspace-v2` -> pass (`19 passed`, `0 failed`)

## Notes
- Full samples smoke test was skipped because this PR changes only Playwright scope/assertions and report mapping logic, not shared sample/runtime framework behavior.
