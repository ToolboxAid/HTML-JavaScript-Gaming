# Preview Generator V2 Write Path Logging

## Scope
- Added explicit per-write path logging to Preview Generator V2.
- Successful writes now log `OK WRITE` with:
  - target label/game name
  - resolved relative output path
  - absolute output path when the repo handle exposes one
  - source resolution context
- Preserved existing per-item `RUN`, `OUT`, `OK`, `WARN`, `FAIL`, and `SKIP` logging.
- Preserved summary counts for:
  - `Written`
  - `Warnings`
  - `Failed`
  - `Skipped`

## Successful Write Logging
- Workspace-launched Preview Generator V2 writes now identify:
  - `workspace.tools.preview-generator-v2.data`
  - selected game
  - resolved `assets/images` target
  - resolved relative preview path
  - handle-exposed absolute preview path when available.
- The Asteroids workspace flow logs:
  - `OK WRITE Asteroids`
  - `Resolved relative output path: games/Asteroids/assets/images/preview.svg`
  - `Absolute output path: HTML-JavaScript-Gaming/games/Asteroids/assets/images/preview.svg`
  - `Source resolution context: workspace.tools.preview-generator-v2.data; selected game: Asteroids; resolved assets/images target: assets/images; target type: games`

## Failure Logging
- Output path resolution now fails before capture/write when the target directory cannot be resolved.
- Failure logs include:
  - `FAIL PATH`
  - target label
  - exact target directory error
  - relative output path resolution state
  - absolute output path resolution state when available
  - source resolution context.
- Failed path resolution contributes to the existing summary `Failed` count.

## Guardrails
- No hidden fallback output paths were added.
- No sample JSON was modified.
- No roadmap content was modified.
- Existing batch logging and summary sections are preserved.

## Skipped
- Full samples smoke test was skipped by request. The changed surface is Preview Generator V2 write logging and is covered by the focused successful-write and failed-path-resolution Playwright coverage inside `npm run test:workspace-v2`.
