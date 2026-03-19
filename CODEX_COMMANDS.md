PLAN_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Create a surgical PR plan for extracting gameplay turn-flow/state helpers from engine/game/gameUtils.js into a new GameTurnFlowUtils utility. Preserve compatibility by keeping GameUtils methods as delegation-based bridges, avoid destructive changes, and keep the PR small. Produce PR title, description, tasks, acceptance criteria, risk notes, a pre-commit test checklist, commit comment, and the next BUILD_PR command.

BUILD_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Build the gameplay turn-flow/state helper split for ToolboxAid/HTML-JavaScript-Gaming. Add engine/game/gameTurnFlowUtils.js, update engine/game/gameUtils.js to delegate extracted turn-flow methods through a compatibility bridge, and include docs/support files. Preserve imports/exports, behavior, and public API stability. Generate a drag/drop-ready zip matching repo structure exactly, plus CODEX_COMMANDS.md, PRE_COMMIT_TEST_CHECKLIST.md, commit comment, and next APPLY_PR command.

APPLY_PR
model: GPT-5.4-mini
reasoning: medium
chatGPT runs: YES
user runs: YES (apply zip locally, then trigger verification)
codex command:
Verify the built gameplay turn-flow helper split patch after the user applies the zip locally. Confirm only approved files changed, preserve compatibility, and report targeted test results and any violations.
