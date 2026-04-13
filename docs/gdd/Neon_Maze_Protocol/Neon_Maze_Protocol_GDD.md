# Neon Maze Protocol — Game Design Document (GDD v5)

## 1. Game Overview

**Neon Maze Protocol** is a sprite-based, maze-chase arcade game inspired by classic maze pursuit design but built as a new game with deterministic movement, mirrored tilemap authoring, multi-level progression, attract mode flow, and support for one to four players.

The game is designed around:
- left-half-only maze authoring
- runtime right-side mirroring
- 1-tile wall thickness
- 2-tile path width
- 2x2 actor footprint
- buffered, non-blocking movement
- bounce-based collision response
- single-player and co-op play

---

## 2. Core Design Goals

### 2.1 Arcade Clarity
- Immediate readability
- Strong visual contrast
- Predictable movement and chase behavior
- Classic attract-mode presentation

### 2.2 Strong Movement Feel
- Buffered input
- First-opportunity turns
- No dead controls
- Bounce reaction on impact
- Acceleration from stopped state

### 2.3 Deterministic Core
- Same input yields same result
- Replay/debug friendly
- Authoritative-state friendly

### 2.4 Tool-Driven Content
- Maze built in Tilemap Studio
- Sprites built in Sprite Editor
- No vector map dependency

---

## 3. Hard Constraints

These are fixed design constraints.

- Maze is authored as **left half only**
- Game generates the **right half at runtime**
- Maze authoring uses **Tilemap Studio**
- Sprite/animation authoring uses **Sprite Editor**
- Vector map tooling is **not used**
- Walls are **1 tile thick**
- Movement corridors are **2 tiles wide**
- Hero and enemies occupy **2x2 tiles**
- Input is **non-blocking**
- Buffered turn occurs at the **first legal opportunity**
- Spawn chamber location is **defined by tilemap**
- If a player spawns and gives no input, they move **right**
- If a player hits a wall, they **bounce backward**
- If two players collide, they **block and bounce off each other**
- A stopped player must go through **acceleration** to move again
- Game supports **1–4 players**
- Supports **single-player** and **co-op**
- Includes attract mode, directions, high score flow, and game over flow
- Maximum authored maze level is **10**

---

## 4. Maze Authoring Model

### 4.1 Left-Half Authoring
The designer builds only the **left half** of the maze in Tilemap Studio.

The runtime mirrors that content across the vertical center axis to create the full maze.

### 4.2 Runtime Mirror Rule
The right half is generated during gameplay, not pre-authored as a second half.

**Benefits**
- Cuts level-authoring workload roughly in half
- Enforces symmetry
- Makes balancing easier
- Keeps level storage smaller
- Supports deterministic map reconstruction

### 4.3 Tilemap Responsibilities
The tilemap defines:
- walls
- paths
- nodes
- power nodes
- portals
- enemy spawn chamber
- player spawn points
- bonus triggers if used

### 4.4 Spawn Chamber Rule
The spawn chamber is **not fixed to center by system rule**.

Its position is defined by the tilemap for each level.

This allows:
- centered chambers
- offset chambers
- unique layouts per level

---

## 5. Playfield Geometry

### 5.1 Wall Thickness
Maze walls are always:

- **1 tile thick**

### 5.2 Corridor Width
Walkable corridors are always:

- **2 tiles wide**

### 5.3 Actor Footprint
The hero and enemies occupy:

- **2x2 tiles**

This means pathing and turn validation must always be based on a 2x2 occupancy check, not a 1x1 point.

### 5.4 Corridor Validity
A valid corridor must allow a full 2x2 body to pass cleanly.

The game must reject or warn on invalid authored layouts where:
- path narrows below 2 tiles
- corners cannot support 2x2 turning
- mirrored side produces illegal occupancy

---

## 6. Rendering and Assets

### 6.1 Rendering Style
Rendering is strictly:
- tilemap-based for maze geometry
- animated sprite-based for hero, enemies, nodes, portals, and effects

### 6.2 Not Allowed
- Vector-map maze rendering
- Vector-authored maze logic
- Procedural vector geometry as the primary maze form

### 6.3 Required Tooling
Use:
- **Tilemap Studio** for maze authoring
- **Sprite Editor** for hero, enemies, tile effects, and animation

### 6.4 Required Sprite Sets

**Hero**
- spawn / intro
- move right
- move left
- move up
- move down
- bounce reaction
- powered state
- death state

**Enemies**
- chase
- frightened
- flashing frightened
- returning/eaten

**Tile Effects**
- power node pulse
- portal animation if used
- bonus item animation if used

---

