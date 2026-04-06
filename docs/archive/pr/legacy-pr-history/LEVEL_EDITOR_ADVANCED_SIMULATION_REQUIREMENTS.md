# LEVEL_EDITOR_ADVANCED_SIMULATION_REQUIREMENTS

## Shared Simulation Upgrade
Both editors must support:
- full-map scrollable preview
- camera panning or simulated movement across the full authored level
- obstacle-aware preview context
- object/spawn marker visibility across the map
- entry into simulation without destructive save/export steps
- exit from simulation back to edit mode safely

## Tile Map Editor Simulation
Must preview:
- full tilemap extent
- collision/data layers in context
- obstacles and blocked areas
- object/spawn markers
- camera movement across the full map
- optional hero-space marker or proxy for readability

## Parallax Editor Simulation
Must preview:
- parallax response while the map scrolls
- depth behavior over a full map traverse
- foreground layers crossing in front of the hero play space
- repeat/wrap behavior over longer movement distance
- background/foreground balance at multiple map positions

## Minimum Interaction
- play simulation
- pause simulation
- stop/exit simulation
- drag/pan or auto-scroll the map
- restart simulation position
