Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_95.md

# PLAN_PR — Sample95 - Debug Tools (Overlay, Hitboxes)

## Capability
Debug Tools (Overlay, Hitboxes)

## Goal
Add reusable debug tools for overlays and hitbox-style visualization through approved renderer/debug paths only.

## Engine Scope
- Implement reusable debug overlay and bounds visualization support
- Keep all debug drawing inside renderer/debug ownership rules
- Allow optional toggling without contaminating normal runtime flow

## Sample Scope
- Demonstrate debug overlays and hitbox-style visual aids clearly
- Show how the debug tools help inspect runtime behavior
- Follow Sample01 structure exactly

## Acceptance Targets
- Debug visuals are clear and useful
- Rendering remains inside approved engine paths
- Capability is reusable and sample remains removable

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
