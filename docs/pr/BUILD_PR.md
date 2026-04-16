# BUILD_PR_LEVEL_19_6_OVERLAY_MULTI_LAYER_COMPOSITION

## Purpose
Add testable multi-layer overlay composition so gameplay-safe overlays can render together in a predictable stack without visual conflicts.

## Roadmap Improvement
This PR advances Level 19 from stable overlay input handling to stable multi-overlay composition during gameplay.

## Scope
- Support composition of multiple active overlays in the same gameplay session
- Define deterministic layer ordering for composed overlays
- Prevent overlap and occlusion regressions caused by composed overlay rendering
- Validate composition in at least one gameplay-active sample

## Included
- Multi-layer composition rules for gameplay overlays
- Deterministic render ordering for composed overlays
- Focused validation for overlap, occlusion, and ordering behavior
- Status-only roadmap update instruction for this PR

## Excluded
- New overlay feature families
- Mission-system expansion
- Telemetry-system expansion
- Visual redesign of existing overlays
- Repo-wide render pipeline changes

## Execution Notes
- Preserve existing non-Tab overlay input behavior
- Preserve gameplay-first input priority
- Keep scope to the smallest executable/testable change
- Do not modify start_of_day folders
- Update roadmap status only; do not rewrite roadmap text

## Test Steps
1. Load a gameplay-active sample with overlay support
2. Activate multiple overlays in the same session
3. Verify render order matches the composition contract
4. Verify overlays remain readable and do not hide required gameplay information
5. Verify gameplay controls continue to work while multiple overlays are active

## Expected Result
- Multiple overlays can render together predictably
- Layer order remains stable
- No visual conflict or gameplay-input regression is introduced