## 7. Movement System

### 7.1 Movement Philosophy
Movement is:
- continuous
- non-blocking
- buffered
- deterministic
- lane/corridor based

### 7.2 Buffered Input
If a hero is moving left and the player presses down:
- the hero continues moving left
- the downward input is buffered
- the hero turns down at the first legal turn opportunity

This is required behavior.

### 7.3 Turn Rule
The hero turns as soon as:
- the buffered direction is legal
- the full 2x2 footprint fits in the new lane
- the turn point is reached

### 7.4 Stop Rule
The hero does not stop because the player lets go of the controls while moving.

The hero only stops because of:
- wall interaction
- bounce resolution
- spawn/state transitions
- death/game-state transitions

### 7.5 Spawn Rule
When a player spawns and no input is pressed:
- default movement direction is **right**

This should be consistent across all player slots unless a later mode overrides it.

### 7.6 Acceleration Rule
If the player is stopped, movement restart requires acceleration.

This applies after:
- spawn
- wall-hit stop resolution
- player-to-player collision stop resolution if applicable
- any forced stop state

---

## 8. Movement Options

### Option A — Arcade Cruise (Recommended)
- Acceleration only matters when starting from stopped
- Once moving, actor cruises at stable speed
- Tightest arcade feel
- Best for readable deterministic behavior

### Option B — Soft Momentum
- Acceleration/deceleration can continue to influence movement while already moving
- Slightly more modern feel
- Harder to tune cleanly

**Recommendation**
Use **Option A** for MVP.

---

## 9. Wall Collision and Bounce

### 9.1 Wall Hit Result
When a player hits a wall:
- the player bounces backward
- the player does not simply freeze flat against the wall

### 9.2 Bounce Behavior
Bounce should:
- move the actor backward slightly along the reverse vector
- remain readable
- never clip into geometry
- leave the actor ready to re-accelerate if stopped

### 9.3 Post-Bounce
After bounce:
- buffered input can still apply
- actor may stop or near-stop depending on tuning
- restart must use acceleration if fully stopped

---

## 10. Multiplayer and Co-op

### 10.1 Supported Player Counts
Supports:
- 1 player
- 2 players
- 3 players
- 4 players

### 10.2 Game Modes
Supports:
- **single-player**
- **co-op**

### 10.3 Single-Player Rule
Single-player means:
- one active player at a time

### 10.4 Co-op Rule
Co-op means:
- multiple players are active in the maze at the same time

### 10.5 Player Collision Rule
Players are **blocking**.

If players collide:
- they do not pass through each other
- they must physically block
- they bounce off each other

### 10.6 Player-to-Player Bounce
When two players collide:
- collision response should separate them cleanly
- both players should visibly react
- no overlap or clipping is allowed
- collision should preserve readability in co-op play

### 10.7 Co-op Design Options

**Option A — Shared Maze, Shared Lives/Pool**
- Players cooperate in the same maze
- Shared level objective
- Shared or pooled progress logic

**Option B — Shared Maze, Individual Lives/Scores**
- Players cooperate but maintain individual score/life identity
- Better for arcade score competition inside co-op

**Recommendation**
Use **Option B** unless later balancing suggests a pooled-life model.

---

## 11. Enemy System

### 11.1 Enemy Occupancy
Enemies use the same 2x2 footprint rule as players.

### 11.2 AI Archetypes
Primary enemy personalities:
- **Tracker** — follows player directly
- **Predictor** — targets projected future position
- **Ambusher** — attempts cutoff behavior
- **Drifter** — semi-random but still bounded

### 11.3 Enemy Modes
- CHASE
- SCATTER
- FRIGHTENED
- RETURNING

### 11.4 Spawn Chamber Usage
Enemy spawn chamber placement is defined in the tilemap.

---

## 12. Collectibles and Bonus

### 12.1 Standard Nodes
Standard collectible nodes are placed in legal path corridors.

### 12.2 Power Nodes
Power nodes:
- trigger frightened mode
- create score opportunities
- may temporarily alter threat balance

### 12.3 Bonus Support
The game supports a different spawned/timed bonus for X seconds.

### Bonus Options

**Option A — Bonus Spawn Overlay (Recommended)**
A bonus object or bonus state appears in the current maze for X seconds.

**Option B — Bonus Maze / Bonus Phase**
A temporary special bonus phase/maze is entered for X seconds, then exited.

**Recommendation**
Use **Option A** for MVP.

---

## 13. Level Progression

### 13.1 Level Order
Level order follows this pattern:

```text
1, 2, 1, 2, 3, 1, 2, 3, 4, ...
```

