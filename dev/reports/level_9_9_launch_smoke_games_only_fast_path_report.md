# Level 9.9 Launch Smoke Games-Only Fast Path Report

## Scope
- BUILD: `BUILD_PR_LEVEL_9_9_LAUNCH_SMOKE_GAMES_ONLY_FAST_PATH`
- Purpose: add a dedicated games-only launch smoke fast path without changing all-entry behavior.

## Package Script Change
- Updated `package.json` scripts:
  - Existing (kept): `"test:launch-smoke": "node ./tests/runtime/LaunchSmokeAllEntries.test.mjs"`
  - Added: `"test:launch-smoke:games": "node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --games"`

## Final Command
- `npm run test:launch-smoke:games`

## Validation

### Runner and Filter Behavior
- Runner file inspected: `tests/runtime/LaunchSmokeAllEntries.test.mjs`
- `--games` is an explicit filter flag parsed by `parseCliArgs`.
- With any explicit filter present, default include-all behavior is disabled.
- Effective include set for this command:
  - `games=true`
  - `samples=false`
  - `tools=false`

### Execution Proof
- Executed command: `npm run test:launch-smoke:games`
- Observed runtime log line:
  - `filters: games=true samples=false tools=false sampleRange=all`
- Observed discovery count:
  - `discovered 12 entries`
- Observed summary:
  - `PASS=12 FAIL=0 TOTAL=12`
- Observed launched entries were game paths only under `games/*/index.html`.

### Duplicate Execution Check
- `test:launch-smoke:games` invokes `LaunchSmokeAllEntries.test.mjs` directly exactly once.
- No wrapper script indirection exists for `test:launch-smoke:games` in `package.json`.
- Launch logs show one entry sequence `[1/12] ... [12/12]` and one final summary, indicating a single runner pass.

## All-Entry Behavior Preservation
- Existing full launch smoke command remains unchanged:
  - `npm run test:launch-smoke`

## Start_of_day
- No `start_of_day` files were modified.
