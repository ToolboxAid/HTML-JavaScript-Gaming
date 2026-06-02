# Runtime Object Capability Boundary

PR: PR_26152_180-runtime-object-capability-boundary
Date: 2026-06-02

## Scope

- Defines the object/capability runtime boundary.
- Establishes object, actor, and entity ownership for capability behavior.
- Keeps slide, drag, friction, and other terrain material behavior out of object capability ownership.
- Adds no runtime implementation.

## Object Capability Ownership

Objects, actors, and entities own capability identity:

- static
- dynamic
- killable
- collectible
- trigger
- projectile
- contact damage

Character, enemy, projectile, pickup, and object creation should think in capabilities rather than terrain materials.

## Explicit Boundary

Object capability does not own:

- passable surface behavior
- blocked surface behavior
- slide
- drag
- friction
- surface damage as a material property
- surface healing as a material property
- wind, weather, current, gravity fields, or other environment forces

An object can be dynamic and can be affected by mud drag or ice slide, but the object does not own those terrain material rules.

## Expected Config Shape

Future manifest-driven runtime work should keep object capability definitions focused on actor behavior:

```json
{
  "objects": {
    "bumblebee": {
      "objectType": "dynamic",
      "capabilities": ["killable", "contactDamage"],
      "geometryRef": "geometry.bumblebee",
      "rules": ["movement.bumblebee"]
    },
    "coin": {
      "objectType": "collectible",
      "capabilities": ["collectible"],
      "geometryRef": "geometry.coin",
      "rules": ["scoring.coin"]
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

- engine - static boundary documentation for runtime object capability ownership.
- runtime - conceptual object/capability boundary only.

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

Confirm the report keeps object/capability behavior separate from terrain/material and environment/force concepts.

## Blocker Scope

No blocker for the object/capability boundary baseline.
