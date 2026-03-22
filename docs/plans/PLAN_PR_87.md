Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_87.md

# PLAN_PR — Sample87 - Damage + Invulnerability Frames

## Capability
Damage + Invulnerability Frames

## Goal
Add reusable damage handling and short invulnerability windows after being hit.

## Engine Scope
- Add reusable damage reception and invulnerability timing support
- Keep logic in engine systems/data paths
- Avoid sample-owned damage rules duplicated elsewhere

## Sample Scope
- Demonstrate target taking damage once and ignoring immediate repeated hits during i-frames
- Provide clear visible feedback when invulnerable
- Follow Sample01 structure exactly

## Acceptance Targets
- Damage is applied correctly
- Invulnerability frames block repeated rapid hits
- Behavior is reusable and not trapped in the sample

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
