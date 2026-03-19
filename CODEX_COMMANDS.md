PLAN_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Create a surgical PR plan for migrating the smallest safe set of internal engine/game callers to GameObjectIdentityUtils after PR-007. Focus on gameObjectRegistry.js and gameObjectSystem.js first, preserve compatibility, keep GameObjectUtils as a compatibility bridge, and avoid destructive changes. Produce PR title, description, tasks, acceptance criteria, risk notes, commit comment, and the next BUILD_PR command.

BUILD_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Build the smallest safe internal identity-caller migration pass for ToolboxAid/HTML-JavaScript-Gaming. Update engine/game/gameObjectRegistry.js and engine/game/gameObjectSystem.js to use GameObjectIdentityUtils directly, keep GameObjectUtils as a compatibility bridge, and include docs/support files. Preserve imports/exports, behavior, and public API stability. Generate a drag/drop-ready zip matching repo structure exactly, plus CODEX_COMMANDS.md, commit comment, and next APPLY_PR command.

APPLY_PR
model: GPT-5.4-mini
reasoning: medium
chatGPT runs: YES
user runs: YES (apply zip locally, then trigger verification)
codex command:
Verify the built internal identity-caller migration patch after the user applies the zip locally. Confirm only approved files changed, preserve compatibility, and report changed files, validation results, and any violations.
