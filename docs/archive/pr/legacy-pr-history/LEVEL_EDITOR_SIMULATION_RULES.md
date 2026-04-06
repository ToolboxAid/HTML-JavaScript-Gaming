# LEVEL_EDITOR_SIMULATION_RULES

## Requirement
Both editors need the ability to simulate the current project state.

## Tile Map Editor Simulation
Simulation should allow the user to preview:
- map layout
- collision/data layer effect
- object/spawn marker placement
- camera/view framing as applicable

## Parallax Editor Simulation
Simulation should allow the user to preview:
- background depth stack
- scroll factor behavior
- repeat/wrap behavior
- foreground layers in front of the hero play space
- motion response relative to camera movement

## UX Contract
- Simulate enters a temporary preview mode
- Exit Simulation returns to editing mode without destructive edits
- Simulation must not silently rewrite project data
- Simulation should use the current in-editor state, not require a separate export first
