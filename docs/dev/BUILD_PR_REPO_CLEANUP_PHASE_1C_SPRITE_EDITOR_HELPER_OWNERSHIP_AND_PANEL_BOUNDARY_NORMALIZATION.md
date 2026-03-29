Toolbox Aid
David Quesenberry
03/29/2026
BUILD_PR_REPO_CLEANUP_PHASE_1C_SPRITE_EDITOR_HELPER_OWNERSHIP_AND_PANEL_BOUNDARY_NORMALIZATION.md

# BUILD_PR - Repo Cleanup Phase 1C

## Source of Truth
- `docs/dev/PLAN_PR_REPO_CLEANUP_PHASE_1C_SPRITE_EDITOR_HELPER_OWNERSHIP_AND_PANEL_BOUNDARY_NORMALIZATION.md`

## Scope Confirmation
- Docs-first, Sprite Editor-only delta
- No `engine/`, `games/`, or `samples/` modifications

## Full Repo-Relative Paths (Touched for This BUILD)
- `tools/SpriteEditor/modules/appPalette.js`
- `tools/SpriteEditor/modules/appInput.js`
- `tools/SpriteEditor/modules/appViewTools.js`
- `docs/dev/PLAN_PR_REPO_CLEANUP_PHASE_1C_SPRITE_EDITOR_HELPER_OWNERSHIP_AND_PANEL_BOUNDARY_NORMALIZATION.md`
- `docs/dev/BUILD_PR_REPO_CLEANUP_PHASE_1C_SPRITE_EDITOR_HELPER_OWNERSHIP_AND_PANEL_BOUNDARY_NORMALIZATION.md`
- `docs/dev/CODEX_COMMANDS.md`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/NEXT_COMMAND.txt`
- `docs/dev/README.md`

## Helper Ownership Before/After
| helper | before owner | after owner | normalization reason | behavior change |
|---|---|---|---|---|
| Palette sidebar wheel hit-test and scroll step logic | `tools/SpriteEditor/modules/appInput.js` (`onWheel`) | `tools/SpriteEditor/modules/appPalette.js` (`isPointInPaletteSidebar`, `scrollPaletteSidebarByWheel`, `handlePaletteSidebarWheel`) | Palette sidebar state/metrics belong to palette/right-panel ownership | none |
| Reference tool guidance message (`"Reference tool: use left panel controls."`) | duplicated in `tools/SpriteEditor/modules/appInput.js` and `tools/SpriteEditor/modules/appViewTools.js` | `tools/SpriteEditor/modules/appViewTools.js` (`showReferenceToolPanelGuidance`) with `appInput` delegating | Removes duplication; keeps tool guidance in tool/view ownership | none |

## Minimal Sprite Editor Module Delta Applied
1. `tools/SpriteEditor/modules/appPalette.js`
- Added palette-sidebar ownership helpers:
  - `isPointInPaletteSidebar(point)`
  - `scrollPaletteSidebarByWheel(deltaY)`
  - `handlePaletteSidebarWheel(point, deltaY)`

2. `tools/SpriteEditor/modules/appInput.js`
- Replaced inline palette wheel block with delegated call:
  - `this.handlePaletteSidebarWheel(p, e.deltaY)`
- Replaced direct reference guidance message with:
  - `this.showReferenceToolPanelGuidance(true)`

3. `tools/SpriteEditor/modules/appViewTools.js`
- Added:
  - `showReferenceToolPanelGuidance(render = false)`
- Reused this helper in `applyGridTool` reference-tool branch.

## Validation
- `node -c tools/SpriteEditor/modules/appPalette.js`
- `node -c tools/SpriteEditor/modules/appInput.js`
- `node -c tools/SpriteEditor/modules/appViewTools.js`

## Handoff Files Included
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/NEXT_COMMAND.txt`
