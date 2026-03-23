Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Sample Consolidation Phase 1 (Late Bootstrap + Sample183)

## Purpose
Clean up late-sample duplication and resolve the empty Sample183 endpoint without pushing sample infrastructure into engine.

## Goal
Consolidate repeated late-sample bootstrap patterns into sample-owned shared infrastructure and either wire or resolve `sample183-asteroids-game` in a truthful, low-risk way.

## Scope
- `samples/sample90+` bootstrap entry files where repetition is real
- `samples/_shared/` sample-owned helpers if needed
- `samples/sample183-asteroids-game/`
- direct sample tests or validation only if needed
- `samples/index.html` if required to keep the ladder truthful

## Constraints
- No engine promotion in this PR
- No gameplay changes
- No broad historical sample rewrite
- Keep consolidation in sample infrastructure, not engine
- Prefer small shared helper adoption over new framework layers
- Sample183 must become truthful: real bridge or removal/redirect, not a fake placeholder

## Expected Outcome
- repeated late-sample bootstrap code is reduced
- sample infrastructure stays outside engine
- Sample183 is no longer an empty misleading endpoint
- sample ladder remains truthful and maintainable
