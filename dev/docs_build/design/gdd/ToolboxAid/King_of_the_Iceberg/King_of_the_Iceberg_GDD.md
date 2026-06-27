Perfect—that’s exactly what we needed. I rebuilt your GDD **starting from your original document**  and **only layered in the new decisions**, without changing your structure or tone.

---

# 🧊 King of the Iceberg — GDD (UPDATED FROM YOUR BASE)

---

## 1. Game Overview

King of the Iceberg is a chaotic multiplayer arena game where 2–8 pingwins compete to control a floating, unstable iceberg.

Players:

* Push / knock others off
* Fight for control of the top
* Use abilities + power-ups
* Manipulate physics via movement, jumping, and landing impacts

---

## 2. Core Game Loop

Win by staying on TOP for X.X total seconds

* Timer increases only on top
* Timer pauses when off
* Multiple players can accumulate time
* First to reach target wins

---

## 3. Core Pillars

* Unstable Terrain (tilt, bob, rotate)
* Slippery Physics (momentum + slope)
* Push Combat (knock, bounce, displace)
* Emergent Chaos (team physics interactions)
* Vertical Platform Progression

---

## 4. Player System (Pingwins)

### 4.1 Character Select

* Each hero is unique
* Once selected → locked (no duplicates)

---

### 4.2 Named Heroes & Abilities

* Splash — Pucker Blaster (water push stream)
* Frostbite — Freeze Blast (freeze zone)
* Glacier — Mega Weight (high tilt influence)
* Dash — Slipstream Dash (burst movement)
* Sniper — Crystal Shot (precision projectile)
* Bombard — Belly Bomb (explosive impact)
* Cyclone — Spin Attack (radial push)
* Anchor — Grip Mode (high traction)

---

### 4.3 Movement

* Slippery, momentum-based
* Influenced by slope
* Drift + overshoot behavior

---

### 4.4 Spawn Rule

If no input:

* On iceberg → slide based on tilt
* In water → bob with current

---

### 4.5 Wrap System

* Triggers only when airborne or in water
* Does NOT trigger while grounded on iceberg
* Wraps to opposite side
* Preserves velocity and direction

---

### 4.6 Collision

* Players cannot overlap
* Bounce based on impact direction
* Momentum transfer

---

### 4.7 Jump & Impact System

Landing creates tilt force on iceberg

#### Stomp Landing

Press DOWN during landing:

* Increased tilt force

#### Group Impact

* Multiple players amplify tilt
* Can slide others off top

---

### 4.8 Combat

Push / knock players off iceberg

* Collision force
* Ability-enhanced knockback
* Landing impacts contribute

---

### 4.9 Knockdown

* Strong impacts cause slip state
* Temporary loss of control

---

### 4.10 Health & Death

Damage Sources:

* Knockback impact (velocity-based)
* Falling between platforms
* Ability damage
* Falling ice debris

Rules:

* Sliding does NOT cause damage
* Minimum drop = one platform level

Death:

* HP reaches zero OR out-of-bounds
* Explosion effect (ice + particles)

---

### 4.11 Respawn / Recovery

* Falling → enters water state
* Water → limited movement + recovery attempt
* Out-of-bounds → respawn delay

---

## 5. Iceberg System

### 5.1 Structure (UPDATED)

* Built from vertical **platform layers**
* Platforms are fragmented (gaps between surfaces)
* Players must navigate upward from water

---

### 5.2 Platform Modes (NEW)

**Pass-Through (Default)**

* Jump through from below
* Land from above

**Solid Mode**

* Platforms are fully solid
* Movement requires using gaps

---

### 5.3 Motion

* Bobbing
* Tilting
* Optional slight rotation

---

### 5.4 Tilt Forces

* Player weight
* Player position
* Landing impacts

---

### 5.5 Balance Rule

* Edge = stronger push
* Top = more stable

---

### 5.6 Dynamic Top

* Highest playable point defines control

---

## 6. Control Zone

* Any player on the top accumulates time
* Time tracked with decimal precision (X.X seconds)

---

## 7. Iceberg Break Event (UPDATED)

* Trigger at ~65% progress

Effects:

* Upper section slices open
* Additional surface area exposed
* Platforms fracture and reshape

### Falling Ice (NEW)

* Broken tiles become dynamic objects
* Deal damage on impact
* Fall downward across platforms
* Include horizontal drift
* Can bounce before exiting

---

## 8. Ability System

### Mechanics

* Wind-up required
* Directional targeting

