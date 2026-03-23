Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Step 2C: CanvasSurface Ownership

## Goal
Resolve whether CanvasSurface is dead code or misplaced browser adapter.

## Required Changes

### 1. Usage verification
- Confirm if CanvasSurface is used anywhere
- If unused → remove safely

### 2. If used
- Move DOM ownership out of engine/core
- Keep rendering logic inside renderer
- Split responsibilities if needed:
  - DOM acquisition
  - canvas utilities

### 3. Preserve behavior
- No rendering changes
- No API changes unless required

### 4. Tests
- Add minimal test or validation ensuring:
  - no regressions
  - no missing dependencies

## Acceptance Criteria
- No orphan browser adapter in engine/core
- CanvasSurface either removed or correctly placed
- No behavior changes
