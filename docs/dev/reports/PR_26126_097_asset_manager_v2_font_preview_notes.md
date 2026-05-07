# PR_26126_097 Asset Manager V2 Font Preview Notes

## Font Preview Rendering
- Font assets now use a scoped preview family derived from the selected asset ID.
- For `assets.font.ui.vector-battle`, the preview family is `asset-preview-assets-font-ui-vector-battle`.
- Font preview HTML includes a scoped `@font-face` rule and applies the same family to the preview sample text.
- The selected asset ID remains the source of truth for the preview font family.

## Path Resolution
- Font preview URLs continue to resolve through the active Workspace game root.
- During temporary `?workspace=UAT` UAT testing, `assets/fonts/vector-battle.ttf` resolves to `/games/Asteroids/assets/fonts/vector-battle.ttf`.
- Existing Workspace V2 font previews continue to resolve under `/games/Asteroids/assets/...` when `gameId=Asteroids` is active.

## Failure Reporting
- Asset Manager V2 attempts to load the preview font with the browser `FontFace` API when available.
- If the font load rejects, Asset Manager V2 writes a visible `FAIL Font preview failed for <asset-id>: <reason>` entry to Status.
- Stale async font load results are ignored when the selected preview changes before the load resolves.

## Validation
- Playwright validates the UAT `vector-battle.ttf` font preview URL under `/games/Asteroids/assets/fonts/vector-battle.ttf`.
- Playwright validates the scoped `@font-face` family is derived from `assets.font.ui.vector-battle`.
- Playwright validates a rejected font load writes a visible Status failure.
