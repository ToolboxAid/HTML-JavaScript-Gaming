# PR_26126_095 Asset Manager V2 Preview Path Resolution Notes

## Workspace Game Context
- Workspace V2 now carries the active game identifier from `?gameId=` or `?game=` into the Asset Manager V2 host context.
- Launching Asset Manager V2 from Workspace V2 preserves the active game identifier in the tool URL when available.
- Asset Manager V2 preview helpers resolve Workspace asset paths that start with `assets/` to `games/<gameId>/assets/...`.
- Existing protocol URLs, existing `games/...` paths, and non-asset paths are left unchanged.
- `Asteroids` is used only as Playwright fixture data for path assertions.

## Missing Context Failure
- In Workspace mode, an `assets/...` preview path without a game identifier no longer falls back to `/assets/...`.
- The preview helper returns an empty preview path plus a failure message when the game context is missing.
- Asset Manager V2 routes that failure through the visible Status log.
- Duplicate preview failure messages are suppressed until the preview error changes or clears.

## Validation
- Playwright validates Workspace-launched audio, font, and image previews resolve under `/games/Asteroids/assets/...`.
- Playwright validates Asset Manager V2 launched from Workspace V2 includes `gameId=Asteroids` when the Workspace URL provides it.
- Playwright validates missing game context logs `FAIL Preview path assets/audio/fire.wav cannot be resolved because Workspace V2 game context is missing.`
- Playwright validates missing game context does not render an audio preview source.
