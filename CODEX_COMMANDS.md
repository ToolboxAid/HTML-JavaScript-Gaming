PLAN_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Create a surgical test-only PR plan for fixing the drawPlayerSelection signature mismatch in tests/engine/game/gameUtilsTest.js. The investigation confirmed the failure is a pre-existing test/API mismatch, not a production regression. Update the test to match GamePlayerSelectUi.drawPlayerSelection(config, gameControllers), preserve production behavior, and keep the fix very small. Produce PR title, description, tasks, acceptance criteria, risk notes, a focused test checklist, commit comment, and the next BUILD_PR command.

BUILD_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Build the surgical test-only fix for the pre-existing drawPlayerSelection signature mismatch in tests/engine/game/gameUtilsTest.js. Preserve production behavior, keep scope to the test plus docs/support files, and generate a drag/drop-ready zip with CODEX_COMMANDS.md, PRE_COMMIT_TEST_CHECKLIST.md, COMMIT_COMMENT.txt, and NEXT_COMMAND.md.

APPLY_PR
model: GPT-5.4-mini
reasoning: medium
chatGPT runs: YES
user runs: YES (apply zip locally, then trigger verification)
codex command:
Verify the test-only patch for fixing the drawPlayerSelection signature mismatch after the user applies the zip locally. Confirm only approved files changed, production files remain untouched, and report test results and any violations.
