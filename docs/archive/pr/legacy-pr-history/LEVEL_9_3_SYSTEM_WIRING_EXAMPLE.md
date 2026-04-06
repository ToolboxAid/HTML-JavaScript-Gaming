Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_9_3_SYSTEM_WIRING_EXAMPLE.md

# Level 9.3 System Wiring Example

## Reference Wiring (Pseudo-Code)
```js
import { SpawnSystem, LifecycleSystem, WorldStateSystem, EventsSystem } from 'engine-world-systems';
import { WAVES, EVENTS, LIFECYCLE } from './config/index.js';

class GameScene {
  constructor() {
    this.entities = [];
    this.spawnDone = false;
    this.worldState = new WorldStateSystem(WAVES);
    this.spawn = new SpawnSystem([this.worldState.getWave().spawn]);
    this.lifecycle = new LifecycleSystem(LIFECYCLE);
    this.events = new EventsSystem(EVENTS);
  }

  update(dt) {
    this.events.update(this.getEventContext(), (action) => this.applyAction(action));

    if (this.worldState.phase === 'spawning') {
      const created = this.spawn.update(dt, (rule, count) => this.createEntity(rule, count));
      this.entities.push(...created);
      this.spawnDone = this.isSpawnDone();
    }

    this.entities = this.lifecycle.update(this.entities, dt);
    this.resolveGameRules();

    const transitions = this.worldState.update({
      spawnDone: this.spawnDone,
      remainingCount: this.getRemainingCount()
    });

    if (transitions.includes('spawning')) this.reconfigureForNextWave();
  }
}
```

## Adaptation Points (Allowed)
- `createEntity` policy
- `applyAction` mapping
- scoring/life/collision rules
- wave/event values

## Adaptation Points (Forbidden)
- changing system contract signatures per game
- embedding renderer/input logic in systems
- exposing system private internals as API
