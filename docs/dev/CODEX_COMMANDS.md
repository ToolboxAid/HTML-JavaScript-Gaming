Toolbox Aid
David Quesenberry
04/05/2026
codex_commands.md

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_INTERACTIVE_DEV_CONSOLE_UI as a docs-only, repo-structured delta.

Requirements:
- Follow PLAN_PR -> BUILD_PR -> APPLY_PR
- Docs-first only
- No implementation code in this bundle
- Plan a canvas-rendered interactive console UI
- Reuse existing runtime and combo-key controls
- Scope implementation to tools/dev and one sample entry only
- Define input behavior, output history, validation steps, and rollback notes
- Keep commit_comment.txt header-free
- Package output to:
  <project folder>/tmp/BUILD_PR_INTERACTIVE_DEV_CONSOLE_UI_delta.zip
