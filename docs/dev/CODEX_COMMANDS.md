Toolbox Aid
David Quesenberry
03/29/2026
CODEX_COMMANDS.md

MODEL: GPT-5.4
REASONING: medium
COMMAND: APPLY_PR_REPO_CLEANUP_PHASE_1C_SPRITE_EDITOR_HELPER_OWNERSHIP_AND_PANEL_BOUNDARY_NORMALIZATION

VALIDATIONS:
- node -c tools/SpriteEditor/modules/appPalette.js
- node -c tools/SpriteEditor/modules/appInput.js
- node -c tools/SpriteEditor/modules/appViewTools.js
- verify palette sidebar wheel behavior is unchanged
- verify reference tool guidance still routes to left panel controls
- verify no files changed under engine/, games/, samples/
