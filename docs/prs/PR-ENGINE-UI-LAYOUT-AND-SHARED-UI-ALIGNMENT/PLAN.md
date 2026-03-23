Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Engine UI Layout + Shared UI Alignment

## Goal
Complete the shared layout CSS relocation and related low-risk alignment in one larger pass, while preserving all current sample/game visual behavior.

## Why This Larger Package Is Safe
This work is:
- mechanical
- path-based
- low-risk
- already planned
- behavior-preserving

The stylesheet content should remain the same. Only ownership and references change.

## In Scope
- move `/engine/ui/sampleLayout.css` -> `/engine/ui/sampleLayout.css`
- update all sample HTML references
- update all game HTML references
- update any direct docs or reference files that still mention the old path
- remove the old file after references are updated
- validate no broken stylesheet links remain

## Out of Scope
- engine runtime changes
- gameplay changes
- layout redesign
- CSS feature expansion
- broader UI framework cleanup

## Required Changes

### 1. Create canonical shared layout path
Create:
- `engine/ui/sampleLayout.css`

Initial content must match the current shared stylesheet exactly.
This is a relocation, not a redesign.

### 2. Update all consumers
Replace references to:
- `/engine/ui/sampleLayout.css`

with:
- `/engine/ui/sampleLayout.css`

Update:
- sample HTML pages
- game HTML pages
- any directly relevant repo-facing references

### 3. Remove legacy copy
Remove:
- `/engine/ui/sampleLayout.css`

Do not keep duplicate copies after verification.

### 4. Validate
Confirm:
- sample pages still render correctly
- game pages still render correctly
- no broken stylesheet paths remain
- no behavior or visual regressions are introduced

## Acceptance Criteria
- `engine/ui/sampleLayout.css` exists
- all sample/game references point to the new path
- old `/engine/ui/sampleLayout.css` is removed
- any directly related stale references are updated
- no gameplay/runtime files change
- visual behavior remains unchanged

