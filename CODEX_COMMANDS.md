PLAN_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Create a surgical test-only PR plan for restoring meaningful overlay assertion coverage in tests/engine/game/gameUtilsTest.js after PR-013 restored harness compatibility. Keep the corrected drawPlayerSelection(config, gameControllers) call, preserve production behavior, inspect the real render collaborator path in GamePlayerSelectUi, and replace the placeholder assertion with a real overlay/background assertion. Produce PR title, description, tasks, acceptance criteria, risk notes, a focused test checklist, commit comment, and the next BUILD_PR command.

BUILD_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Build the surgical test-only patch for restoring drawPlayerSelection overlay assertion coverage in tests/engine/game/gameUtilsTest.js. Keep the corrected drawPlayerSelection(config, gameControllers) call, preserve production behavior, and use the real render collaborators used by GamePlayerSelectUi. Generate a drag/drop-ready zip with docs/support files.

APPLY_PR
model: GPT-5.4-mini
reasoning: medium
chatGPT runs: YES
user runs: YES (apply zip locally, then trigger verification)
codex command:
Verify the test-only patch for restoring drawPlayerSelection overlay assertion coverage after the user applies the zip locally. Confirm only approved test/docs files changed, production files remain untouched, and report targeted test results and any violations.
