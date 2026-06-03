# BUILD_PR - PR_26124_046-right-column-height-balance

## Purpose
Make the Palette Manager V2 right column allocate its height between Import/Export and Validation/Error Viewer without changing behavior or content.

## Scope
- `tools/palette-manager-v2/paletteManagerV2.css`
- PR workflow docs and required review artifacts only.

## Implementation
1. Convert `.palette-manager-v2__panel--right` to a flex column.
2. Make the first right-column accordion, Import/Export, fill the remaining panel height:
   - `flex: 1 1 auto`
   - `min-height: 0`
   - `overflow: auto`
3. Make the second right-column accordion, Validation/Error Viewer, keep content-sized height with a cap:
   - `flex: 0 0 auto`
   - `max-height: clamp(120px, 22vh, 260px)`
   - `overflow: auto`
4. Keep right-column accordion spacing controlled by the panel gap only.

## Boundaries
- Do not change Palette Manager behavior or content.
- Do not touch workspace/toolState/session logic.
- Do not touch sample JSON.
- Do not modify left or center panel layout.
- Do not modify `tools/shared`.
- Do not add dependencies.

## Validation
- Run a targeted browser style check for the right column.
- Run syntax checks only if JavaScript files change.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
