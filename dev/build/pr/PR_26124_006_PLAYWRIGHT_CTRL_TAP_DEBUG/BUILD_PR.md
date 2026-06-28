# BUILD_PR — PR_26124_006

## Scope Applied
- Tests only.
- No runtime app code changes.
- No schema changes.
- No sample JSON changes.

## Implementation
1. Added shared helper:
   - `tests/helpers/playwrightCtrlTapClick.mjs`
   - `ctrlTap(page)` performs Control key tap (down + up).
   - `ctrlTapClick(page, locator)` applies tap before click.

2. Updated Playwright specs to use shared helper for key click actions:
   - `tests/ui/workspace-v2.asset-manager.spec.js`
   - `tests/playwright/workspace-v2.validation.spec.js`

## Behavioral Notes
- Ctrl is tapped before click and never held during click.
- Existing click targets and assertions remain unchanged.
- No dependency on visual-only behavior was introduced.

## Validation
- `npm run test:workspace-v2` -> PASS (`1 passed`, `failed=0`)
