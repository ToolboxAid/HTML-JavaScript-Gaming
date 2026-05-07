# PR_26126_101 Asset Manager V2 Keyboard Navigation Notes

## Asset Tile Navigation
- Asset tiles now support ArrowRight and ArrowDown for next tile selection.
- Asset tiles now support ArrowLeft and ArrowUp for previous tile selection.
- Navigation follows the rendered/sorted tile order: type, then role, then ID.
- Arrow navigation clamps at the first and last tile instead of wrapping.

## Selection Updates
- Arrow navigation calls the same selection path used by tile clicks.
- Selected Asset Detail updates to the new asset ID, type/kind, role, and path.
- The center preview updates to the newly selected asset type.
- Focus moves to the newly selected tile button after the re-render.

## Validation
- Playwright validates adjacent keyboard selection from audio to image and back.
- Playwright validates Selected Asset Detail, preview type, and focused tile all update together.
