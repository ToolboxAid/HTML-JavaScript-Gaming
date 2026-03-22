Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_115.md

# PLAN_PR — Sample115 - Save Compression

## Capability
Save Compression

## Goal
Add reusable save compression support so persisted data can be stored more efficiently without changing the public save/load contract.

## Engine Scope
- Add engine-owned compression/decompression support in persistence paths
- Preserve public save/load ownership and lifecycle rules
- Keep compression reusable and not tied to one sample format

## Sample Scope
- Demonstrate compressed save/load flow in samples/Sample115/
- Show that persisted state still round-trips correctly
- Follow Sample01 structure exactly

## Acceptance Targets
- Compressed save data restores correctly
- Compression support is reusable and engine-owned
- No persistence logic is duplicated in sample files

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
