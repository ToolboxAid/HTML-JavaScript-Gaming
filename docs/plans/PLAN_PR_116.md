Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_116.md

# PLAN_PR — Sample116 - Replay System

## Capability
Replay System

## Goal
Introduce a reusable replay system so engine-driven sessions can be recorded and replayed deterministically through approved contracts.

## Engine Scope
- Add engine-owned replay capture and playback support
- Keep recording/playback separate from scene-owned hacks
- Preserve deterministic lifecycle and input ownership where applicable

## Sample Scope
- Demonstrate a session being recorded and replayed in samples/Sample116/
- Show clear proof that playback reproduces the expected behavior
- Follow Sample01 structure exactly

## Acceptance Targets
- Replay capture and playback work predictably
- Replay support is reusable and engine-owned
- No duplicated replay logic exists in sample scene code

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
