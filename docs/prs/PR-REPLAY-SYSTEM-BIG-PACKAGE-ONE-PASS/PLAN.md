Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Replay System (Big Package, One Pass)

## Goal
Implement a minimal but real replay system in one pass, using the now-deterministic engine foundation and validated games to prove that recorded input can be replayed into the same gameplay outcome.

## Why This Big Package Is Safe
The repo already has:
- deterministic timing work
- validated Asteroids behavior
- validated Gravity Well behavior
- enforceable engine boundaries

That means a replay MVP can be added as a contained feature rather than a speculative architectural rewrite.

## In Scope
- replay-related engine/tooling support only where justified
- integration into at least one real game, preferably Gravity Well first because its deterministic simulation is simpler to prove
- optional follow-on proof in Asteroids only if the implementation naturally supports it
- focused automated tests
- small docs updates only if directly tied to replay usage

## Out of Scope
- full save-state editor
- content authoring tools
- multiplayer/network replay
- cinematic timeline tooling
- broad engine redesign
- visual polish unrelated to replay

## Replay MVP Requirements

### 1. Record
Support recording of a run using:
- deterministic starting state
- input/state events over time
- a simple serializable replay data format

The replay format should be minimal and explicit.

### 2. Playback
Support replaying the recorded run by:
- resetting to the same initial state
- feeding recorded inputs/events back into the game over time
- reproducing the same gameplay outcome within deterministic expectations

### 3. Verification
Support proving replay correctness through:
- automated replay-equality tests where practical
- outcome comparison (win/loss/progression)
- bounded state comparison where floating-point tolerance is necessary

### 4. Integration target
Primary recommended proof target:
- `games/GravityWell/`

Why:
- simpler deterministic force simulation
- lower gameplay noise
- cleaner first replay proof

Secondary optional proof target:
- `games/Asteroids/` only if the same infrastructure can be adopted without scope creep

## Preferred Design Boundaries

### Engine/tooling side
Only create what is clearly reusable:
- replay recorder/player helper(s)
- replay data model/format helpers
- deterministic playback orchestration support if truly generic

### Game side
Keep local:
- game-specific input mapping
- game-specific state reset/bootstrap rules
- game-specific replay UI or demo controls if any

Do not force game-specific semantics into engine.

## Required Changes

### 1. Minimal replay core
Add the smallest reusable replay support needed to:
- record timestamped or step-indexed input/event frames
- play them back deterministically
- expose a clear interface for games

### 2. Game integration
Integrate replay into Gravity Well first.
Possible flow:
- start deterministic run
- record inputs
- restart
- replay the same sequence
- compare outcome/state

### 3. Tests
Add focused tests for:
- replay recording format integrity
- playback correctness
- same input sequence -> same outcome
- bounded equivalence checks where needed

### 4. Runtime policy
Only broaden beyond Gravity Well if:
- it stays small
- it clearly reuses the same replay core
- it does not derail the MVP

## Acceptance Criteria
- a replay MVP exists
- Gravity Well can record and replay a run
- replay correctness is tested
- any generic replay support is narrow and reusable
- game-specific logic remains local
- no broad engine redesign is introduced
