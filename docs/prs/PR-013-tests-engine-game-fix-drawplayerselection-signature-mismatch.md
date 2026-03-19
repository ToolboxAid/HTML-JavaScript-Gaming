# PR-013: tests/engine/game fix drawPlayerSelection signature mismatch

## Title

tests/engine/game: fix drawPlayerSelection signature mismatch in gameUtilsTest

## Scope

This is a surgical test-only PR.

Primary file:
- `tests/engine/game/gameUtilsTest.js`

Support files:
- `docs/prs/PR-013-tests-engine-game-fix-drawplayerselection-signature-mismatch.md`
- `CODEX_COMMANDS.md`
- `PRE_COMMIT_TEST_CHECKLIST.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Why this PR exists

The investigation confirmed the failing overlay assertion was caused by a pre-existing test/API mismatch:
- test called `GamePlayerSelectUi.drawPlayerSelection(mockCtx, renderConfig, gameControllers)`
- actual signature is `drawPlayerSelection(config, gameControllers = null)`

## What changed

- corrected the test invocation to match the real UI API
- kept the fix test-only
- preserved production behavior

## What did not change

- no production files changed
- no API changes
- no gameplay behavior changes
