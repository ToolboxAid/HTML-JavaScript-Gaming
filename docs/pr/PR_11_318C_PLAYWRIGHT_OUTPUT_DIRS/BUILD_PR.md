# BUILD_PR_11_318C

## Implementation
- Updated `playwright.config.cjs`:
  - `testDir: "tests/ui"`
  - `outputDir: "tests/results/artifacts"`
  - HTML reporter output:
    - `tests/results/report`
  - Preserved:
    - `headless: false`
    - `launchOptions.slowMo: 500`
    - `trace: "on"`

## Notes
- Playwright rejects a config where HTML output folder is nested under the same root as `outputDir` when both are the same directory tree root (`tests/results`), because HTML reporter clears its output folder and can erase artifacts.
- This config keeps all outputs under `tests/results/**` while avoiding reporter/outputDir collision.

## Validation
- `node --check playwright.config.cjs`
- `npx playwright test`
