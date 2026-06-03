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

5. Current bezel fit is almost correct, but the displayed canvas is still slightly short of the bezel opening edges.

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

### F. Add one shared extra-stretch developer setting
Add one single variable that applies equally to all four sides of the detected bezel opening.

Intent:
- this is a small outward adjustment for cases where the fitted canvas is just short of the transparent edges
- one variable only
- same adjustment behavior for top, bottom, left, and right
- used after the transparency window is detected and before final display-box placement is applied

Decision:
- this should live in a small developer-facing config/override file, not buried in rules/code constants
- the location should be easy to find and edit

Required behavior:
- when a bezel is detected, check whether the bezel-fit override file exists
- if it does not exist, create it automatically for the developer
- include the shared extra-stretch variable in that file with a safe default
- keep the filename/location obvious and easy to discover near the game assets/config area
- use that single value to allow the developer to push the fitted canvas slightly farther toward all four opening edges

## Validation targets
Codex must validate:
- bezel URL/path is not duplicated
- bezel is visible in fullscreen
- canvas internal dimensions are unchanged
- canvas remains centered
- transparency bounds are determined by the exact four-direction first-transparent-pixel rule
- displayed canvas fills the transparency window as fully as possible while preserving aspect ratio
- shared extra-stretch variable affects all four sides equally
- override/config file is auto-created when bezel is detected and the file is missing
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
