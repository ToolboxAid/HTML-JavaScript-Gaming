# Multi-Entity Timeline Spec

## Approach Options
1. Per-entity timeline buffers (preferred)
2. Shared timeline with entity partitions

## Requirements
- Each entity maintains:
  - input history
  - predicted state history
  - frame id linkage

## Recommendation
Start with per-entity buffers for simplicity and isolation