This means new mazes are introduced gradually while earlier ones recur.

### 13.2 Maximum Authored Level
Maximum authored maze level is:

- **10**

### 13.3 Post-Level-10 Behavior
After level 10 is reached:
- continue cycling within the 10-level authored pool
- increase difficulty via timing/speed/pressure systems

### 13.4 Difficulty Escalation
Difficulty may scale through:
- enemy speed
- frightened duration
- enemy release timing
- bonus timer reduction
- score timing pressure

---

## 14. Attract Mode and Front-End Flow

### 14.1 Attract Mode Required
The game includes an attract mode loop.

### 14.2 Attract Loop Content
The attract loop should include:
- sample gameplay / demo play
- high score display
- directions screen
- start game / number of players screen

### 14.3 Suggested Attract Loop
1. Title screen
2. Demo gameplay
3. High score screen
4. Directions screen
5. Start / player count screen
6. Repeat until start

### 14.4 Demo Gameplay
Demo gameplay should:
- show authentic movement
- show enemy behavior
- communicate game feel
- end cleanly and loop back

### 14.5 Directions Screen
Directions should explain:
- movement
- node collection goal
- power node effect
- enemy danger / frightened state
- how many players can join
- start flow

---

## 15. Start Game and Player Count

### 15.1 Start Flow
The start flow must support:
- selecting 1–4 players
- entering game from attract mode
- clear transition into live play

### 15.2 Player Slot Setup
Each player should have:
- spawn position/state
- score
- life count
- input state
- visual identifier

---

## 16. Game Over and High Scores

### 16.1 Game Over
When all player runs/lives are exhausted:
- enter game over state

### 16.2 Game Over Flow
Game over flow includes:
- game over presentation
- final score display
- high score qualification check
- initials/name entry if earned
- return to attract mode

### 16.3 High Score List
The game must support a high score table containing:
- rank
- score
- initials or name

---

## 17. Level Data Contract

Example level definition:

```js
{
  id: "level03",
  leftHalfTiles: [...],
  mirrorMode: "vertical",
  wallThickness: 1,
  corridorWidth: 2,
  actorFootprint: { w: 2, h: 2 },
  spawnChamber: {
    definedInTilemap: true
  },
  bonusMode: "overlay",
  bonusDurationSeconds: 10
}
```

---

## 18. Runtime State Model

Example game/session shape:

```js
{
  players: [],
  enemies: [],
  maze: {},
  collectibles: [],
  scoreTable: [],
  levelIndex: 1,
  authoredMazeMax: 10,
  attractMode: {},
  timers: {}
}
```

---

## 19. Required Runtime Systems

- left-half mirror generation
- 2x2 path validation
- tilemap-defined spawn chamber support
- buffered input system
- first-opportunity turn system
- acceleration-from-stop system
- wall bounce-back response
- player-to-player block and bounce response
- enemy AI mode system
- node/power/bonus system
- attract mode state machine
- demo playback or scripted attract run
- high score system
- player count start flow
- multiplayer/co-op session management

---

## 20. Optional Systems

Optional only, not MVP:

### Optional System A — Dynamic Maze
- moving walls
- timed gates
- shifting geometry

### Optional System B — Bonus Maze State
- temporary alternate maze for X seconds

### Optional System C — Soft Momentum Movement
- broader acceleration/deceleration while cruising

### Optional System D — Expanded Co-op Rules
- advanced revive/share systems
- shared power interactions
- combo/co-op scoring

---

## 21. MVP Recommendations

Use these defaults for the first build:

- mirrored left-half maze runtime generation
- tilemap + sprite rendering only
- 1 tile walls
- 2 tile corridors
- 2x2 actors
- Option A movement
- Option A bonus system
- wall bounce enabled
- default spawn direction right
- single-player plus co-op framework
- player blocking + bounce enabled
- attract mode included
- game over + high score list included

---

## 22. Locked Rules Summary

These are the current authoritative design constraints.

- Left-half-only maze authoring
- Right half generated at runtime
- Tilemap defines spawn chamber location
- Walls are 1 tile thick
- Corridors are 2 tiles wide
- Hero and enemies occupy 2x2
- Input is non-blocking
- Turns happen at first legal opportunity
- Spawn with no input moves right
- Wall collision causes bounce backward
- Player collisions block and bounce
- Stopped players re-accelerate
- Supports 1–4 players
- Supports single-player and co-op
- Level order follows: 1,2,1,2,3,1,2,3,4... up to max authored level 10
- Includes attract mode with demo, high score, directions, and player-count start flow
- Includes game over with high score handling
- Bonus supports timed special behavior for X seconds
