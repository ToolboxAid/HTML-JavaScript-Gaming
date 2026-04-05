MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_TOOL_REGISTRY_VALIDATOR_AND_SPRITE_FIRST_CLASS as a docs-aligned implementation PR.

REQUIREMENTS:
1. Keep `tools/` first-class and registry-driven.
2. Make `Sprite Editor` first-class and active in `tools/toolRegistry.js`.
3. Keep `SpriteEditor_old_keep` preserved but excluded from active tool rendering.
4. Update all active header/tool-surface rendering to use `entry.active === true`.
5. Add a registry validator script that compares registry entries to filesystem directories.
6. Fail validation on missing folders, missing registry entries, duplicate ids/names/paths, inactive `Sprite Editor`, or active legacy `SpriteEditor_old_keep`.
7. Add a validation report output under `docs/dev/reports/` or equivalent repo-appropriate dev report location.

EXPECTED ACTIVE TOOLS:
- Vector Map Editor
- Vector Asset Studio
- Tilemap Studio
- Parallax Scene Studio
- Sprite Editor

EXPECTED LEGACY TOOL:
- SpriteEditor_old_keep

OUTPUT:
<project folder>/tmp/BUILD_PR_TOOL_REGISTRY_VALIDATOR_AND_SPRITE_FIRST_CLASS.zip
