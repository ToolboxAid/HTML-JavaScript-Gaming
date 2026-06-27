# APPLY PR LEVEL 11.4 — Rewind Execution Candidate

## Objective
Apply and validate the Level 11.4 rewind execution implementation in `network_sample_c` without expanding scope.

## Apply Scope
- Confirm Sample C rewind execution is integrated and runnable
- Confirm deterministic replay behavior under repeated inputs
- Confirm timeline truncation and repopulation work as intended
- Confirm debug outputs reflect replay status and bounded history

## Constraints
- No engine-core changes
- No docs changes by Codex
- No expansion beyond `games/network_sample_c/*`

## Acceptance Summary
- Rewind-prep can reach `ready`
- Rewind execution returns success
- Replay frame count is reported
- Timeline remains bounded after replay
- Debug output reflects replay state consistently
