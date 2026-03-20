# PR-018: tests/engine/game add GameTurnFlowUtils direct equivalence probe

## Title

tests/engine/game: add direct GameTurnFlowUtils equivalence probe

## Scope

This is a surgical test-only PR.

Primary file:
- `tests/engine/game/gameUtilsTest.js`

Support files:
- `docs/prs/PR-018-tests-engine-game-add-gameturnflowutils-direct-equivalence-probe.md`
- `CODEX_COMMANDS.md`
- `PRE_COMMIT_TEST_CHECKLIST.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Why this PR exists

This PR adds a direct equivalence probe that compares `GameUtils.swapPlayer(...)` with `GameTurnFlowUtils.swapPlayer(...)` across a few representative cases.

## What changed

- added a direct equivalence probe for `swapPlayer`
- kept the change test-only
- preserved production behavior

## What did not change

- no production files changed
- no API changes
- no gameplay behavior changes