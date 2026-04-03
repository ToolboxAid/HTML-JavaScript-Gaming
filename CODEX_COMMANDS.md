Toolbox Aid
David Quesenberry
04/03/2026
CODEX_COMMANDS.md

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_SPRITE_EDITOR_PROJECT_INTEGRATION.

Use docs/pr/PLAN_PR_SPRITE_EDITOR_PROJECT_INTEGRATION.md as the approved plan source of truth.

Goal:
Implement a small, surgical Sprite Editor integration PR so palette flow uses engine authority and session/project lock rules.

Required integration rule:
1. Sprite Editor must use engine paletteList as source of truth.
2. Palette list is loaded from engine contract, not local hardcoded tool authority.
3. Editing remains disabled until palette selected.
4. Selected palette becomes locked for active project/session.
5. Palette switching remains blocked unless explicit new/reset project flow is used.
6. Lock behavior must match plan contracts for new project/load/import/resize/duplicate/save-load.
7. No engine-boundary bypass and no duplicated palette authority inside tool.

Scope rules:
- Do not review/modify legacy sprite editor implementations outside tools/Sprite Editor/
- Keep scope small and surgical
- Prefer public engine-facing contracts only
- No unrelated engine/tool rewrites
- Docs-first and one PR per purpose
- Preserve file headers

Packaging:
- tmp/BUILD_PR_SPRITE_EDITOR_PROJECT_INTEGRATION_delta.zip
