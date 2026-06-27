# BUILD_PR - PR_26124_056-palette-manager-sort-toggle-direction

## Purpose
Implement one scoped Palette Manager V2 sort update: toggle ascending/descending direction independently for User Palette and Sample/Source Palette sort controls.

## Scope
- `toolbox/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Implementation
1. Track current sort key and sort direction for User Palette.
2. Track current sort key and sort direction for Source Palette.
3. Sort controls for both palettes must include:
   - Hue
   - Saturation
   - Brightness
   - Name
   - Tag
4. First click on a sort option applies ascending sort.
5. Clicking the active sort option toggles descending.
6. Clicking the active sort option again toggles back to ascending.
7. Clicking a different sort option resets direction to ascending.
8. Active sort buttons must visually indicate direction with `▲` or `▼`.
9. Hue, Saturation, and Brightness use numeric ascending/descending behavior.
10. Name uses case-insensitive ascending/descending string behavior.
11. Tag uses normalized lowercase tag text.
12. Tag ascending places swatches with no tags after tagged swatches; descending reverses that order.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Do not broadly refactor Palette Manager V2.

## Validation
- Syntax check changed JavaScript files.
- Run targeted served-browser Palette Manager V2 sort toggle and direction indicator check.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
