Toolbox Aid
David Quesenberry
03/29/2026
PLAN_PR_LEVEL_10_6_WORLD_STATE_GAME_STATE_SYSTEM.md

# PLAN_PR — Level 10.6 World State / Game State System

## Title
Level 10.6 — World State / Game State System

## Purpose
Define a formal world state / game state system that gives advanced systems a shared, explicit state contract for reading approved state, applying controlled transitions, and coordinating gameplay progression without hidden coupling or ownership drift.

## Scope
- docs/pr
- docs/dev

## Out of Scope
- engine redesign
- renderer changes
- input changes
- direct runtime code changes in this PLAN
- unrelated cleanup
- hidden architecture rewrites

## Advanced System (Locked)
World State / Game State System

## Why This System
- creates a formal shared state contract for advanced gameplay systems
- prevents ad hoc state spread across multiple systems
- keeps state ownership explicit and transitions controlled
- allows Objectives, Missions, Events, AI, Rewards, and future systems to coordinate safely
- preserves engine lifecycle and existing architecture rules

## Responsibilities
- define world/game state ownership boundaries
- define approved readable state surfaces
- define controlled transition rules
- define state selector patterns
- define anti-patterns for state mutation and duplication
- define integration points with events and system integration layer

## Rules
- Scene orchestrates only
- Systems contain logic only
- No rendering in systems
- No input in systems
- No duplicate ownership
- No hidden state mutation
- No direct system-to-system hard coupling
- State transitions must be explicit and named

## State Boundary Rules
Core engine remains responsible for:
- lifecycle ownership
- update ordering
- renderer ownership
- input ownership
- service registration rules

Advanced systems remain responsible for:
- their own internal logic
- reading only approved state surfaces
- requesting state changes through approved transitions
- not owning duplicate copies of shared world/game state

World State / Game State System may:
- define canonical shared state shape
- define selectors for approved reads
- define named transitions for approved writes
- coordinate state change notifications through the event pipeline
- expose safe state contracts to sample/game layers

World State / Game State System may not:
- own rendering
- own input
- bypass public APIs
- allow arbitrary mutation from any module
- duplicate business logic owned elsewhere
- become a second engine

## Expected State Targets
The future BUILD_PR should support patterns such as:
- phase or mode progression
- wave / round / level progression state
- score / reward / unlock progression state
- objective / mission progression snapshots
- player/session/world flags
- shared win / loss / pause / completion state

## Deliverables
- world state definition
- game state definition
- selector guidance
- transition guidance
- state ownership map
- integration guidance with events and integration layer
- anti-pattern list
- risk list
- next-step BUILD guidance

## Acceptance Criteria
- shared state contracts are explicit and reusable
- selectors are read-only by design
- transitions are named and controlled
- no direct arbitrary state mutation is required
- no duplicate ownership is introduced
- integration uses public APIs and approved events only
- UI concerns remain outside the system
- future systems can compose through shared state safely

## Next Step
BUILD_PR_LEVEL_10_6_WORLD_STATE_GAME_STATE_SYSTEM
