# PLAN_PR_LEVEL_9_9_LAUNCH_SMOKE_GAMES_ONLY_FAST_PATH

## Purpose
Fix the browser launch smoke workflow so a requested games-only test runs games only, once.

## Finding
The runner file is:

`tests/runtime/LaunchSmokeAllEntries.test.mjs`

Its default CLI behavior currently includes:
- games
- samples
- tools

Unless explicit filters are provided.

This explains the long run when the desired test was games only.

## Scope
- Add/normalize a games-only fast path.
- Ensure games-only does not run samples/tools.
- Ensure games are not run twice.
- Add report and expected delta output.
- No start_of_day changes.

## Non-Goals
- No broad test framework rewrite.
- No sample smoke changes.
- No game runtime changes.
