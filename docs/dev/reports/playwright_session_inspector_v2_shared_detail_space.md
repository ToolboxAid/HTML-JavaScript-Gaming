# Playwright Session Inspector V2 Shared Detail Space

## Targeted Coverage
- Verified 1 open detail section receives the full open-section output allocation.
- Verified 2 open detail sections split output height evenly.
- Verified 3 open detail sections split output height evenly.
- Verified 4 open detail sections split output height evenly.
- Verified closed detail sections show only their headers.
- Verified open outputs keep vertical scrolling on the output element.
- Verified open outputs have no horizontal scrollbar and wrap long lines.
- Verified lower detail headers remain reachable.
- Verified Copy All includes the selected storage key before JSON, Data, and Dirty data.

## Commands
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "launches Session Inspector V2 with V2 labels, accordions, theme, and delete controls"`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "shows normalized workspace tool sessions as JSON, Data, and Dirty views"`
- `npm run test:workspace-v2`

## Result
- Focused Session Inspector V2 launch/copy validation passed.
- Focused shared detail space validation passed.
- Full workspace-v2 Playwright validation passed: 15 tests.

## Full Samples Smoke
- Skipped per PR instructions because this change is scoped to Session Inspector V2 layout and Copy All output text.
