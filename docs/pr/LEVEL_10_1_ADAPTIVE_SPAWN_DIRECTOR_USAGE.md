Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_10_1_ADAPTIVE_SPAWN_DIRECTOR_USAGE.md

# Level 10.1 Adaptive Spawn Director Usage

## Wiring Pattern
1. Scene builds Spawn, World State, Events, and Adaptive Spawn Director.
2. Scene prepares safe context each frame:
- `phase`
- `waveIndex`
- `elapsed`
- `remainingCount`
- optional local pressure metrics
3. Director computes directives from that context.
4. Scene applies directives to active spawn configuration using public adaptation paths.
5. Spawn System continues to own actual creation cadence execution.

## Example Composition Flow
```js
const directives = director.update({
  phase,
  waveIndex,
  elapsed,
  remainingCount,
  pressureScore
});

applySpawnTuning(directives);
const created = spawnSystem.update(dt, factory);
```

## Allowed Patterns
- multiply current spawn interval through scene-owned adapter logic
- clamp active spawn limits using local config wrappers
- switch pacing tiers by phase/wave through local config maps

## Forbidden Patterns
- writing to Spawn private counters such as internal elapsed/count state
- bypassing World State public methods for transition knowledge
- embedding scoring, collision, or renderer behavior in the director
- making the director responsible for actual entity creation

## Migration Notes for Current Games
- Asteroids:
  - director can react to asteroid pressure and wave progress
  - ship targeting and score rules stay local
- Space Invaders:
  - director can tune formation cadence and late-wave pressure
  - formation motion and shot policy stay local
- Pacman Lite:
  - director can tune pellet/bonus pacing windows or ghost pressure stages
  - maze and chase rules stay local

## Risk List
- over-centralizing game-specific pacing into the advanced layer
- accidental dependency on private spawn internals
- hiding important context that should remain explicit in scenes
