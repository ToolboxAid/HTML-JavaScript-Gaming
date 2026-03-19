PLAN_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Create a surgical PR plan for the first real gameplay-facing utility split in engine/game by extracting the player-selection helper cluster from gameUtils into a new GamePlayerSelectionUtils utility. Preserve compatibility by keeping GameUtils methods as delegation-based bridges. Keep the PR small, avoid destructive changes, and do not change gameplay behavior. Produce PR title, description, tasks, acceptance criteria, risk notes, a pre-commit test checklist, commit comment, and the next BUILD_PR command.

BUILD_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Build the first real gameplay-facing utility split for ToolboxAid/HTML-JavaScript-Gaming. Add engine/game/gamePlayerSelectionUtils.js, update engine/game/gameUtils.js to delegate extracted player-selection methods through a compatibility bridge, and include docs/support files. Preserve imports/exports, behavior, and public API stability. Generate a drag/drop-ready zip matching repo structure exactly, plus CODEX_COMMANDS.md, PRE_COMMIT_TEST_CHECKLIST.md, commit comment, and next APPLY_PR command.

APPLY_PR
model: GPT-5.4-mini
reasoning: medium
chatGPT runs: YES
user runs: YES (apply zip locally, then trigger verification)
codex command:
Verify the built first gameplay-facing split patch after the user applies the zip locally. Confirm only approved files changed, preserve compatibility, and report changed files, validation results, and any violations.
