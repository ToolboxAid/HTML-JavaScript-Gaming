# BUILD_PR_LEVEL_10_15_TEMPLATE_ASSET_STRUCTURE_AND_FULLSCREEN_BEZEL_FOUNDATION

## Purpose
Bundle the next two valid changes into one testable PR:
1. Normalize `games/_template` so its asset directory structure matches Asteroids.
2. Establish a clear fullscreen bezel foundation before the next game.

## Scope

### A. `_template` asset structure alignment
Make `games/_template` match the Asteroids asset folder layout so future games start from the same normalized baseline.

Required target structure under:
`games/_template/assets/`

Expected folders/files baseline:
- `.gitkeep`
- `audio/`
- `fonts/`
- `images/`
- `palettes/`
- `parallax/`
- `parallax/data/.gitkeep`
- `sprites/`
- `sprites/data/.gitkeep`
- `tilemaps/`
- `tilemaps/data/.gitkeep`
- `tilesets/`
- `vectors/`
- `vectors/data/.gitkeep`

Rules:
- Match structure only
- Do not copy Asteroids-specific runtime content into `_template`
- Keep `_template` generic and ready for future games
- Preserve repo conventions already established in Asteroids

### B. Fullscreen bezel foundation
Asteroids already has a valid first candidate at:
`games/Asteroids/assets/images/bezel.png`

Decision:
- Bezel is **not** part of Parallax
- Bezel is **not** just a normal world background
- Bezel should render through a dedicated **screen-space fullscreen overlay surface**
- Bezel should only activate in fullscreen mode

Reason:
- Parallax is world/camera-relative content
- Bezel is display/compositing-relative content
- Some games may want an image drawn first, but that is a different concern and should remain a normal background/image system, not bezel behavior

Recommended abstraction:
- dedicated class or module, e.g. `FullscreenBezelOverlay` or `ScreenOverlayLayer`
- bezel responsibility should be explicit in name and render path

Required render behavior:
- Only considered when fullscreen is active
- Anchored to screen space, never camera space
- Supports draw order mode:
  - `overlay` = draw last (default bezel behavior)
  - `underlay` = optional future mode if a game intentionally uses the same system beneath gameplay/HUD
- Asteroids `bezel.png` is the first candidate asset, but the system must remain generic

## Testable Outcome
- `games/_template` has the normalized asset directory scaffold
- A dedicated bezel foundation contract is documented for Codex to implement
- Bezel is clearly separated from Parallax responsibilities
- Render order intent is explicit and testable
- PR returns a repo-structured ZIP at:
  `<project folder>/tmp/BUILD_PR_LEVEL_10_15_TEMPLATE_ASSET_STRUCTURE_AND_FULLSCREEN_BEZEL_FOUNDATION.zip`

## Non-Goals
- No engine core refactor beyond minimal bezel hook needed for the feature
- No migration of non-template games besides using Asteroids as the reference structure
- No generic background-image system in this PR
