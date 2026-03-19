PLAN_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Create a surgical PR plan for the first real utility split candidate in engine/game. Focus on extracting object identity helpers from gameObjectUtils into a dedicated GameObjectIdentityUtils utility while preserving compatibility. Keep the PR small, avoid destructive changes, and retain existing gameObjectUtils methods as a compatibility bridge. Produce PR title, description, tasks, acceptance criteria, risk notes, commit comment, and the next BUILD_PR command.

BUILD_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Build the first real utility split candidate for ToolboxAid/HTML-JavaScript-Gaming. Add engine/game/gameObjectIdentityUtils.js, update engine/game/gameObjectUtils.js to delegate identity helpers through a compatibility bridge, and include docs/support files. Preserve imports/exports, behavior, and public API stability. Generate a drag/drop-ready zip matching repo structure exactly, plus CODEX_COMMANDS.md, commit comment, and next APPLY_PR command.

APPLY_PR
model: GPT-5.4-mini
reasoning: medium
chatGPT runs: YES
user runs: YES (apply zip locally, then trigger verification)
codex command:
Verify the built first real utility split patch after the user applies the zip locally. Confirm only approved files changed, preserve compatibility, and report changed files, validation results, and any violations.
