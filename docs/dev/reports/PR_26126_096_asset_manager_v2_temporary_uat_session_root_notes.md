# PR_26126_096 Asset Manager V2 Temporary UAT Session Root Notes

## Temporary Behavior
- `?workspace=UAT` remains isolated in `TemporaryUatWorkspace.js`.
- For UAT preview/path testing only, `?workspace=UAT` now provides the temporary game root `games/Asteroids/`.
- The temporary root is used only by Asset Manager V2 preview options.
- Asset records still store normalized asset paths such as `assets/images/uat-preview.png`; the game root is not persisted into asset entries.
- The code and Status log both mark this behavior as temporary UAT-only.

## Preview Result
- During `?workspace=UAT`, file-backed previews for `assets/...` paths resolve through `/games/Asteroids/assets/...`.
- The temporary preview path does not use Sample or Tool roots.
- Palette color behavior remains unchanged and still uses the temporary sample palette swatches only.

## Validation
- Playwright validates the temporary Status message for `games/Asteroids/`.
- Playwright validates a `?workspace=UAT` image asset preview renders with `/games/Asteroids/assets/images/uat-preview.png`.
- Playwright validates the UAT preview path excludes `/samples/` and `/tools/`.
