# 🧊 King of the Iceberg — Game Design Document (GDD v9 — Merged Draft)

---

## 1. Game Overview

King of the Iceberg is a chaotic multiplayer arena game where 2–8 pingwins compete to control a floating, unstable iceberg.

Players:
- Push / knock others off
- Fight for control of the top
- Use abilities + power-ups
- Manipulate physics via movement, jumping, and landing impacts

---

## 2. Core Game Loop

Win by staying on TOP for X total seconds.

- Timer increases only on top
- Timer pauses when off
- First to reach target wins

---

## 3. Core Pillars

- Unstable Terrain (tilt, bob, rotate)
- Slippery Physics (momentum + slope)
- Push Combat (knock, bounce, displace)
- Emergent Chaos (team physics interactions)

---

## 4. Player System (Pingwins)

### 4.1 Character Select

- Each hero is unique
- Once selected → locked (no duplicates)

---

### 4.2 Named Heroes & Abilities

- Splash — Pucker Blaster (water push stream)
- Frostbite — Freeze Blast (freeze zone)
- Glacier — Mega Weight (high tilt influence)
- Dash — Slipstream Dash (burst movement)
- Sniper — Crystal Shot (precision projectile)
- Bombard — Belly Bomb (explosive impact)
- Cyclone — Spin Attack (radial push)
- Anchor — Grip Mode (high traction)

---

### 4.3 Movement

- Slippery, momentum-based
- Influenced by slope
- Drift + overshoot behavior

---

### 4.4 Spawn Rule

If no input:
- On iceberg → slide based on tilt
- In water → bob with current

---

### 4.5 Wrap System

If a player exits screen:
- Wraps to opposite side
- Preserves velocity and direction

---

### 4.6 Collision

- Players cannot overlap
- Bounce based on impact direction
- Momentum transfer

---

### 4.7 Jump & Impact System

Landing creates tilt force on iceberg.

#### Stomp Landing

Press DOWN during landing:
- Increased tilt force

#### Group Impact

Multiple players landing together:
- Amplified tilt
- Can slide others off top

---

### 4.8 Combat

Push / knock players off iceberg.

- Collision force
- Ability-enhanced knockback
- Landing impacts contribute

---

### 4.9 Knockdown

- Strong impacts cause slip state
- Temporary loss of control

---

### 4.10 Health & Death

- HP reduced by collisions, abilities, power-ups

Death:
- Explosion effect (ice + particles)

---

### 4.11 Respawn

- Fall → 5s delay
- Swim → jump back

---

## 5. Iceberg System

### 5.1 Tilemap

- Left side authored
- Right side mirrored at runtime

---

### 5.2 Motion

- Bobbing
- Tilting
- Rotation

---

### 5.3 Tilt Forces

- Player weight
- Player position
- Landing impacts

---

### 5.4 Balance Rule

- Edge = stronger push
- Top = more stable

---

### 5.5 Dynamic Top

- Highest point defines control

---

## 6. Control Zone

- Only dominant player gains time
- Contested reduces gain

---

## 7. Iceberg Break Event

- Trigger at 65% progress
- Top breaks
- Larger combat area

---

## 8. Ability System

### 8.1 Mechanics

- Wind-up required
- Directional targeting

---

### 8.2 Ability Effects

- Pucker Blaster → continuous push force
- Freeze Blast → slows and freezes area
- Mega Weight → increases tilt influence
- Slipstream Dash → burst movement + knockback
- Crystal Shot → high-speed projectile
- Belly Bomb → explosive landing impact
- Spin Attack → radial push
- Grip Mode → reduces sliding

---

## 9. Power-Up System

### 9.1 Spawn

- Random
- High-risk positions
- Moves with tilt

---

### 9.2 Power-Ups & Effects

- Grip Boots → traction
- Freeze Orb → freeze
- Wave Slam → shockwave
- Mega Core → weight boost
- Ice Sniper → ranged boost
- Spin Core → spin boost
- Dash Surge → speed boost + cooldown reduction
- Wind Gust → push field

---

## 10. Falling & Recovery

### 10.1 Falling

- Ocean OR recovery platform

---

### 10.2 Recovery

- Swim + jump back

---

## 11. Multiplayer

- 2–8 players
- Local + network + hybrid

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

- Gameplay demo
- Hero showcase
- Power-up showcase
- Instructions
- High score screen

---

### 13.1 High Score System

Primary metric:

Fastest Match Completion Time

Tracks:
- Player
- Time
- Character

---

## 14. End Game Stats

- Winner
- Time on Top
- Match Time
- Hits
- Falls

---

## 15. Camera

- Shared camera
- Dynamic zoom
- Tracks iceberg

---

## 16. Visual System

### Iceberg
- Tilemap-based

### Background
- Parallax layers

---

## 17. Networking

- Authoritative host
- Clients send input

---

## 18. UI / HUD

- Time meter
- King indicator
- Ability cooldown
- Power-up display

---

## 19. Data Model

```js
{
  player: {
    position,
    velocity,
    hp,
    timeOnTop,
    ability,
    powerUp
  },
  iceberg: {
    tilt,
    forces
  }
}
```

---

## 20. MVP Scope

- 2–4 players
- 1 iceberg
- Core physics + tilt
- 3 abilities
- 2 power-ups
- Local multiplayer
- Basic online

---

## 21. Identity Summary

King of the Iceberg =

King of the Hill
+ Sliding physics
+ Push combat
+ Dynamic terrain
+ Multiplayer chaos
