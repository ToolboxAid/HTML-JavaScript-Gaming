# PR_26155_032 Toolbox Worlds Objects Submenus

## Summary

- Added visible child capability lists under the existing Worlds and Objects Toolbox tiles.
- Kept child capabilities beneath their parent tools only.
- Did not add Vector, Tilemap, Isometric, Hex, Sprite, Character, Enemy, or Interactive as top-level Toolbox groups.
- Preserved Create, Build, Content, Media, Test, Share, and Account grouping.

## Child Capabilities

- Worlds:
  - Vector
  - Tilemap
  - Isometric
  - Hex
- Objects:
  - Vector
  - Sprite
  - Character
  - Enemy
  - Interactive

## Implementation Notes

- `toolbox/tools-page-accordions.js` now renders child capabilities as a nested `ul` under the parent tile.
- Child capabilities remain wireframe/planned labels only.
- No DB, auth, persistence, or Project Workspace rebuild behavior was added.
- Learn remains top-level navigation only.
- Admin remains one top-level navigation area only.
- Arcade remains absent from Toolbox.

## Validation Notes

- `node scripts/validate-active-tools-surface.mjs`: PASS.
- `node scripts/validate-tool-registry.mjs`: PASS.
- `npm run test:workspace-v2`: PASS, 3 Playwright tests.
- `git diff --check`: PASS.

## Manual Test Notes

- Verified Worlds shows Vector, Tilemap, Isometric, and Hex beneath Worlds.
- Verified Objects shows Vector, Sprite, Character, Enemy, and Interactive beneath Objects.
- Verified child capability labels are not top-level Toolbox groups.
- Verified no console errors in the targeted Playwright run.
