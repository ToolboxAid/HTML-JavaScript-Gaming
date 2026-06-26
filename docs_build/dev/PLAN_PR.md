# PLAN_PR: PR_26177_003-shared-geometry-foundation

## Purpose

Add a small shared geometry foundation.

## Scope

- Add `src/shared/geometry/` foundation.
- Include reusable primitives/helpers for vectors, rectangles, bounds, distance, clamp, containment, and intersection basics.
- Add targeted tests.
- No engine refactor.
- No browser-owned product data.
- No runtime UI changes.
- No unrelated cleanup.

## Implementation Plan

1. Add `src/shared/geometry/geometry.js`.
2. Add `tests/shared/GeometryFoundation.test.mjs`.
3. Validate vector, rectangle, bounds, distance, clamp, containment, and intersection behavior.
4. Produce required Codex reports and repo-structured ZIP.
