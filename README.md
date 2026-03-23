Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Replay System (Big Package, One Pass)

## Purpose
Implement a first replay system in one bundled pass now that the engine and games are deterministic and validated.

## Goal
- record player input/events over time
- replay a recorded run deterministically
- keep the design minimal and practical
- support debugging and future showcase/demo workflows

## Scope
- engine/runtime and/or tooling only where clearly justified
- `games/Asteroids/` and `games/GravityWell/` integration only as needed for proving the replay flow
- focused tests
- minimal docs updates if directly tied to the replay system

## Constraints
- One bundled pass
- No broad engine redesign
- No gameplay expansion
- Prefer a narrow, deterministic replay MVP
- Do not build a full editor or content pipeline in this PR

## Expected Outcome
- a reusable replay capability exists
- at least one real game proves it end-to-end
- behavior remains deterministic under replay
