# BUILD_PR_LEVEL_22_3_TOOLS_SHARED_LAYER_CONSOLIDATION

## Purpose
Consolidate the tools shared layer so there is exactly one authoritative shared folder for tool-facing reusable logic.

## Problem
The repo currently has overlapping shared surfaces under:
- `tools/shared/`
- `tools/dev/shared/`

This creates ambiguity, duplication risk, and unstable placement for future shared tool logic.

## Goal
Normalize to a single authoritative shared layer:

- keep: `tools/shared/`
- eliminate: `tools/dev/shared/`

## Scope
Included:
- inventory files in both shared locations
- classify duplicates / overlaps / unique files
- move or merge valid shared files from `tools/dev/shared/` into `tools/shared/`
- delete obsolete duplicates only after content preservation
- update imports and references
- validate affected tools still resolve and load

Excluded:
- no unrelated feature expansion
- no broad tools redesign
- no start_of_day changes
- no roadmap rewrites

## Required Outputs
- `docs/dev/reports/BUILD_PR_LEVEL_22_3_TOOLS_SHARED_LAYER_CONSOLIDATION_INVENTORY.md`
- `docs/dev/reports/BUILD_PR_LEVEL_22_3_TOOLS_SHARED_LAYER_CONSOLIDATION_MOVE_MAP.md`
- `docs/dev/reports/BUILD_PR_LEVEL_22_3_TOOLS_SHARED_LAYER_CONSOLIDATION_DEDUPE_DECISIONS.md`
- `docs/dev/reports/BUILD_PR_LEVEL_22_3_TOOLS_SHARED_LAYER_CONSOLIDATION_REFERENCE_UPDATE_LOG.md`
- `docs/dev/reports/BUILD_PR_LEVEL_22_3_TOOLS_SHARED_LAYER_CONSOLIDATION_VALIDATION.md`

## Required Work

### 1. Shared layer inventory
Inventory:
- all files under `tools/shared/`
- all files under `tools/dev/shared/`

For each file classify as one of:
- keep in `tools/shared`
- move from `tools/dev/shared` to `tools/shared`
- merge into existing `tools/shared` file
- remove as obsolete duplicate

### 2. Consolidation rules
- `tools/shared/` becomes the only shared location
- no file may remain under `tools/dev/shared/` after consolidation unless explicitly justified in validation
- if two files overlap, preserve the authoritative implementation before removing anything
- record all merge/dedupe decisions

### 3. Reference updates
Update:
- imports
- path references
- documentation references
- tool boot/runtime references

### 4. Validation
Validate at minimum:
- no broken imports from moved files
- affected tools still load
- no unresolved references to `tools/dev/shared/`
- no start_of_day changes
- unrelated working-tree changes preserved

## Acceptance
- one authoritative shared tool layer exists
- `tools/shared/` is authoritative
- `tools/dev/shared/` is eliminated or reduced to zero in-scope files
- imports/references updated
- validation proves no breakage

## Roadmap Advancement
This PR may advance only if fully executed and validated:
- tools shared layer consolidation / normalization work tied to this lane
- any directly related tools normalization item only if actually completed here

Do not advance unrelated tools roadmap items in this PR.
