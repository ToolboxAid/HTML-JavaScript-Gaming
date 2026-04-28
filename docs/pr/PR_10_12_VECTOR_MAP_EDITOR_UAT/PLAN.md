# PLAN_PR_10_12_VECTOR_MAP_EDITOR_UAT

## Purpose
Stabilize Vector Map Editor under unified UX contract and enforce default selection behavior.

## Scope
- Enforce first element auto-selection (node/layer/map)
- Ensure visible selection highlight
- Enforce control enablement rules
- Ensure no reset/flicker
- No data/schema changes

## Acceptance
- First selectable element auto-selected
- Selection visibly highlighted
- Controls enabled only with selection
- Stable in workspace (no reset/reload)
