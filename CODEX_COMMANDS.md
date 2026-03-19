PLAN_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Create a surgical PR plan for narrowing collision facade exposure from GameObjectSystem in engine/game. Preserve compatibility, avoid destructive changes, and keep the PR small. Focus on clarifying GameCollision as the collision boundary and GameObjectSystem as a transitional compatibility facade for collision passthroughs. Produce PR title, description, tasks, acceptance criteria, risk notes, commit comment, and the next BUILD_PR command.

BUILD_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Build the smallest safe collision facade narrowing pass for ToolboxAid/HTML-JavaScript-Gaming. Modify only engine/game/gameCollision.js and engine/game/gameObjectSystem.js plus docs/support files. Preserve default exports, imports, behavior, and public API. Generate a drag/drop-ready zip matching repo structure exactly, plus CODEX_COMMANDS.md, commit comment, and next APPLY_PR command. No placeholders.

APPLY_PR
model: GPT-5.4-mini
reasoning: medium
chatGPT runs: YES
user runs: YES (apply zip locally, then trigger verification)
codex command:
Verify the built collision facade narrowing patch after the user applies the zip locally. Confirm only approved files changed, preserve compatibility, and report changed files, validation results, and any violations.
