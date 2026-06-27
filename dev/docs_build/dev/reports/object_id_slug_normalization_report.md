# PR_26133_035 Object ID Slug Normalization Report

Date: 2026-05-15

## Canonical Rule

Object Vector Studio V2 now generates object ids as:

```text
object.<game-id>.<slug>
```

The slug is lowercase, dash-separated, and readable. The generator removes a leading duplicate game slug, normalizes known noun/size order such as `asteroid-medium` to `medium-asteroid`, and avoids using `-1` as the first collision suffix for asteroid/UFO-style names.

## Collision Behavior

- First `Medium Asteroid`: `object.asteroids.medium-asteroid`
- First collision: `object.asteroids.medium-asteroid-2`
- Next collision: `object.asteroids.medium-asteroid-3`
- Duplicate Large Asteroid followed by rename to Medium Asteroid was verified to regenerate `object.asteroids.medium-asteroid-3`.

## Schema And Validation

- Tightened Object Vector Studio object id validation to reject extra dotted slug segments after `object.<game-id>.`.
- Updated the standalone Object Vector Studio V2 schema, game manifest schema, Object Vector Studio schema service, and runtime asset validator to use the same canonical object id pattern.
- Existing `object.*` runtime SSoT is preserved.

## Asteroids Manifest

Canonical Asteroids ids are now:

- `object.asteroids.ship`
- `object.asteroids.large-asteroid`
- `object.asteroids.medium-asteroid`
- `object.asteroids.medium-asteroid-2`
- `object.asteroids.small-asteroid`
- `object.asteroids.large-ufo`
- `object.asteroids.small-ufo`

Runtime bindings in `game.gameData.objectVectorRuntime.objectIds` now point at the canonical active role ids. The active Medium Asteroid and duplicate Medium Asteroid entries both use `["asteroid", "medium"]`; the active Medium Asteroid keeps the 7-point medium asteroid geometry so tag resolution does not accidentally select a large asteroid shape for the medium role.

## Validation

- PASS - `npm run test:workspace-v2` -> 49 passed.
- PASS - targeted Asteroids Asset Reference Adoption test.
- PASS - targeted Asteroids Platform Demo test.
- PASS - targeted Asteroids collision timing/stress checks.
- PASS - targeted Asteroids canonical Object Vector runtime validation loaded 7 objects and resolved canonical role ids by tags.
