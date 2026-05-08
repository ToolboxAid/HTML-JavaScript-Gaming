# Playwright Session Inspector V2 Output Wrap Height

## Targeted Coverage
- Verified JSON output wraps long lines without a horizontal scrollbar.
- Verified Data output wraps long lines without a horizontal scrollbar.
- Verified Dirty output wraps long lines without a horizontal scrollbar.
- Verified JSON/Data/Dirty outputs keep vertical scrolling inside their `<pre>` elements.
- Verified JSON/Data/Dirty output height matches the Status output height.
- Verified Dirty and Status headers remain reachable when detail content overflows.
- Verified Copy All and Clear Status behavior remains covered by existing Session Inspector V2 tests.

## Commands
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "shows normalized workspace tool sessions as JSON, Data, and Dirty views"`
- `npm run test:workspace-v2`

## Result
- Focused Playwright validation passed: 1 test.
- Full workspace-v2 Playwright validation passed: 15 tests.

## Full Samples Smoke
- Skipped per PR instructions because the requested change is restricted to Session Inspector V2 detail output wrapping/height behavior and the existing targeted Workspace Manager V2 suite validates the affected launch path.
