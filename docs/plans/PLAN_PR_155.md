Toolbox Aid
David Quesenberry
03/22/2026
PLAN_PR_155.md

# PLAN_PR — Sample155 - Interest Management

## Phase
10 - Multiplayer Networking Stack

## Capability
Interest Management

## Goal
Add reusable interest management so each client receives only the relevant subset of world state appropriate to its scope or proximity.

## Engine Scope
- Add engine-owned interest-management support
- Support filtering world state by relevance, scope, visibility, or proximity
- Keep relevance rules reusable and not trapped in one sample
- Prepare performance-minded replication flow for larger worlds

## Sample Scope
- Demonstrate filtered relevance or scoped replication in samples/Sample155/
- Show that not all clients receive all state equally when relevance rules apply
- Follow Sample01 structure exactly

## Acceptance Targets
- Interest filtering is clearly demonstrated
- Replication becomes more scoped or efficient in the proof sample
- Interest rules remain reusable and engine-owned

## Multiplayer Design Notes
- Prefer an authoritative host/server model.
- Keep transport, sync, prediction, and diagnostics as separate reusable layers.
- Avoid raw socket or transport API usage in samples.

## Out of Scope
- No game-specific multiplayer content
- No unrelated engine refactors beyond the approved capability
- No expansion beyond the approved sample purpose

## Build Notes
- Update samples/index.html
- Include required file headers
- Preserve repo structure exactly
- Keep reusable logic in engine and proof logic in samples only
