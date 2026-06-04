# BUILD_PR_TOOLS_REGISTRY_AND_SPRITE_RENAME

## Purpose
Implement the active `toolbox/` product surface cleanup by standardizing the canonical sprite tool at `toolbox/Sprite Editor`, introducing a single registry for active tools, generating the visible active tools list from that registry, and adding validation to detect naming and navigation drift.

## Scope
- standardize the canonical sprite tool folder at `toolbox/Sprite Editor/`
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
- `toolbox/SpriteEditor_old_keep/` remains preserved on disk
- legacy-preserved tools are not visible in the active tools list

## Implemented Files
- `toolbox/toolRegistry.js`
- `toolbox/renderToolsIndex.js`
- `toolbox/index.html`
- `toolbox/Sprite Editor/index.html`
- `toolbox/Sprite Editor/README.md`
- `scripts/validate-active-tools-surface.mjs`
- `docs_build/pr/BUILD_PR_TOOLS_REGISTRY_AND_SPRITE_RENAME.md`
- `docs_build/operations/dev/commit_comment.txt`
- `docs_build/reports/file_tree.txt`
- `docs_build/reports/change_summary.txt`
- `docs_build/reports/validation_checklist.txt`

## Build Notes
- The canonical sprite tool folder is now `toolbox/Sprite Editor/`.
- The active tool list now renders from `toolbox/toolRegistry.js`.
- The registry is the canonical source for active tool display names, folder names, entry points, descriptions, and visibility.
- The visible active list uses the approved first-class naming even where the underlying canonical folder names remain `Tilemap Studio` and `Parallax Scene Studio`.
- `toolbox/SpriteEditor_old_keep/` stays preserved and is explicitly marked `legacy` with `visibleInToolsList: false`.

## Validation
- `node --check toolbox/toolRegistry.js`
- `node --check toolbox/renderToolsIndex.js`
- `node --check toolbox/Sprite Editor/main.js`
- `node --check toolbox/Sprite Editor/modules/spriteEditorApp.js`
- `node --check toolbox/Tilemap Studio/main.js`
- `node --check toolbox/Parallax Scene Studio/main.js`
- `node --check toolbox/Vector Asset Studio/main.js`
- `node --check toolbox/Vector Map Editor/main.js`
- `node scripts/validate-active-tools-surface.mjs`

## Validation Summary
- active sprite tool folder exists at `toolbox/Sprite Editor/`
- no stale sprite-editor rename references remain in the canonical tool hub/build-report surface checked by the validation script
- the generated active tools list comes from the shared registry
- only the approved five first-class tools are visible in the active tools list
- legacy-preserved tools are excluded from the active navigation
- active tool entry paths resolve cleanly after the rename

## Non-Goals Preserved
- no engine behavior changes outside tool naming/navigation/validation scope
- no destructive deletion of preserved legacy content
- no unrelated runtime or gameplay refactor
