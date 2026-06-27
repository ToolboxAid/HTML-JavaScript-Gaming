# BUILD_PR_LEVEL_18_13_TRACK_E_CSS_UI_NORMALIZATION_FOUNDATION - Scope

## PR Purpose
Advance Level 18 Track E with one smallest executable slice by normalizing one shared UI chrome cluster and its direct consumers only.

## Chosen Cluster
Phase 17 overlay sample page chrome:
- `samples/phase-17/shared/overlaySampleLayout.css`
- direct consumers: sample pages `1708` through `1713`
- shared class host: `src/engine/ui/baseLayout.css`

## Why This Cluster
- reused by more than one surface (6 sample surfaces)
- contained and testable
- had duplicated chrome declarations overlapping base layout behaviors (main/canvas/copy/section)

## Out of Scope (enforced)
- no repo-wide CSS sweep
- no visual redesign
- no game-specific styling changes
- no docs reorganization
- no unrelated HTML restructuring
