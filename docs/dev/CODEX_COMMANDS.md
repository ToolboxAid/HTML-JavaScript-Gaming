MODEL: GPT-5.4
REASONING: high

GOAL:
Simplify asset structure by removing redundant container layers.

RULES:
- eliminate data/ if it is just a wrapper
- eliminate platform/ as default container
- keep only type-first folders under assets/
- allow nested grouping only when needed

TARGET STRUCTURE:
assets/
  palettes/
  sprites/
  tilemaps/

OPTIONAL:
assets/sprites/platform/
assets/tilemaps/platform/

CONSTRAINTS:
- preserve files
- update references
- do not touch runtime code
- one PR scope only

OUTPUT:
ZIP to <project folder>/tmp/
