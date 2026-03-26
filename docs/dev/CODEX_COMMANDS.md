Toolbox Aid
David Quesenberry
03/26/2026
CODEX_COMMANDS.md

MODEL: GPT-5.4
REASONING: medium

COMMAND:
Apply docs/pr/BUILD_PR_TOOLS_SPRITE_EDITOR_V4_4_LAYER_MERGE_FLATTEN_EXPORT_SAFETY.md

Constraints:
- Keep architecture intact
- Reuse existing layer/history/dirty-state/save-load/render/command systems
- Add Merge Down and Flatten Frame safely
- Guard flatten with canvas-native confirm/cancel
- Keep destructive actions undoable
- Avoid no-op history pollution
- Do not rewrite architecture
