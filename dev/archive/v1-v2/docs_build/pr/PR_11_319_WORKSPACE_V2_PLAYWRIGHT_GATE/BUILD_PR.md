# BUILD_PR_11_319

## Implementation
- Added script entry in `package.json`:
  - `test:workspace-v2`: `node ./scripts/run-workspace-v2-playwright-gate.mjs`
- Added new gate runner:
  - `scripts/run-workspace-v2-playwright-gate.mjs`
  - Executes Playwright UI spec through local Playwright CLI:
    - `node node_modules/@playwright/test/cli.js test tests/ui/workspace-v2.asset-manager.spec.js`
  - Streams Playwright stdout/stderr.
  - Parses and prints clear summary:
    - `Workspace V2 Playwright Gate Summary: passed=<n> failed=<n>`
  - Returns non-zero exit when:
    - Playwright process fails to execute
    - Playwright exits non-zero
    - parsed failed count is greater than zero

## Validation
- `node --check scripts/run-workspace-v2-playwright-gate.mjs`
- `node --check playwright.config.cjs`
- `npm run test:workspace-v2`
