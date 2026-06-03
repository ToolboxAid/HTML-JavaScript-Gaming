# PR_26126_093 Asset Manager V2 Preview Path Resolution Notes

## Workspace Context
- Asset Manager V2 now passes Workspace V2 preview context into shared asset preview helpers.
- The preview context reads `gameId` from the Workspace V2 host context or query string.
- When Workspace mode is active and an asset path starts with `assets/`, previews resolve from `games/<gameId>/assets/...`.

## Media Coverage
- Audio preview `src` resolves from the Workspace game asset root.
- Image preview `src` resolves from the Workspace game asset root.
- Font preview `@font-face src` resolves from the Workspace game asset root.
- Absolute paths, protocol URLs, `palette://workspace/...`, and existing `games/...` paths are left unchanged.

## Validation
- Playwright validates these resolved paths with `gameId: "Asteroids"`:
  - `/games/Asteroids/assets/audio/fire.wav`
  - `/src/assets/fonts/vector_battle/vector_battle.ttf`
  - `/games/Asteroids/assets/images/preview.png`
