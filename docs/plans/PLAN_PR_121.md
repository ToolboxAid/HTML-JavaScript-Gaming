Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_121.md

# PLAN_PR — Sample121 - Full Screen Ability

## Capability
Full Screen Ability

## Goal
Add a reusable full screen ability flow so a sample can request, enter, exit, and verify fullscreen mode through engine-owned or repo-approved presentation paths instead of scene hacks.

## Design Intent
This sample should prove that fullscreen is treated as a capability:
- user-triggered
- reusable
- UI-safe
- sample-demonstrated
- not hardcoded per scene

The sample should show:
- enter fullscreen
- exit fullscreen
- visible fullscreen state
- graceful behavior if fullscreen is unavailable or denied

## Engine Scope
- Add reusable fullscreen support in approved engine-owned presentation or platform-facing paths
- Centralize fullscreen request, exit, and state-check logic
- Keep browser/platform details out of sample scene logic
- Support a clean public contract for querying fullscreen state
- Support safe lifecycle handling for fullscreen state changes

## Sample Scope
- Demonstrate fullscreen enter/exit from samples/Sample121/
- Provide a clear trigger such as a button or mapped action using approved input paths
- Show visible status text or overlay proving current fullscreen state
- Demonstrate fallback messaging when fullscreen is unavailable or blocked
- Follow Sample01 structure exactly

## Acceptance Targets
- Sample can enter fullscreen through the approved contract
- Sample can exit fullscreen through the approved contract
- Fullscreen state is visibly reflected in the sample
- Failure/unavailable states are handled gracefully
- No browser-specific fullscreen logic is duplicated in sample files
- Sample remains removable without breaking engine behavior

## Suggested Proof Flow
1. Start in normal windowed mode
2. Trigger fullscreen using a visible control
3. Confirm fullscreen state visually
4. Exit fullscreen using a visible control or approved action
5. Confirm return to windowed mode
6. Show a fallback notice if the request is rejected

## Out of Scope
- No unrelated display-system refactors
- No game-layer bootstrap work
- No per-sample fullscreen hacks
- No mobile-only branch explosion beyond reusable support

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
