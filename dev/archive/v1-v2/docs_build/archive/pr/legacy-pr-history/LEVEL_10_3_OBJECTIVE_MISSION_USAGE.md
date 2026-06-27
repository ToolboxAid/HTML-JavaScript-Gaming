Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_10_3_OBJECTIVE_MISSION_USAGE.md

# Level 10.3 Objective and Mission Usage

## Wiring Pattern
1. Scene constructs Spawn, Lifecycle, World State, Events, AI Behavior, and Objective/Mission System.
2. Scene gathers explicit mission context each frame:
- phase
- waveIndex
- elapsed
- event outcomes
- AI summaries if needed
- local counters and facts (kills, collections, zones, escort state)
3. Objective/Mission System evaluates progress.
4. Scene applies reward/unlock/state directives through local adapters.
5. UI reads exposed mission state from the scene layer, not from system-side rendering.

## Example Composition Flow
```js
const mission = objectiveSystem.update({
  phase,
  waveIndex,
  elapsed,
  eventFlags,
  aiFlags,
  missionFacts
});

applyMissionDirectives(mission.rewardDirectives);
renderMissionUi(mission);
```

## Allowed Usage
- evaluating objective progress from explicit facts
- chaining missions based on completed objective state
- surfacing completion/failure to scene-local UI and rewards

## Forbidden Usage
- embedding UI rendering into the objective system
- reading private counters from Spawn, World State, Events, or AI layers
- duplicating world progression or event dispatch logic inside the mission layer
- hardwiring genre-specific reward semantics into reusable contracts

## Reward and Unlock Boundaries
Allowed in objective system:
- emit reward or unlock directives

Must remain local:
- score changes
- inventory changes
- cosmetic unlock presentation
- campaign flavor and narrative messaging

## Migration Notes for Current Games
- Asteroids:
  - supports optional survive, clear-wave, and timed-bonus objective chains
  - score and combat meaning remain local
- Space Invaders:
  - supports clear-formation, protect-line, and bonus-UFO objectives
  - formation rules and shooting behavior remain local
- Pacman Lite:
  - supports collect-count, survive-window, frightened-phase, and escort/protect variants
  - maze rules, chase rules, and UI remain local

## Risk List
- overfitting reusable mission APIs to one genre
- leaking UI concerns into mission contracts
- duplicating World State progression inside mission sequencing
