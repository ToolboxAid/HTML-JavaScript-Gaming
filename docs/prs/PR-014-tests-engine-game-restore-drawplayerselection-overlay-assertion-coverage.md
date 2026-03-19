# PR-014: tests/engine/game restore drawPlayerSelection overlay assertion coverage

## Title

tests/engine/game: restore drawPlayerSelection overlay assertion coverage

## Scope

This is a surgical, test-only PR.

Primary file:
- `tests/engine/game/gameUtilsTest.js`

Support files:
- `docs/prs/PR-014-tests-engine-game-restore-drawplayerselection-overlay-assertion-coverage.md`
- `CODEX_COMMANDS.md`
- `PRE_COMMIT_TEST_CHECKLIST.md`
- `COMMIT_COMMENT.txt`
- `NEXT_COMMAND.md`

## Why this PR exists

PR-013 restored harness compatibility and fixed the signature mismatch, but it reduced the original overlay assertion to a placeholder. This PR restores meaningful coverage by asserting the real render collaborator path used by `GamePlayerSelectUi.drawPlayerSelection(config, gameControllers)`.

## What changed

- kept the corrected `drawPlayerSelection(config, gameControllers)` call
- replaced the placeholder assertion with a real overlay/background assertion
- stubbed `PrimitiveRenderer.drawOverlay` and `CanvasText.renderText` in the test to observe the actual UI render path
- kept production files untouched

## What did not change

- no production files changed
- no API changes
- no gameplay behavior changes
