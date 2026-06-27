# PR_26126_096 Asset Manager V2 Games-Only Workspace Context Notes

## Context Model
- Workspace preview context is now expressed as a games-only root: `games/<game>/`.
- Asset Manager V2 does not introduce Sample or Tool workspace roots for preview resolution.
- `projectId` is no longer treated as a game identifier fallback by the Asset Manager V2 Workspace bridge.
- Workspace game id lookup is limited to explicit game fields such as `gameId`, `game`, `metadata.gameId`, and `workspaceMetadata.gameId`.

## Preview Resolution
- File-backed Workspace asset paths stored as `assets/...` resolve to `games/<game>/assets/...` for preview only.
- Existing `games/...` paths, protocol URLs, palette URLs, and non-asset paths are left unchanged.
- Missing game context still produces a visible Status failure instead of falling back to `/assets/...`.

## Validation
- Playwright validates Workspace-launched Asset Manager V2 reports preview context as `games/Asteroids/`.
- Playwright validates that preview context does not contain `samples` or `tools` roots.
- Playwright validates audio, font, and image preview paths resolve under `/games/Asteroids/assets/...`.
