# Selective Rewind Spec

## Goal
Only rewind entities that diverged.

## Flow
1. Identify entities with divergence
2. Rewind only those entities to anchor frame
3. Replay inputs forward per entity

## Benefit
Improves performance and avoids unnecessary corrections
