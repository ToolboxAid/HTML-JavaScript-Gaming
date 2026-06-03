# Runtime Terrain Material Boundary

PR: PR_26152_179-runtime-terrain-material-boundary
Date: 2026-06-02

## Scope

- Defines the terrain/material runtime boundary.
- Establishes map, terrain, and landscape ownership for surface behavior.
- Keeps killable, static, dynamic, and other object capability concepts out of terrain material ownership.
- Adds no runtime implementation.

## Terrain Material Ownership

Terrain, map, and landscape configuration owns surface behavior:

- passable
- blocked
- slide
- drag
- friction
- surface damage
- surface healing

These are material or tile-surface properties. They describe what the world surface does when something interacts with it.

## Explicit Boundary

Terrain material does not own:

- object type
- actor identity
- static or dynamic capability
- killable capability
- collectible capability
- trigger capability
- projectile capability
- contact damage as an actor capability

Terrain can damage, heal, slow, block, or slide an object because of the surface, but it does not make the object a character, enemy, projectile, or collectible.

## Expected Config Shape

Future manifest-driven runtime work should keep terrain material definitions focused on surface behavior:

```json
{
  "terrainMaterials": {
    "ice": {
      "passable": true,
      "slide": true,
      "friction": 0.05
    },
    "lava": {
      "passable": true,
      "surfaceDamage": 10
    },
    "wall": {
      "blocked": true
    }
  }
}
```

This is a planning boundary only. The example does not implement runtime parsing.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- engine - static boundary documentation for runtime config ownership.
- runtime - conceptual terrain/material boundary only.

## Lanes Skipped

- implementation - no runtime code changed.
- rendering - no rendering behavior added.
- input - no input behavior added.
- physics - no physics behavior added.
- rule execution - no rule execution added.
- samples - permanently out of scope.
- Playwright - not impacted.

## Samples Decision

SKIP. Samples are permanently out of scope.

## Playwright

Playwright impacted: No. This PR is documentation/static boundary work only.

## Manual Validation

Confirm the report keeps terrain/material behavior separate from object capability concepts and does not define runtime implementation.

## Blocker Scope

No blocker for the terrain/material boundary baseline.
