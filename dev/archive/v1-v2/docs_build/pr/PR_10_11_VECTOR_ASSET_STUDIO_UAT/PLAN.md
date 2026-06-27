# PLAN_PR_10_11_VECTOR_ASSET_STUDIO_UAT

## Purpose
Stabilize Vector Asset Studio under unified UX contract and enable palette/paint/stroke controls correctly.

## Scope
- Enforce selection (first shape/layer)
- Enable palette/paint/stroke when selection exists
- Disable when no selection
- Ensure visible selection highlight
- No data/schema changes

## Acceptance
- First element auto-selected
- Palette/paint/stroke enabled with selection
- Controls disabled without selection
- Stable in workspace (no reset/flicker)
