# BUILD_PR_LEVEL_11_106_CANONICAL_ASSET_KIND_ENFORCEMENT

## Purpose
Enforce ONE canonical asset kind per concept and remove multi-alias mappings from tool resolution logic.

## Problem
Current code allows multiple names for same concept:

"vector", "vector-map"
"3d", "model", "mesh"
"camera-path", "3d-camera-path"

This creates:
- ambiguity
- schema drift
- tool mismatch
- hidden bugs

## Rule (MANDATORY)

ONE concept = ONE name

## Canonical Asset Kinds

Use ONLY these:

- skin
- sprite
- tilemap
- parallax
- vector
- vector-map
- model
- camera-path
- asset (for asset-browser only)

## Remove ALL aliases

Delete:
- "3d"
- "mesh"
- "model" (if used as alias for 3d)
- "3d-camera-path"
- duplicate entries in arrays

## Tool Mapping (FINAL)

skin-editor -> ["skin"]
sprite-editor -> ["sprite"]
tile-map-editor -> ["tilemap"]
parallax-editor -> ["parallax"]
svg-asset-studio -> ["vector"]
vector-map-editor -> ["vector-map"]
3d-asset-viewer -> ["model"]
3d-camera-path-editor -> ["camera-path"]
asset-browser -> ["asset"]
asset-pipeline -> []
tile-model-converter -> ["tilemap","vector","model"]

## Enforcement

- No arrays with multiple synonyms
- No dual mapping
- No wildcard "*"
- Schema must align to same names
- Samples must use same names

## Acceptance

- Each asset kind appears EXACTLY once across repo
- No alias mapping exists
- Tool resolution is deterministic
