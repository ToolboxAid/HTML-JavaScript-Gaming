# LEVEL_EDITOR_FULL_MAP_SIMULATION_BOUNDARIES

## Tile Map Editor
- owns map authoring
- simulation validates authored map layout
- simulation does not become the full game runtime
- hero behavior may be represented by a proxy marker or simple motion track only if needed for context

## Parallax Editor
- owns visual depth authoring
- simulation validates how parallax behaves over full-map traversal
- simulation does not own gameplay or collision systems
- foreground remains visual-only even when shown in front of the hero-space proxy

## Shared Rules
- no engine core API changes in this PR
- editors remain separate tools
- simulation should be stronger, not broader
- the purpose is authoring validation, not full gameplay embedding
