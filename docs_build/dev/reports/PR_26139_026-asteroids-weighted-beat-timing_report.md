# PR_26139_026-asteroids-weighted-beat-timing

## Summary
- Replaced raw asteroid-count beat cadence with weighted active asteroid totals.
- Weights are large asteroid `9`, medium asteroid `4`, and small asteroid `1`.
- Beat timing now uses only active asteroid objects and preserves the existing cadence bounds of `0.18s` minimum and `0.98s` maximum.
- Added targeted Asteroids Playwright validation for the expected split progression.

## Runtime Behavior
- The active wave establishes the current beat baseline from live asteroid objects; no asteroid-count totals are hardcoded in runtime cadence logic.
- Weighted totals decrease as asteroids split, so cadence speeds up through the expected progression:
  - `8 large = 72`
  - `16 medium = 64`
  - `32 small = 32`
- Inactive asteroid-like objects with `active: false`, `alive: false`, or `destroyed: true` do not contribute to cadence.

## Validation
- PASS: `npx playwright test tests/playwright/tools/AsteroidsBeatTiming.spec.mjs --project=playwright --workers=1 --reporter=list`
  - 1 passed.
- PASS: `npm run build:manifest`
- PASS: `npm run test:workspace-v2`
  - 58 passed.
- PASS: repeated targeted Asteroids beat timing validation after Workspace V2 for the final coverage report.
- PASS: `git diff --check`

## PR_26139_025 Regression Check
- Workspace V2 suite re-ran the repo discovery/schema reference tests from PR_26139_025.
- Asteroids and AITargetDummy remain discoverable through Workspace Manager V2 Select Repo.
- No unresolved `asset-manager-v2.schema.json` or `palette-manager-v2.schema.json` schema reference regression was observed.

## Playwright Impact
- Playwright impacted: Yes.
- Expected pass behavior: weighted totals are `72`, `64`, `32`, then `0` for inactive-only asteroids; intervals monotonically decrease as totals decrease and stay within `0.18s`/`0.98s`.
- Expected fail behavior: raw object-count timing would make `16 medium` or `32 small` slower, or inactive objects would inflate the weighted total.

## Full Samples
- Full samples smoke test was skipped.
- Reason: scope is limited to Asteroids beat cadence and Workspace V2 schema/game discovery regression was covered by targeted/full Workspace V2 validation.

## Manual Validation
1. Launch `games/Asteroids/index.html`.
2. Start a game and listen for the alternating beat cadence.
3. Split large asteroids into medium asteroids and confirm the beat becomes faster.
4. Split medium asteroids into small asteroids and confirm the beat becomes faster again.
5. Confirm the cadence remains bounded and does not jump outside the existing slow/fast range.
