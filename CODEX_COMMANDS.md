Toolbox Aid
David Quesenberry
04/03/2026
CODEX_COMMANDS.md

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_SPRITE_EDITOR_USABILITY_POLISH.

Goal:
Implement a small, surgical usability-polish PR for the isolated Sprite Editor now that core features are working.

Scope rules:
1. Do not review, modify, migrate, or delete any pre-existing sprite editor outside tools/Sprite Editor/
2. Keep scope limited to tools/Sprite Editor/, tools/index.html only if needed, and docs/reports
3. Do not expand into engine or unrelated tools
4. Docs-first
5. One PR per purpose
6. Preserve required file headers
7. No destructive changes

Polish targets:
- Better tool-state visibility for active tool / active color / active frame
- Keyboard shortcuts plan (pencil, eraser, fill, grid toggle, onion skin toggle, frame next/prev)
- Undo/redo implementation
- Clear resize/new-canvas behavior contract messaging
- Better import/export feedback messaging
- Improved recent-color swatch behavior
- Preview panel polish for FPS/play/pause clarity
- Optional status bar (canvas size, zoom, active frame, cursor pixel position)
- Mouse drag drawing reliability polish
- Save/load UX cleanup

Required outputs:
- docs/pr/BUILD_PR_SPRITE_EDITOR_USABILITY_POLISH.md
- CODEX_COMMANDS.md
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt
- docs/dev/reports/file_tree.txt

Packaging:
- tmp/BUILD_PR_SPRITE_EDITOR_USABILITY_POLISH_delta.zip
