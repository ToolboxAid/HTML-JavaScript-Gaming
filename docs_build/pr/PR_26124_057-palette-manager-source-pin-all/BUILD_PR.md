# BUILD_PR - PR_26124_057-palette-manager-source-pin-all

## Purpose
Implement one scoped Palette Manager V2 update: add Sample Palette Swatch `Pin All` for visible filtered source swatches and remove `Tag` sorting from Sample Palette Swatch only.

## Scope
- `toolbox/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Implementation
1. User Palette sort controls must keep:
   - Hue
   - Saturation
   - Brightness
   - Name
   - Tag
2. Sample Palette Swatch sort controls must include only:
   - Hue
   - Saturation
   - Brightness
   - Name
3. Add a `Pin All` button to Sample Palette Swatch.
4. `Pin All` must sit to the right of the Source palette dropdown with a compact local size bump.
5. `Pin All` must operate on `getVisibleSourceSwatches()` so current search/filter results are respected.
6. Each pinned swatch must keep source palette tracking and must not gain tags.
7. Duplicate skips must use the existing user swatch duplicate guards for name, RGB/hex, and symbol.
8. `Pin All` must report pinned and skipped counts in the validation/status area.
9. Individual pin/unpin behavior must remain intact.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Do not broadly refactor Palette Manager V2.

## Validation
- Syntax check changed JavaScript files.
- Run targeted served-browser Palette Manager V2 source sort and `Pin All` validation.
- Run targeted served-browser `Pin All` source dropdown placement and size validation.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
