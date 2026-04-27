# BUILD_PR_LEVEL_9_9_LAUNCH_SMOKE_GAMES_ONLY_FAST_PATH

## Objective
Make the browser smoke test requested for game validation run:

```text
games only
once
```

## Root Cause
In `tests/runtime/LaunchSmokeAllEntries.test.mjs`, CLI parsing defaults to all entry types when no explicit filter is passed:

```js
includeGames: anyExplicitFilter ? includeGames : true,
includeSamples: anyExplicitFilter ? includeSamples : true,
includeTools: anyExplicitFilter ? includeTools : true,
```

So a command that does not pass `--games` runs games + samples + tools.

## Required Fix

### 1. Add a dedicated games-only command/script
Add or normalize a command that runs:

```text
tests/runtime/LaunchSmokeAllEntries.test.mjs --games
```

Preferred npm script name:

```json
"test:launch-smoke:games": "node tests/runtime/LaunchSmokeAllEntries.test.mjs --games"
```

If existing wrapper scripts are used, wire that script to them.

### 2. Do NOT change all-entry behavior unless already intended
Keep existing all-entry smoke behavior available for full coverage.

### 3. Ensure no duplicate game execution
Audit for wrappers that call both:
- all-entry smoke
- games-only smoke

The games-only script must invoke the runner only once.

### 4. Add report
Create:

```text
docs/dev/reports/level_9_9_launch_smoke_games_only_fast_path_report.md
```

Report:
- package script added/updated
- exact command to run
- entry counts discovered
- confirmation samples/tools are excluded
- confirmation games are not duplicated

## Acceptance
- `npm run test:launch-smoke:games` exists or equivalent documented command exists.
- The command passes `--games`.
- Games-only run does not include samples.
- Games-only run does not include tools.
- Games-only run does not execute games twice.
- Existing full launch smoke still exists.
- No start_of_day changes.
