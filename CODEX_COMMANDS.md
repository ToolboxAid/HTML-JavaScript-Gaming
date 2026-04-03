Toolbox Aid
David Quesenberry
04/03/2026
CODEX_COMMANDS.md

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_SPRITE_EDITOR_USABILITY_POLISH.

Use docs/pr/PLAN_PR_SPRITE_EDITOR_USABILITY_POLISH.md as the approved plan source of truth.

Goal:
Implement the approved usability-polish PR for the isolated Sprite Editor only.

Scope rules:
1. Only implement the approved polish items from the plan.
2. Do not expand scope beyond the approved plan.
3. Do not review, modify, migrate, or delete any pre-existing sprite editor outside tools/Sprite Editor/
4. Do not touch engine code or unrelated tools.
5. Leave unrelated workspace modifications untouched.
6. Preserve required file headers on all new files.
7. Follow repo workflow and keep this PR small and surgical.

Primary implementation targets:
- Better tool-state visibility for active tool / active color / active frame
- Keyboard shortcuts for approved actions from the plan
- Undo/redo if approved in the plan
- Clear resize/new-canvas behavior based on the approved contract
- Better import/export feedback messaging
- Improved recent-color swatch behavior
- Preview panel polish for FPS / play / pause clarity
- Optional status bar if approved in the plan
- Mouse interaction polish for drag drawing reliability
- Save/load UX cleanup

Packaging:
- tmp/BUILD_PR_SPRITE_EDITOR_USABILITY_POLISH_delta.zip
