Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_93.md

# PLAN_PR — Sample93 - Config System (JSON-Driven)

## Capability
Config System (JSON-Driven)

## Goal
Introduce a reusable JSON-driven configuration system so samples can load structured settings without hardcoded constants everywhere.

## Engine Scope
- Add config loading and access support in engine-owned paths
- Keep configuration generic and reusable across samples
- Validate basic config shape and loading flow

## Sample Scope
- Demonstrate loading sample settings from JSON-driven config
- Use config for visible sample behavior or setup
- Follow Sample01 structure exactly

## Acceptance Targets
- Config values load and apply correctly
- Core loading logic lives in engine, not sample files
- Sample proves capability clearly without unrelated expansion

## Out of Scope
- No game-layer bootstrap work
- No unrelated engine refactors
- No expansion beyond the approved capability

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
