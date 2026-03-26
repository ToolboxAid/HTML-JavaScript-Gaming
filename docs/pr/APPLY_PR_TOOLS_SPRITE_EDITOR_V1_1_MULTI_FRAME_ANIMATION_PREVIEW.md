Toolbox Aid
David Quesenberry
03/26/2026
APPLY_PR_TOOLS_SPRITE_EDITOR_V1_1_MULTI_FRAME_ANIMATION_PREVIEW.md

# APPLY_PR — Sprite Editor v1.1 (Rebuild Only)

## Intent
This APPLY_PR validates the rebuilt Sprite Editor v1.1 as a completely new tool.

This is **not** a refactor, migration, or UI alignment pass.
This is **not** carrying old implementation structure forward.
Legacy preservation exists separately only as a repo access point for the old tool.

The active tool under validation is the rebuilt tool only:
- tools/SpriteEditor/index.html
- tools/SpriteEditor/main.js
- tools/SpriteEditor/spriteEditor.css

## Scope
Validate only:
- rebuilt multi-frame editor behavior
- animation preview behavior
- import/export behavior
- tool wiring
- tools hub linkage

Do not expand scope into:
- engine/ui alignment
- engine refactors
- sample changes
- old tool code movement
- broader styling normalization

## File Targets
- tools/SpriteEditor/index.html
- tools/SpriteEditor/main.js
- tools/SpriteEditor/spriteEditor.css
- tools/index.html

## Validation Checklist
[ ] New SpriteEditor loads from tools/index.html
[ ] index.html references ./main.js correctly
[ ] index.html references ./spriteEditor.css correctly
[ ] editor grid renders
[ ] add frame works
[ ] duplicate frame works
[ ] delete frame blocks deleting the last frame
[ ] previous frame works
[ ] next frame works
[ ] preview canvas renders
[ ] play works
[ ] pause works
[ ] FPS control changes playback speed
[ ] loop toggle works
[ ] export JSON contains frames array
[ ] old single-frame JSON imports correctly
[ ] new multi-frame JSON imports correctly
[ ] save local works
[ ] load local works
[ ] no console errors
[ ] no changes outside tools/docs for this PR

## Pass Criteria
PASS only if every checklist item above is true.

## Fail Conditions
FAIL if any of the following occur:
- broken JS or CSS reference
- frame operations fail
- preview playback fails
- import/export fails
- console errors appear
- unrelated repo areas were changed

## Commit Comment
Apply rebuilt Sprite Editor v1.1 with multi-frame editing and animation preview
