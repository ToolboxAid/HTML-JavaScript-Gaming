# PLAN_PR: PR_26177_004-shared-color-foundation

## Purpose

Add a small shared color foundation.

## Scope

- Add `src/shared/color/` foundation.
- Include hex/rgb/hsl conversion helpers.
- Include clamp, lerp/blend helpers, luminance, and contrast basics.
- Add targeted tests.
- No page styling changes.
- No browser-owned product data.
- No runtime UI changes.
- No unrelated cleanup.

## Implementation Plan

1. Add `src/shared/color/color.js`.
2. Add `tests/shared/ColorFoundation.test.mjs`.
3. Validate conversion, blending, luminance, and contrast helpers.
4. Produce required Codex reports and repo-structured ZIP.
