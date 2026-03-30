# LEVEL_EDITOR_LOAD_UX_RULES

## Shared UX Requirement
Both editors must expose the same top-level actions:

- New Project
- Load Project
- Load Sample
- Save Project
- Simulate
- Exit Simulation

## Behavior Rules
- Load Project opens user-selected project data for that editor
- Load Sample opens editor-local sample data
- Sample loading must not depend on external sample folders
- If a project is already open, the editor must either preserve unsaved state safely or confirm replacement
- Menu naming must match across both editors

## Path Rules
- Tile Map Editor samples remain local to the Tile Map Editor tool
- Parallax Editor samples remain in tools/Parallax Editor/samples/
