Toolbox Aid
David Quesenberry
03/29/2026
PLAN_PR_LEVEL_9_1_ENGINE_API_STABILIZATION.md

# PLAN_PR — Level 9.1 Engine API Stabilization

## Title
Level 9.1 — Engine API Stabilization

## Purpose
Stabilize the public interfaces of the newly engine-promoted world systems so future games, samples, and tools can consume them without architecture drift.

## Scope
- docs/pr
- docs/dev

## Out of Scope
- direct runtime code changes in this PLAN
- new gameplay features
- engine redesign
- unrelated cleanup
- tool refactors

## Systems in Scope
- Spawn System
- Lifecycle System
- World State System
- Events System

## Why This Step Exists
These systems are now engine-owned.
The next safe step is to lock:
- public contracts
- configuration boundaries
- ownership expectations
- extension rules

This prevents accidental drift as more games adopt the systems.

## Stabilization Goals
The future BUILD_PR should:
- define public API surface for each promoted system
- separate public contract from internal implementation details
- document required inputs, outputs, and lifecycle expectations
- define allowed configuration ownership in scene/game layers
- define forbidden coupling patterns

## API Rules
Public API must:
- be minimal
- be explicit
- be deterministic
- avoid game-specific naming
- avoid hidden state dependencies
- avoid renderer/input coupling

## Configuration Rules
Game/sample layer may own:
- game-specific config values
- progression tables
- spawn patterns
- event schedules
- local adapters

Engine layer must own:
- reusable system contracts
- reusable lifecycle semantics
- reusable state/event orchestration semantics

## Extension Rules
Future consumers may:
- provide config
- compose systems
- add local adapters

Future consumers may not:
- fork system logic into games
- bypass public API contracts
- inject rendering/input behavior into systems
- create alternate duplicate versions of promoted systems

## Build Direction
The future BUILD_PR should:
1. inventory current public touchpoints
2. define stable public interfaces
3. document config ownership boundaries
4. identify internals that should remain private
5. define migration notes for current games
6. produce a repo-structured ZIP with docs/dev control files

## Deliverables
- API stabilization doc for promoted systems
- public vs private boundary table
- configuration ownership table
- forbidden-pattern list
- migration notes for existing games
- next-step BUILD guidance

## Acceptance Criteria
- public interfaces are explicit
- internal details are not exposed unnecessarily
- no architecture violations are introduced
- no duplicate system logic is encouraged
- game/sample ownership remains clear
- future reuse path is safer and simpler

## Next Step
BUILD_PR_LEVEL_9_1_ENGINE_API_STABILIZATION
