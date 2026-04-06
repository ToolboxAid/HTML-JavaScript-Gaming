# BUILD_PR_TOOL_REGISTRY_VALIDATOR_AND_SPRITE_FIRST_CLASS

## Purpose
Restore `Sprite Editor` as a first-class active tool in the registry-driven `tools/` surface, keep `SpriteEditor_old_keep` preserved but hidden, and add a filesystem-aware registry validator plus report output so tool-surface drift fails fast.

## Scope
In scope:
- `tools/toolRegistry.js` as the single source of truth for active and legacy tool metadata
- first-class active-surface rendering through `entry.active === true`
- `Sprite Editor` restored to the active first-class set
- legacy `SpriteEditor_old_keep` preserved but excluded from active rendering
- validator script that compares registry entries to `tools/` directories
- validation report output under `docs/dev/reports/`

Out of scope:
- tool implementation rewrites
- engine runtime changes
- destructive deletion of preserved sprite content

## Expected Active Tools
- Vector Map Editor
- Vector Asset Studio
- Tilemap Studio
- Parallax Scene Studio
- Sprite Editor

## Expected Legacy Tool
- SpriteEditor_old_keep

## Modules Created Or Changed
- `tools/toolRegistry.js`
- `tools/renderToolsIndex.js`
- `tools/shared/platformShell.js`
- `tools/index.html`
- `scripts/validate-active-tools-surface.mjs`
- `scripts/validate-tool-registry.mjs`
- `docs/pr/BUILD_PR_TOOL_REGISTRY_VALIDATOR_AND_SPRITE_FIRST_CLASS.md`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/reports/tool_registry_validation.txt`

## Registry Shape
Each tool entry now carries explicit registry-facing fields:
- `id`
- `name`
- `displayName`
- `path`
- `entryPoint`
- `active`
- `legacy`
- `order`
- `description`
- optional showcase metadata

## Implementation Summary
- restored `Sprite Editor` as `active: true`, `legacy: false`, and visible on the first-class tools surface
- kept `SpriteEditor_old_keep` as `active: false`, `legacy: true`, and excluded from active rendering
- updated active rendering paths so the landing page and shared shell use registry entries filtered by `entry.active === true`
- added `scripts/validate-tool-registry.mjs` to compare registry entries to actual `tools/` directories and emit a report
- expanded the active-surface validator so it expects the five approved active tools and confirms legacy sprite exclusion

## Validator Coverage
`scripts/validate-tool-registry.mjs` fails when:
- a registry entry points to a missing folder
- a tool directory is missing from the registry
- duplicate ids, names, or paths exist
- `Sprite Editor` is missing or inactive
- `SpriteEditor_old_keep` is active
- expected first-class tools are missing from the active registry set

`scripts/validate-active-tools-surface.mjs` fails when:
- active names do not match the approved five-tool surface
- legacy sprite paths appear in active navigation
- required engine theme/shared shell includes are missing
- stale deprecated sprite-rename references remain in the checked surface files

## Validation Performed
- `node --check tools/toolRegistry.js`
- `node --check tools/renderToolsIndex.js`
- `node --check tools/shared/platformShell.js`
- `node --check scripts/validate-active-tools-surface.mjs`
- `node --check scripts/validate-tool-registry.mjs`
- `node scripts/validate-tool-registry.mjs`
- `node scripts/validate-active-tools-surface.mjs`

## Validation Summary
- `Sprite Editor` is first-class and active in the registry
- `SpriteEditor_old_keep` remains preserved but excluded from active rendering
- active landing cards and shared header navigation are registry-driven through `entry.active === true`
- the registry validator report is written to `docs/dev/reports/tool_registry_validation.txt`
- active tool folders, entrypoints, and showcase/help links resolve cleanly

## Notes
- the actual preserved legacy folder on disk is `tools/SpriteEditor_old_keep/`
- active tool display names now align to the expected first-class list for this PR
