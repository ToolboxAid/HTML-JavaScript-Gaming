# PR_26133_037 Object Preview Transform Bounds Report

Task: PR_26133_037-object-preview-transform-bounds-fix
Date: 2026-05-15

## Implementation

- Added transformed geometry point collection for Object Vector Studio V2 preview bounds.
- Added a point transform helper that mirrors the SVG transform order used for rendering:
  `translate(x y)`, `translate(origin)`, `rotate`, `scale`, `translate(-origin)`.
- Updated `transformedBounds` to union transformed points instead of scaling raw axis-aligned bounds.
- Bounds now include x/y transform, rotation, scaleX/scaleY, and origin.
- Selection box and resize handles now use transformed bounds.
- Line endpoint handles now use transformed endpoint positions instead of raw endpoint plus x/y offset.
- Object-level bounds continue to use `transformedBounds`, so object bounds inherit the same transformed geometry contract.

## Geometry Coverage

- Rectangle/text: transformed corner points.
- Line: transformed point1 and point2.
- Polygon/triangle: transformed point list.
- Circle/ellipse: sampled perimeter points before applying shape transform.
- Arc: sampled arc points before applying shape transform.

## Validation

- `npm run test:workspace-v2` passed with 50 tests.
- Added Playwright coverage confirms a scaled and rotated selected shape has:
  - dashed selection bounds matching transformed geometry,
  - four handles aligned to transformed bounds,
  - hit testing on transformed visual geometry outside raw bounds,
  - drag interaction startup from the transformed visual region.
- No raw-geometry-only selection fallback was added.
