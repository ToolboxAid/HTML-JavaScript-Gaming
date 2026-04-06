Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_9_3_ENGINE_SAMPLE_TEMPLATES.md

# Level 9.3 Engine Sample Templates

## Template Goal
Provide reusable docs templates for new sample/game implementations that compose:
- Spawn System
- Lifecycle System
- World State System
- Events System

## Minimal Game Template (Structure)
```text
samples/sampleXXX-your-game/
  index.html
  main.js
  index.js
  YourGameScene.js
  config/
    waves.js
    events.js
    lifecycle.js
```

## Scene Template (High-Level)
1. Constructor
- load config tables
- construct systems
- initialize local game state

2. Update loop order
- `events.update(context, applyAction)`
- `spawn.update(dt, factory)`
- `entities = lifecycle.update(entities, dt)`
- game-local resolution (collision/scoring/rules)
- `transitions = worldState.update(stateInputs)`

3. Render
- draw scene state only
- no system-side rendering

## Config Templates

### waves config
```js
export const WAVES = [
  { spawn: { id: 'wave0', interval: 0.5, limit: 10 }, config: { difficulty: 1 } },
  { spawn: { id: 'wave1', interval: 0.4, limit: 14 }, config: { difficulty: 2 } }
];
```

### events config
```js
export const EVENTS = [
  { id: 'tempo-rise', phase: 'active', time: 8, repeat: false, action: { type: 'speedMult', value: 1.1 } },
  { id: 'bonus-window', waveIndex: 1, time: 12, repeat: false, action: { type: 'spawnBonus' } }
];
```

### lifecycle config
```js
export const LIFECYCLE = {
  maxEntities: 120,
  maxLifetime: 3.0,
  bounds: { minX: 0, maxX: 960, minY: 0, maxY: 540 }
};
```

## Do/Don't
Do:
- keep game-specific mechanics in scene layer
- keep systems generic and deterministic
- keep configuration tables externalized

Don't:
- duplicate world-system logic per game
- inject rendering/input into systems
- depend on system private counters
