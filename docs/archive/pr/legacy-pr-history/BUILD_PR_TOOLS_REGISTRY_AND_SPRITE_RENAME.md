# BUILD_PR_TOOLS_REGISTRY_AND_SPRITE_RENAME

## Purpose
Implement the active `tools/` product surface cleanup by standardizing the canonical sprite tool at `tools/Sprite Editor`, introducing a single registry for active tools, generating the visible active tools list from that registry, and adding validation to detect naming and navigation drift.

## Scope
- standardize the canonical sprite tool folder at `tools/Sprite Editor/`
- update active sprite tool labels, titles, links, and canonical path usage
- add a single source of truth for active tool metadata
- render the active tools list from the shared registry instead of hardcoded hub cards
- exclude preserved legacy tools from the active tools list
- add a lightweight validation script for active tool folder/name/navigation drift
- validate active tool loading paths after the rename

## Canonical Active Tools
- `Vector Map Editor`
- `Vector Asset Studio`
- `Tile Map Editor`
- `Parallax Editor`
- `Sprite Editor`

## Legacy-Preserved Tools
- `tools/SpriteEditor_old_keep/` remains preserved on disk
- legacy-preserved tools are not visible in the active tools list

## Implemented Files
- `tools/toolRegistry.js`
- `tools/renderToolsIndex.js`
- `tools/index.html`
- `tools/Sprite Editor/index.html`
- `tools/Sprite Editor/README.md`
- `scripts/validate-active-tools-surface.mjs`
- `docs/pr/BUILD_PR_TOOLS_REGISTRY_AND_SPRITE_RENAME.md`
- `docs/operations/dev/commit_comment.txt`
- `docs/reports/file_tree.txt`
- `docs/reports/change_summary.txt`
- `docs/reports/validation_checklist.txt`

## Build Notes
- The canonical sprite tool folder is now `tools/Sprite Editor/`.
- The active tool list now renders from `tools/toolRegistry.js`.
- The registry is the canonical source for active tool display names, folder names, entry points, descriptions, and visibility.
- The visible active list uses the approved first-class naming even where the underlying canonical folder names remain `Tilemap Studio` and `Parallax Scene Studio`.
- `tools/SpriteEditor_old_keep/` stays preserved and is explicitly marked `legacy` with `visibleInToolsList: false`.

## Validation
- `node --check tools/toolRegistry.js`
- `node --check tools/renderToolsIndex.js`
- `node --check tools/Sprite Editor/main.js`
- `node --check tools/Sprite Editor/modules/spriteEditorApp.js`
- `node --check tools/Tilemap Studio/main.js`
- `node --check tools/Parallax Scene Studio/main.js`
- `node --check tools/Vector Asset Studio/main.js`
- `node --check tools/Vector Map Editor/main.js`
- `node scripts/validate-active-tools-surface.mjs`

## Validation Summary
- active sprite tool folder exists at `tools/Sprite Editor/`
- no stale sprite-editor rename references remain in the canonical tool hub/build-report surface checked by the validation script
- the generated active tools list comes from the shared registry
- only the approved five first-class tools are visible in the active tools list
- legacy-preserved tools are excluded from the active navigation
- active tool entry paths resolve cleanly after the rename

## Non-Goals Preserved
- no engine behavior changes outside tool naming/navigation/validation scope
- no destructive deletion of preserved legacy content
- no unrelated runtime or gameplay refactor
