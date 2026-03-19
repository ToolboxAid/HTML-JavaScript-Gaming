PLAN_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Create a surgical PR plan for migrating GameObjectManager to GameObjectIdentityUtils after PR-008. Preserve compatibility, keep GameObjectUtils as a compatibility bridge, avoid destructive changes, and keep the PR very small. Produce PR title, description, tasks, acceptance criteria, risk notes, a pre-commit test checklist, commit comment, and the next BUILD_PR command.

BUILD_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO
codex command:
Build the smallest safe manager identity-migration pass for ToolboxAid/HTML-JavaScript-Gaming. Update only engine/game/gameObjectManager.js to use GameObjectIdentityUtils directly, keep GameObjectUtils as a compatibility bridge, and include docs/support files. Preserve imports/exports, behavior, and public API stability. Generate a drag/drop-ready zip matching repo structure exactly, plus CODEX_COMMANDS.md, PRE_COMMIT_TEST_CHECKLIST.md, commit comment, and next APPLY_PR command.

APPLY_PR
model: GPT-5.4-mini
reasoning: medium
chatGPT runs: YES
user runs: YES (apply zip locally, then trigger verification)
codex command:
Verify the built manager identity-migration patch after the user applies the zip locally. Confirm only approved files changed, preserve compatibility, and report changed files, validation results, and any violations.
