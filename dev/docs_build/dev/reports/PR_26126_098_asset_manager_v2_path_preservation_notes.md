# PR_26126_098 Asset Manager V2 Path Preservation Notes

## Behavior
- Asset Manager V2 now preserves the selected file path filename exactly.
- File paths no longer slugify, hyphenate, or lowercase filenames.
- Generated asset IDs still normalize filename segments for dot-path safety.
- Project-root path trimming still converts absolute repo paths to repo-relative asset paths.

## Examples
- `HTML-JavaScript-Gaming/src/assets/fonts/vector_battle/vector_battle.ttf` becomes `src/assets/fonts/vector_battle/vector_battle.ttf`.
- The generated ID for that font remains `assets.font.ui.vector-battle`.
- `HTML-JavaScript-Gaming/assets/video/8 mile.mp4` becomes `assets/video/8 mile.mp4`.
- The generated ID for that video remains `assets.video.cutscene.8-mile`.

## Validation
- Playwright validates `vector_battle.ttf` path preservation.
- Playwright validates `assets/video/8 mile.mp4` path preservation.
- Playwright validates ID-only normalization for the same selected files.
- Playwright validates preview path usage keeps the literal selected path.
