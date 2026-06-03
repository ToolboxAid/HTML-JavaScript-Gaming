# PLAN_PR - PR_26124_056-palette-manager-sort-toggle-direction

## Goal
Add independent ascending/descending toggle behavior to Palette Manager V2 User Palette and Sample/Source Palette sort controls.

## Scope
- `toolbox/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Preserve existing sorting logic where possible.
- Preserve pin/unpin, search, size, import/export behavior, lowercase tag normalization, and duplicate user-defined guards.

## Implementation Plan
1. Track sort key and sort direction independently for User Palette and Source Palette.
2. Add `Tag` to both User Palette and Source Palette sort controls.
3. On first click of a sort option, sort ascending.
4. On repeated clicks of the active sort option, toggle ascending and descending.
5. On click of a different sort option, switch to that key and reset to ascending.
6. Render active sort buttons with `▲` for ascending and `▼` for descending.
7. Keep inactive sort button labels unchanged.
8. Preserve existing shared Hue, Saturation, Brightness, and Name ascending sort behavior, reversing it for descending.
9. Sort Tag by normalized lowercase tag text, with no-tag swatches after tagged swatches in ascending order and reversed for descending.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by the Palette Manager V2-only sort update.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Confirm User Palette sort shows Hue, Saturation, Brightness, Name, and Tag.
3. Confirm Source Palette sort shows Hue, Saturation, Brightness, Name, and Tag.
4. Click a sort option once and confirm its active label shows `▲`.
5. Click the same option again and confirm it shows `▼` and reverses order.
6. Click it again and confirm it returns to `▲`.
7. Click a different sort option and confirm it resets to `▲`.
8. Confirm User Palette and Source Palette keep independent sort key/direction state.
