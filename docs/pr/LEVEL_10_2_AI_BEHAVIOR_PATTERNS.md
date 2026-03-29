Toolbox Aid
David Quesenberry
03/29/2026
LEVEL_10_2_AI_BEHAVIOR_PATTERNS.md

# Level 10.2 AI Behavior Patterns

## Pattern Inventory

### Patrol / Roam
Use when:
- enemy should occupy space predictably
- low-pressure idle or scouting behavior is needed

Public composition:
- World State phase gates
- Events for timed patrol windows
- Lifecycle for movement ownership

Keep local:
- route geometry
- waypoint definitions

### Chase / Evade
Use when:
- enemy must react to player or objective pressure

Public composition:
- state signals from scene
- Events for mode flips
- Lifecycle adapters for movement bias

Keep local:
- target priority rules
- threat scoring

### Phase-Based Behavior Switching
Use when:
- enemies must behave differently by round, wave, or boss stage

Public composition:
- World State `phase`
- World State `getWave()`
- optional Events windows

Keep local:
- stage flavor
- attack cadence values

### Timer-Driven Behavior Windows
Use when:
- aggression, retreat, or regroup behavior should occur on fixed timing windows

Public composition:
- explicit timer context
- Events for synchronized windows

Keep local:
- duration tuning
- fallback behavior meaning

### Event-Reactive Behavior Changes
Use when:
- AI should react to bonus windows, frightened states, alarms, or intensity spikes

Public composition:
- scene-owned event outcomes
- Events-config-driven behavior toggles

Keep local:
- effect of each event on actual game rules

## Forbidden Patterns
- embedding scoring rules into reusable behavior logic
- embedding renderer-facing animation or VFX logic into behavior system
- duplicating World State or Events evaluation inside AI layer
- turning AI layer into a second lifecycle or spawn controller
