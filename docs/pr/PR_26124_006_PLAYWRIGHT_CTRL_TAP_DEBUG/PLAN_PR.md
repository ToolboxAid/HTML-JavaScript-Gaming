# PLAN_PR — PR_26124_006

## Goal
Add Ctrl tap (press + release) around key Playwright click actions for visual debugging without changing click behavior.

## Scope
- Playwright tests only
- Shared test helper preferred

## Plan
1. Add shared helper to perform:
   - `page.keyboard.down("Control")`
   - `page.keyboard.up("Control")`
   - then click target locator
2. Apply helper to key click actions in:
   - workspace navigation clicks
   - tool activation clicks
   - workspace interaction points
3. Keep runtime app code untouched.
4. Run required validation:
   - `npm run test:workspace-v2`
