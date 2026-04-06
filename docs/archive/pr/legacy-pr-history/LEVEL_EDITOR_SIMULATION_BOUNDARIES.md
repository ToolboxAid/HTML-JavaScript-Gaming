# LEVEL_EDITOR_SIMULATION_BOUNDARIES

## Tile Map Editor
- owns map authoring
- simulation is a preview of authored tile/data/object layout
- simulation does not become runtime game logic

## Parallax Editor
- owns visual depth authoring
- simulation is a preview of camera-relative parallax behavior
- simulation does not own hero or gameplay logic

## Shared Boundary
- hero remains conceptually in the entity layer
- parallax foreground stays visual-only even when previewed in front of hero space
- no engine core API refactor is allowed in this polish PR
