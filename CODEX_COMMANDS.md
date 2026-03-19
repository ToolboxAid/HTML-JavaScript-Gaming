PLAN_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Create a surgical PR plan for tightening lifecycle ownership between GameObjectManager and GameObjectSystem in engine/game. Preserve compatibility, avoid destructive changes, and keep the PR small. Focus on clarifying manager as active-membership owner and system as authoritative lifecycle orchestrator. Produce PR title, description, tasks, acceptance criteria, risk notes, commit comment, and the next BUILD_PR command.

BUILD_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Build the smallest safe manager/system lifecycle boundary pass for ToolboxAid/HTML-JavaScript-Gaming. Modify only engine/game/gameObjectManager.js and engine/game/gameObjectSystem.js plus docs/support files. Preserve default exports, imports, behavior, and public API. Generate a drag/drop-ready zip matching repo structure exactly, plus CODEX_COMMANDS.md, commit comment, and next APPLY_PR command. No placeholders.

APPLY_PR
model: GPT-5.4-mini
reasoning: medium
chatGPT runs: YES
user runs: YES (apply zip locally, then trigger verification)
codex command:
Verify the built manager/system lifecycle boundary patch after the user applies the zip locally. Confirm only approved files changed, preserve compatibility, and report changed files, validation results, and any violations.
