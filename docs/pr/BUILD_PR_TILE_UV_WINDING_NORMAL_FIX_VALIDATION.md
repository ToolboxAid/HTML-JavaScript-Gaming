# BUILD_PR_TILE_UV_WINDING_NORMAL_FIX_VALIDATION

## Purpose
Fix the tile rendering issue where specific tiles appear upside down, rotated 180 degrees, and visually open from the top or inside on the sides.

## Observed Symptoms
- tiles 1706 and 1707 appear upside down
- tiles 1706 and 1707 appear rotated 180 degrees
- top face appears see-through
- side faces expose interior view

## Likely Root Causes To Validate
- UV vertical flip mismatch
- triangle winding order reversed
- normals facing inward
- post-mesh tile transform incorrectly rotating the tile

## Scope
- one PR purpose only
- docs-first bundle
- no implementation code authored by ChatGPT
- tightly scoped to the tile rendering defect
- no broad engine or renderer cleanup

## Codex Responsibilities
1. Inspect the mesh generation and render path for tiles 1706 and 1707.
2. Validate UV orientation for the top and side faces.
3. Validate triangle winding order for all visible tile faces.
4. Validate normals for top and side faces.
5. Check whether an additional transform is applying a 180-degree rotation after mesh generation.
6. Apply the smallest valid root-cause fix.
7. Use temporary diagnostics only if needed to isolate the issue, then remove them before finalizing.
8. Re-validate with normal backface culling enabled.
9. Write execution-backed reports under `docs/dev/reports`.

## Required Validation
- top face is solid and not see-through
- side faces do not reveal interior geometry
- tile orientation is correct
- no permanent debug-only rendering changes remain
- final render works with normal culling enabled

## Acceptance
- tiles 1706 and 1707 render with correct orientation
- no inside-facing visibility artifacts remain
- root cause is documented in reports
- final change remains tightly scoped to this defect
