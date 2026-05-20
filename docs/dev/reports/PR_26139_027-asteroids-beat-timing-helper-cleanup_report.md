# PR_26139_027-asteroids-beat-timing-helper-cleanup

## Summary
- Extracted Asteroids weighted beat timing logic from `AsteroidsGameScene.js` into `games/Asteroids/game/asteroidsBeatTiming.js`.
- Preserved the PR_26139_026 weights and cadence behavior:
  - large asteroid: `9`
  - medium asteroid: `4`
  - small asteroid: `1`
- Kept cadence tuning unchanged at the existing `0.18s` fast bound and `0.98s` slow bound.
- Left `AsteroidsGameScene.js` responsible only for baseline lifecycle and applying the resolved beat interval.

## Behavior Preservation
- The targeted PR_26139_026 validation still confirms:
  - `8 large = 72`
  - `16 medium = 64`
  - `32 small = 32`
  - inactive asteroid objects do not contribute
  - lower weighted total produces faster cadence

## Validation
- PASS: `npm run build:manifest`
- PASS: `npx playwright test tests/playwright/tools/AsteroidsBeatTiming.spec.mjs --project=playwright --workers=1 --reporter=list`
  - 1 passed.
- PASS: `git diff --check`

## Coverage
- Playwright impacted: Yes.
- V8 coverage collected the changed Asteroids files:
  - `(51%) games/Asteroids/game/AsteroidsGameScene.js - changed JS file with browser V8 coverage`
  - `(100%) games/Asteroids/game/asteroidsBeatTiming.js - changed JS file with browser V8 coverage`
- Note: the existing changed-runtime guardrail classifies only `src/`, `tools/`, and `common/` as runtime JS, so Asteroids game files appear under `Changed JS files considered` rather than `Changed runtime JS files covered`.

## Full Samples
- Full samples smoke test was skipped.
- Reason: scope is limited to a focused Asteroids helper extraction with unchanged beat timing behavior covered by the targeted Asteroids Playwright test.

## Manual Validation
1. Launch `games/Asteroids/index.html`.
2. Start a game.
3. Split large asteroids into medium asteroids and confirm the beat speeds up.
4. Split medium asteroids into small asteroids and confirm the beat speeds up again.
5. Confirm cadence remains bounded and no gameplay/rendering behavior changes beyond the PR_26139_026 beat timing behavior.
