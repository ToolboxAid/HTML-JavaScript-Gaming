Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_10_2_ADVANCED_AI_USAGE.md

# Level 10.2 Advanced AI Usage

## Wiring Pattern
1. Scene constructs Spawn, Lifecycle, World State, Events, and Advanced AI Behavior System.
2. Scene gathers explicit context each frame:
- phase
- waveIndex
- elapsed
- event outcomes
- local enemy or pressure signals
3. AI system computes behavior directives.
4. Scene applies directives through local game adapters.
5. Lifecycle continues to own actual position/expiry updates.

## Example Composition Flow
```js
const behavior = aiBehavior.update({
  phase,
  waveIndex,
  elapsed,
  eventFlags,
  enemyContext,
  pressureScore
});

applyBehaviorDirectives(enemyGroup, behavior);
entities = lifecycle.update(entities, dt);
```

## Allowed Usage
- switching local enemy modes by phase
- adjusting local movement bias via behavior directives
- reacting to safe event flags already exposed by scene orchestration

## Forbidden Usage
- mutating core system internals
- reading private counters from Spawn, World State, or Events
- moving rendering or input concerns into AI logic
- embedding game-specific names into reusable contract surface

## Migration Notes for Current Games
- Asteroids:
  - supports optional advanced asteroid or UFO behavior windows
  - targeting and scoring remain local
- Space Invaders:
  - supports formation mood shifts, aggression ramps, and regroup windows
  - formation geometry and shot rules remain local
- Pacman Lite:
  - supports chase, evade, frightened, and patrol-like mode transitions
  - maze and collection rules remain local

## Risk List
- overfitting reusable AI contracts to one genre
- leaking game-specific target selection into engine-facing API
- duplicating Events or World State semantics instead of composing with them
