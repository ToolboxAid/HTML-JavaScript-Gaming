Toolbox Aid
David Quesenberry
03/26/2026
BUILD_PR_TOOLS_SPRITE_EDITOR_V2_3_PRECISION_UX_POLISH.md

# BUILD_PR — Sprite Editor v2.3 (Precision + UX polish)

## Implementation Notes (Codex Target)

Apply as a correction pass to existing v2.2.

### Verified fixes
- Logical space locked at 1600x900
- Control surface remains central (no layout drift)
- Pointer mapping unified through viewport transform
- Pixel-perfect toggle controls canvas rendering mode:
  - ON → image-rendering: pixelated
  - OFF → image-rendering: auto
- Zoom/pan:
  - stepped zoom preserved
  - reset clears zoom + pan
  - pan clamped to grid bounds (+margin buffer)
- Selection:
  - remains in logical grid coordinates
  - follows zoom/pan transform exactly
- Frame drag UX:
  - visible drag target feedback
  - status text shows reorder intent
  - feedback clears correctly after drop

## Scope
- tools/*
- docs/*

NO architecture rewrite
NO feature additions
