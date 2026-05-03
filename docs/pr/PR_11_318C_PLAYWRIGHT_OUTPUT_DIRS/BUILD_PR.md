# BUILD_PR_11_318C

## Implementation
- Updated `playwright.config.cjs`:
  - top-level `outputDir: "tests/results"`
  - project-level UI artifact output:
    - `projects[0].outputDir: "tests/results/artifacts"`
    - `projects[0].testDir: "tests/ui"`
  - HTML reporter output:
    - `tests/results/report`
  - Preserved:
    - `headless: false`
    - `launchOptions.slowMo: 500`
    - `trace: "on"`

## Notes
- `.gitignore` already includes required entries:
  - `node_modules/`
  - `tests/results/`
  - `tmp/`
- Playwright rejects a config where HTML output folder and test artifact `outputDir` share a collision path. Project-level `outputDir` avoids that clash while keeping all outputs under `tests/results/**`.

## Validation
- `node --check playwright.config.cjs`
- `npx playwright test tests/ui/workspace-v2.asset-manager.spec.js`
