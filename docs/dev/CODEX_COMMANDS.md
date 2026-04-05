Toolbox Aid
David Quesenberry
04/05/2026
codex_commands.md

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_DEV_CONSOLE_COMMAND_PACKS as a docs-only, repo-structured delta.

Requirements:
- Follow PLAN_PR -> BUILD_PR -> APPLY_PR
- Docs-first only
- No implementation code in this bundle
- Plan namespaced command packs for the existing dev console
- Define command registry shape, help behavior, output contract, and validation conventions
- Keep implementation future scope limited to tools/dev and optional tests only
- Do not modify engine core
- Keep commit_comment.txt header-free
- Package output to:
  <project folder>/tmp/BUILD_PR_DEV_CONSOLE_COMMAND_PACKS_delta.zip
