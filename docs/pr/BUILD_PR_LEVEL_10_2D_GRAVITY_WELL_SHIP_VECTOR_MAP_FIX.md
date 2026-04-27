# BUILD_PR_LEVEL_10_2D_GRAVITY_WELL_SHIP_VECTOR_MAP_FIX

## User Finding
Gravity Well is missing the ship vector map.

## Required Fix
Gravity Well must include actual ship vector data in:

```json
tools["vector-asset-studio"].vectors
```

## Rules
- Do not create separate vector JSON files.
- Do not add path/reference-to-JSON.
- Use actual vector data in the manifest.
- The vector asset must be visible/available to Vector Asset Studio.
- Workspace Manager should not show `Asset: none` for Vector Asset Studio when the game has vector assets.

## Expected Shape

```json
"tools": {
  "vector-asset-studio": {
    "schema": "html-js-gaming.tool.vector-asset-studio",
    "version": 1,
    "name": "Vector Asset Studio",
    "source": "manifest",
    "vectors": {
      "vector.gravitywell.ship": {
        "id": "vector.gravitywell.ship",
        "type": "vector",
        "geometry": {
          "viewBox": "...",
          "paths": []
        },
        "style": {
          "stroke": true,
          "fill": false
        }
      }
    }
  }
}
```

## Source Discovery
Codex should look for existing Gravity Well ship/vector data in:
- `games/GravityWell/**`
- game code constants
- old manifests/catalogs
- vector asset definitions
- drawing code/canvas paths
- tests or fixtures for Gravity Well

If exact source is not found:
- create a minimal vector ship derived from the game's current visual behavior if clear
- document source/assumption in report

## Test Update
Update manifest payload expectation tests so Gravity Well requires:
- `tools["vector-asset-studio"]`
- at least one vector
- a ship vector id or label matching ship/player

Suggested checks:
- id contains `ship` or `player`
- vector has `geometry.paths`
- vector has `style`

## Required Report
Create:

```text
docs/dev/reports/level_10_2d_gravity_well_ship_vector_map_fix_report.md
```

Report:
- source of ship vector data
- manifest section updated
- vector id added
- test updated
- Workspace Manager asset presence result

## Acceptance
- Gravity Well manifest contains ship vector map data.
- No separate JSON created.
- Vector Asset Studio has an asset for Gravity Well.
- Payload expectation test catches missing ship vector map.
- No validators added.
- No start_of_day changes.
