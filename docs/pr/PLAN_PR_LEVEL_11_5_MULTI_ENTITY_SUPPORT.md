# PLAN PR LEVEL 11.5 — Multi-Entity Support

## Objective
Extend the rewind/replay system from single-entity to multi-entity while preserving determinism and isolation.

## Scope
- Per-entity timeline tracking
- Entity-scoped reconciliation
- Selective rewind (affected entities only)
- Debug visualization per entity

## Constraints
- No engine-core changes
- Sample-layer only (network_sample_c)
- Maintain deterministic replay rules

## Outcome
System supports multiple entities with independent timelines and corrections without global side effects
