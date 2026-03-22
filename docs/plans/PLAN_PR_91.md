Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_91.md

# PLAN_PR — Sample91 - Event Bus

## Capability
Event Bus

## Goal
Introduce a reusable engine-owned event bus so systems and scenes can publish and subscribe without tight coupling.

## Engine Scope
- Add reusable event publish/subscribe support in engine-owned paths
- Keep event contracts generic and decoupled from sample-specific behavior
- Support clean lifecycle-safe registration and teardown

## Sample Scope
- Demonstrate events being emitted and consumed across separate concerns
- Show decoupled interaction without direct object wiring
- Follow Sample01 structure exactly

## Acceptance Targets
- Events can be published and received reliably
- Subscriptions do not require scene-to-system hacks
- Capability is reusable and not trapped in sample code

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