---

### Ability Types (EXPANDED)

* Force-based (push, spin)
* Movement-based (dash)
* Physics-based (gravity, weight)
* Environmental (freeze)

---

### Cooldowns

* 5–12 seconds
* Fixed per hero

---

## 9. Power-Up System

### Spawn

* Random
* High-risk positions
* Moves with tilt

---

### Power-Ups

* Grip Boots → traction
* Freeze Orb → freeze
* Wave Slam → shockwave
* Mega Core → weight boost
* Ice Sniper → ranged boost
* Spin Core → spin boost
* Dash Surge → speed + cooldown reduction
* Wind Gust → push field

---

## 10. Falling & Recovery (UPDATED)

### Water System

* Recovery zone
* Slow “chill damage” over time
* Requires player to climb back

---

### Platform Progression

* Players re-enter at lowest platform
* Must work upward

---

## 11. Multiplayer

* 2–8 players
* Local + network + hybrid

---

## 12. Match Flow

1. Attract Mode
2. Character Select
3. Spawn
4. Control Battle
5. Iceberg Break
6. Chaos Phase
7. Win

---

## 13. Attract Mode

* Gameplay demo
* Hero showcase
* Power-up showcase
* Instructions
* High score screen

---

## 14. End Game Stats

* Winner
* Time on Top
* Match Time
* Hits
* Falls

---

## 15. Camera

* Shared camera
* Dynamic zoom
* Tracks iceberg

---

## 16. Visual System (UPDATED)

### Parallax Layers

* Gameplay layer (iceberg/platforms)
* Midground (floating ice chunks)
* Background (icebergs/mountains)
* Sky

Rules:

* Gameplay layer highest clarity
* Background desaturated

---

## 17. Tile System (NEW)

Tile Types:

* Top (collision)
* Walls (depth)
* Corners (transitions)
* Breakable (dynamic)
* Decor (visual only)

Layers:

* Collision layer
* Structure layer
* Detail layer
* Decor layer

---

## 18. Control Precision (NEW)

* Jump buffer (~100ms)
* Coyote time (~100ms)
* Limited air control
* Responsive input priority

---

## 19. Game Feel (NEW)

* Hit pause (5–10ms)
* Screen shake (scaled)
* Ice crack effects
* Layered audio feedback

---

## 20. Comeback Mechanics (NEW)

* Top player slightly heavier
* Lower players gain slight jump assist

---

## 21. Telemetry (NEW)

Track:

* Match duration
* Damage sources
* Ability usage
* Death causes
* Platform usage

---

## 22. MVP Scope (UPDATED)

* 2 players
* 1 iceberg
* 3–5 platforms
* Movement + jump only
* Pass-through mode
---

## 23. Network Capability

The game supports multiplayer across both local and remote environments.

---

### 23.1 Play Modes

- Local Multiplayer:
  - Same device / shared screen
  - Multiple input devices

- Remote Multiplayer:
  - Play over the internet
  - Supports low-latency real-time gameplay

- Hybrid:
  - Combination of local + remote players

---

### 23.2 Core Requirement

- Players must be able to:
  - Play across the room (local)
  - Play across distance (internet)

Example:
- Parent and child playing from different locations

---

### 23.3 Networking Model

- Authoritative host model

Host:
- Owns game state
- Resolves physics and collisions
- Broadcasts state updates

Clients:
- Send input only
- Render based on host updates

---

### 23.4 Synchronization

- Player position and velocity synchronized
- Iceberg motion synchronized
- Platform states synchronized (including break events)

---

### 23.5 Latency Handling (Initial)

- Client-side prediction for movement
- Server reconciliation from host

Design Goal:
- Smooth movement despite network delay

---

### 23.6 MVP Networking Scope

- 2 players minimum
- Host + 1 remote client
- Basic synchronization (movement + collisions)

Future Expansion:
- 4–8 players
- Improved latency smoothing
---

## 24. Identity Summary

King of the Iceberg =

King of the Hill

* Sliding physics
* Push combat
* Dynamic terrain
* Vertical platform traversal
* Multiplayer chaos

---

# ✅ What You Now Have

This is now:

* your document ✔
* your structure ✔
* your wording ✔
* **with all modern gameplay decisions layered in cleanly**

---

# 🚀 Next

Now we’re aligned.

Next step:
👉 **Tool Stabilization PR (ZIP)**

After that:
👉 we use your tileset to build your first playable map the *right way*

No rework needed 👍
