Toolbox Aid
David Quesenberry
03/26/2026
PLAN_PR_TOOLS_SPRITE_EDITOR_V2_3_PRECISION_UX_POLISH.md

# PLAN_PR — Sprite Editor v2.3 (Precision + UX polish)

## Intent
Apply a precision fix pass on top of v2.2 without rewriting architecture.

## Constraints
- Keep 1600x900 logical coordinate system fixed
- Keep SpriteEditorCanvasControlSurface as control hub
- No DOM UI additions
- No feature expansion

## Focus Areas
- Pointer mapping consistency
- Pixel-perfect rendering correctness
- Zoom + pan stability
- Selection alignment under transform
- Frame drag UX clarity
