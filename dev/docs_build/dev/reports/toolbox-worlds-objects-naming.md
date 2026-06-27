# Toolbox Worlds Objects Naming

Stack item: `PR_26155_026-toolbox-worlds-objects-naming`

## Summary

- Verified creator-facing labels remain:
  - Objects
  - Worlds
  - Controls
  - Hitboxes
  - Saved Data
- Preserved `Worlds` as the parent tool label.
- Preserved `Objects` as the parent tool label.
- Kept technical child capability terms beneath the relevant parent cards instead of top-level Toolbox groups.

## Planned Child Capabilities

- Worlds card now lists planned world types:
  - Vector
  - Tilemap
  - Isometric
  - Hex
- Objects card now lists planned object types:
  - Character
  - Enemy
  - Decoration
  - Interactive
  - Vector Object
  - Sprite Object

## Validation Notes

- Targeted validation confirms old labels are not active top-level tool labels:
  - Object Vector
  - World Vector
  - Input Mapping
  - Collision Inspector
  - Storage Inspector
  - Save Data
- Targeted Playwright checks confirm Objects and Worlds render as parent cards and planned child capability text remains beneath them.
- No DB, auth, persistence, or real tool implementation was added.

## Manual Test Notes

- `/toolbox/index.html` shows Objects and Worlds as creator-facing parent cards.
- Vector, Tilemap, Isometric, and Hex appear only as planned world-type child capability text beneath Worlds.
- Character, Enemy, Decoration, Interactive, Vector Object, and Sprite Object appear only as planned object-type child capability text beneath Objects.
