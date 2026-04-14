# BUILD_PR_LEVEL_10_20_FIX_BEZEL_PATH_AND_BACKGROUND_DRAW_ORDER

## Purpose
Prepare a docs-only BUILD_PR bundle for Codex to implement the confirmed Asteroids runtime fixes.

## Confirmed issues
1. Fullscreen bezel asset path is duplicated.
   Example bad URL:
   `http://127.0.0.1:5500/games/Asteroids/games/Asteroids/assets/images/bezel.png`

2. Canvas must keep its intended internal W x H dimensions and remain centered.

3. Background is still not visible and is likely being covered by starfield or another later draw pass.

4. Background should render only during gameplay, not attract, title, select-player, menu, or other non-gameplay states.

5. When a bezel image is loaded, the displayed canvas should be fit to the bezel transparency using the exact edge-detection rule below.

## Required implementation for Codex

### A. Fix fullscreen bezel path resolution
- Resolve bezel asset path exactly once.
- Use:
  `games/Asteroids/assets/images/bezel.png`
- Do not duplicate the `games/Asteroids/` prefix.
- Keep bezel as an HTML-level overlay above the canvas.

### B. Preserve canvas sizing and centering
- Do not resize the canvas internal game dimensions.
- Do not stretch the game resolution.
- Keep the game canvas centered.
- Preserve intended game width and height.

### C. Background draw order and state gating
- Keep `backgroundImage` separate from `fullscreenBezel`.
- `backgroundImage` draws to the canvas.
- Draw `backgroundImage` immediately after clear.
- Draw `backgroundImage` before starfield and before all other world/gameplay layers.
- Draw `backgroundImage` only during gameplay states.
- Do not draw `backgroundImage` during attract/title/select-player/menu/non-gameplay states.

### D. Bezel behavior
- Keep `fullscreenBezel` separate from canvas rendering.
- Render `fullscreenBezel` at the HTML/container level.
- Show bezel only while fullscreen is active.
- Ensure bezel is visibly on screen, not just present in the DOM.

### E. Exact bezel transparency fit rule
When `bezel.png` is loaded, determine the transparent gameplay window exactly as follows:

1. From left to right, find the first transparent pixel.
2. From right to left, find the first transparent pixel.
3. From top to bottom, find the first transparent pixel.
4. From bottom to top, find the first transparent pixel.

Use those four bounds as the bezel transparency window.

Then:
- maintain canvas aspect ratio
- stretch the displayed canvas to fill the transparency window as much as possible
- do not change internal game resolution
- keep the displayed canvas centered in that window

Selection rule:
- If top/bottom does not fill, use that result for resize.
- If left/right does not fill, use that result for resize.

Interpretation:
- the display box should be driven by the transparency bounds
- the goal is to fill the transparent gameplay area as fully as possible while keeping aspect ratio
- fallback to existing centered-canvas behavior only if a valid transparency window cannot be determined

## Validation targets
Codex must validate:
- bezel URL/path is not duplicated
- bezel is visible in fullscreen
- canvas internal dimensions are unchanged
- canvas remains centered
- transparency bounds are determined by the exact four-direction first-transparent-pixel rule
- displayed canvas fills the transparency window as fully as possible while preserving aspect ratio
- background is visible during gameplay
- background does not render in non-gameplay states
- starfield no longer hides background by draw order mistake

## Packaging requirement
Codex must package all changed files into:
`<project folder>/tmp/BUILD_PR_LEVEL_10_20_FIX_BEZEL_PATH_AND_BACKGROUND_DRAW_ORDER.zip`

## Scope guard
- Docs-first PR bundle only
- Codex writes implementation code
- No unrelated repo changes
