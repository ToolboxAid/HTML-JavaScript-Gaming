# BUILD_PR — LEVEL 09.04 ASSET STRUCTURE SIMPLIFICATION

## Problem
Current structure introduces unnecessary nesting:

- data/platform/palettes
- data/platform/sprites
- data/platform/tilemap

Both `data/` and `platform/` are acting as containers, which creates redundancy.

## Decision (Simplify)
Use **type-first buckets directly under assets/** with NO extra wrapper layers.

### Final Structure
assets/
  palettes/
  sprites/
  tilemaps/

Optional grouping ONLY when needed:
assets/sprites/platform/
assets/tilemaps/platform/

## Rules
1. REMOVE `data/` when it only acts as a container
2. REMOVE `platform/` as a default container
3. KEEP only TYPE folders at the top level
4. USE nested grouping only when necessary

## Examples

### ❌ Over-engineered
assets/data/platform/palettes/
assets/data/platform/sprites/
assets/data/platform/tilemap/

### ✅ Correct
assets/palettes/
assets/sprites/
assets/tilemaps/

### ✅ With grouping (only if needed)
assets/sprites/platform/
assets/tilemaps/platform/

## Naming adjustments
- tilemap → tilemaps (plural standard)
- palette → palettes

## Why this is better
- eliminates double-container problem
- faster navigation
- cleaner mental model
- consistent with tooling expectations
- avoids future refactor when MIDI/tools expand

## Scope
Applies to:
- games
- samples
- tools

## Acceptance Criteria
- no `data/platform` chains
- top-level folders are TYPE buckets only
- plural naming enforced
- optional grouping only when justified
