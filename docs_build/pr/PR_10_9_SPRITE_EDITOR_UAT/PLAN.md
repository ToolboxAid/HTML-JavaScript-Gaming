# PLAN_PR_10_9_SPRITE_EDITOR_UAT

## Purpose
Align Sprite Editor behavior with unified UX contract and fix preview mismatch.

## Scope
- Enforce selection (sprite/frame)
- Fix preview vs sample mismatch (render only, not data)
- Enforce control enablement
- Ensure no reset/flicker
- No data changes

## Acceptance
- Sprite preview matches sample output
- First frame auto-selected
- Controls enabled only with selection
- Stable inside workspace
