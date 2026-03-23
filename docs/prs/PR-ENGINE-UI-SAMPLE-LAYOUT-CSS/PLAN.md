Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# PLAN_PR — Create `/engine/ui/sampleLayout.css`

## Recommendation

### Path
Use:
- `engine/ui/sampleLayout.css`

### File name
Keep:
- `sampleLayout.css`

## Why `sampleLayout.css` makes more sense than `baseLayout.css`

### `sampleLayout.css` is better because:
- it matches the current, proven use: sample pages and game demo pages
- it is specific without being misleading
- it reduces the chance that future contributors treat it like a global foundation stylesheet for unrelated app surfaces

### `baseLayout.css` is weaker because:
- it implies a universal base/foundation layer
- it invites unrelated layout concerns to accumulate there
- it suggests broader architectural importance than the current file has earned

## Ownership Rule
Because the stylesheet is used by both `/samples` and `/games`, it should not live under `/samples/_shared/`.

The clean ownership rule is:
- shared page/demo layout used by multiple repo surfaces
- lives in engine-owned UI support
- consumed by samples and games

This is UI scaffolding, not gameplay logic and not sample-only infrastructure.

## In Scope
- move `/samples/_shared/sampleLayout.css` to `/engine/ui/sampleLayout.css`
- update all HTML references in `/samples` and `/games`
- keep behavior unchanged
- optionally leave no duplicate copy behind

## Out of Scope
- redesigning page layout
- renaming multiple UI files
- creating a broader CSS framework
- changing engine runtime behavior
- changing gameplay behavior

## Required Action Plan

### 1. Inventory usage
Find every reference to:
- `/samples/_shared/sampleLayout.css`

Classify usage by:
- sample HTML pages
- game HTML pages
- any docs/examples that reference the file directly

### 2. Create target file
Create:
- `engine/ui/sampleLayout.css`

Initial content should be identical to the existing stylesheet.
This is a relocation, not a redesign.

### 3. Update references
Change all sample/game HTML references to the new path:
- from `/samples/_shared/sampleLayout.css`
- to `/engine/ui/sampleLayout.css`

Preserve relative paths correctly for:
- sample pages
- game pages at different folder depth

### 4. Remove old file
After references are updated and verified, remove:
- `/samples/_shared/sampleLayout.css`

Do not leave duplicate copies unless a verification blocker requires a temporary transition step.

### 5. Validate behavior
Confirm:
- samples still render correctly
- games still render correctly
- no broken stylesheet links remain
- no layout regressions are introduced

## Acceptance Criteria
- stylesheet lives at `engine/ui/sampleLayout.css`
- all sample/game references point to the new location
- no duplicate legacy copy remains
- behavior is unchanged
- naming remains `sampleLayout.css`
