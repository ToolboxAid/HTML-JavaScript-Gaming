PLAN_PR
model: GPT-5.4
reasoning: high
codex command: Create a surgical implementation plan for the first runtime-neutral code patch in engine/game. Use the existing patch spec and preserve compatibility. Limit scope to comment-only or runtime-neutral marker edits in gameCollision.js, gameObjectManager.js, gameObjectRegistry.js, gameObjectSystem.js, gameObjectUtils.js, and gameUtils.js. Produce PR title, PR description, implementation tasks, acceptance criteria, risk notes, commit comment, and the next BUILD_PR command. Do not introduce behavior changes, imports, moves, renames, or public API changes.

BUILD_PR
model: GPT-5.4
reasoning: high
codex command: Build the first runtime-neutral engine/game implementation PR for ToolboxAid/HTML-JavaScript-Gaming. Modify only the approved target files with comment-only or runtime-neutral compatibility markers. Add a docs-first PR file under /docs/prs describing scope, constraints, touched files, and follow-up direction. Generate a drag/drop-ready zip matching repo structure exactly, plus CODEX_COMMANDS.md, commit comment, and next APPLY_PR command. Preserve compatibility and make no behavior changes.

APPLY_PR
model: GPT-5.4-mini
reasoning: medium
codex command: Apply the built runtime-neutral engine/game patch exactly as prepared. Verify only approved files are changed, confirm no behavior changes, and finalize the PR payload and apply summary.
