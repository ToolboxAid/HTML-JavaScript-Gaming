# BUILD_PR_LEVEL_8_29B_ASTEROIDS_DIRECT_LAUNCH_FIX

## Objective
Correct preview click behavior.

## Current (WRONG)
preview.svg → Workspace Manager route

## Correct (TARGET)
preview.svg → direct game launch route

## Rules
- Preview click launches game directly
- Workspace Manager must NOT be used for preview
- Workspace Manager remains available via separate action

## Expected Route
Use existing game runtime entry:
- games/Asteroids runtime entry point (index/runtime bootstrap)

## Acceptance
- Asteroids preview launches game directly
- No Workspace Manager diagnostic appears
- No query parameters required for direct launch
