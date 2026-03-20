# Engine V2 Entity Layer

## Purpose

The V2 entity layer introduces structured game state without jumping to a full ECS design.

This slice keeps responsibilities narrow:

- `Transform` owns position and previous position snapshots
- `Velocity` owns linear velocity values
- `Bounds` owns entity size and clamp helpers
- `Entity` groups those concerns and performs simple integration

## Why this exists

Earlier samples kept movement data directly on the scene. That worked for proving the loop, input, and mapping layers, but it does not scale well as more actors are introduced.

The entity layer provides a consistent shape for game state while preserving the existing V2 boundaries:

- scenes still orchestrate sample behavior
- input still stays inside `InputService`
- rendering still happens inside the sample scene
- entity state is reusable and isolated from the sample container

## Initial API

```js
const entity = new Entity({
    transform: new Transform({ x: 480, y: 320 }),
    velocity: new Velocity({ x: 0, y: 0 }),
    bounds: new Bounds({ width: 40, height: 40 }),
});

entity.snapshot();
entity.velocity.set(240, 0);
entity.integrate(dtSeconds);
entity.bounds.clampCenter(entity.transform.position, playArea);
```

## Non-goals

This PR does **not** introduce:

- ECS systems
- entity registries
- message passing
- collision response
- rendering abstraction

Those can be layered on later once the basic state shape is proven.

## Sample

`sample07-entity-movement` demonstrates:

- action-based movement through the input mapping layer
- a scene owning a single entity instance
- transform snapshots for interpolated rendering
- velocity-driven motion
- bounds clamping inside a visible play area
