Toolbox Aid
David Quesenberry
03/30/2026
README.md

# Tile Map Editor Foundation

This tool provides the Tile Map Editor foundation for map authoring in the repo.

## Included in this foundation
- Tile painting, erase, and value picker
- Tile, collision, and data layers
- Layer add/remove/visibility controls
- Tileset palette selection
- Object and spawn marker placement
- JSON map load/save
- Top-level project actions: New Project, Load Project, Load Sample, Save Project, Simulate, Exit Simulation
- Simulation mode for tile/data/object preview
- Runtime export JSON

## Parallax boundary
- Parallax editing is intentionally out of scope for this PR.
- Saved documents include a reserved `parallax` block for a later companion Parallax Editor.

## Entry point
- `tools/Tile Map Editor/index.html`

## Samples
- Manifest: `tools/Tile Map Editor/samples/sample-manifest.json`
- Sample files are local to the Tile Map Editor tool.
