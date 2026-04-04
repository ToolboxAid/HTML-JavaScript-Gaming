Toolbox Aid
David Quesenberry
04/03/2026
BUILD_PR_SPRITE_EDITOR_FROM_SCRATCH.md

# BUILD_PR_SPRITE_EDITOR_FROM_SCRATCH

## Goal
Build a brand-new browser Sprite Editor from scratch as an isolated tool under `tools/Sprite Editor V3/`.

## Required constraints
- Do not review, migrate, refactor, or depend on existing Sprite Editor implementations.
- Do not delete, rename, overwrite, or clean up existing sprite-editor-related files/folders.
- Keep this PR surgical and limited to the new tool + required docs/reports + tool hub link.
- Follow workflow: PLAN_PR -> BUILD_PR -> APPLY_PR.
- Docs-first and one PR per purpose.
- No destructive changes.

## Required deliverables
- `docs/pr/BUILD_PR_SPRITE_EDITOR_FROM_SCRATCH.md`
- `CODEX_COMMANDS.md`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`
- `docs/dev/reports/file_tree.txt`
- New isolated tool in `tools/Sprite Editor V3/`
- New link in `tools/index.html`
- Delta zip at `tmp/BUILD_PR_SPRITE_EDITOR_FROM_SCRATCH_delta.zip`

## Feature minimum for the new tool
- Create new sprite canvas with configurable width/height
- Configurable pixel size (zoom)
- Grid toggle
- Pencil, eraser, fill
- Palette with active color + recent swatches
- Frame workflow: add, duplicate, delete, next/previous
- Onion-skin toggle
- Import PNG into current frame
- Export PNG (current frame)
- Export sprite sheet (all frames)
- Save/load editor project as JSON
- Transparent background support
- Mouse-friendly editing with visible selected tool/state
- Animation preview panel with FPS control

## Scope boundaries
In scope:
- `tools/Sprite Editor V3/**`
- `tools/index.html` link addition only
- required docs/reports listed above

Out of scope:
- engine modifications (unless absolutely required; target is zero engine changes)
- touching unrelated tools
- touching sample content except tiny non-destructive launch references (not required here)
- deleting or restructuring existing repo content

## Validation gates
- Tool opens directly in browser from `tools/Sprite Editor V3/index.html`
- Pixel draw and erase work via mouse
- Multiple frames can be authored and navigated
- JSON save/load round-trip works
- PNG import and PNG export work
- Sprite sheet export works
- Link appears in `tools/index.html`
- Existing repo content remains untouched outside declared scope

## Packaging
Create:
- `<project>/tmp/BUILD_PR_SPRITE_EDITOR_FROM_SCRATCH_delta.zip`

ZIP must include only files relevant to this PR.
