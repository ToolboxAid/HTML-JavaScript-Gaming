Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_123.md

# PLAN_PR — Sample123 - MIDI Player

## Phase
7 - Platform + UX

## Capability
MIDI Player

## Goal
Introduce a reusable MIDI player capability so timed note-based playback can run through engine-owned audio paths.

## Engine Scope
- Add engine-owned MIDI playback support
- Keep timing and sequence interpretation reusable and decoupled from scenes
- Allow future extension without trapping MIDI behavior in one sample

## Sample Scope
- Demonstrate MIDI playback in samples/Sample123/
- Show visible proof of sequence start, stop, or status
- Follow Sample01 structure exactly

## Acceptance Targets
- MIDI playback works predictably through engine-owned paths
- Timing behavior is clear and reusable
- No sample-owned MIDI logic is used as core implementation

## Out of Scope
- No game-specific logic
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
