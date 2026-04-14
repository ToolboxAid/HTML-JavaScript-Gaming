# BUILD_PR_LEVEL_10_17_HTML_FULLSCREEN_BEZEL_AND_CANVAS_BACKGROUND_SPLIT

## Purpose
Correct the implementation contract by separating bezel and background into two distinct systems with clear render ownership.

## Problem
The current behavior is wrong for your intended architecture:
- fullscreen bezel is not reliably visible
- background and bezel were coupled too closely
- bezel should render at the HTML level, not inside the game canvas
- background should render inside the canvas, immediately after clear and before everything else

## Required Architecture

### 1. `backgroundImage`
Create a dedicated class/module named:
- `backgroundImage`

Responsibilities:
- discover optional `games/<gameId>/assets/images/background.png`
- load and draw the image into the canvas
- render only after the canvas is cleared
- render before world, gameplay, sprites, HUD, and any other canvas content
- remain independent from fullscreen bezel logic

Canvas render order:
1. clear canvas
2. draw `backgroundImage` if present
3. draw all normal game/world content
4. draw existing HUD/canvas overlays as currently defined

### 2. `fullscreenBezel`
Create a dedicated class/module named:
- `fullscreenBezel`

Responsibilities:
- discover optional `games/<gameId>/assets/images/bezel.png`
- render as an HTML-layer element above the canvas
- only activate while fullscreen is active
- visually cover part of the canvas as a bezel/overlay
- do not draw through canvas render pipeline
- do not depend on Parallax

HTML-level behavior:
- attach bezel element to the game container or fullscreen host element
- size/position bezel to the fullscreen viewport/container
- hide bezel when not fullscreen
- no per-game manual code required

## Scope
- Split the current autodiscovery/render path into two explicit classes
- Rename responsibilities clearly:
  - `backgroundImage`
  - `fullscreenBezel`
- Keep zero-config asset discovery by filename convention:
  - `assets/images/background.png`
  - `assets/images/bezel.png`

## Testable Outcome
- `background.png` draws to canvas after clear and before anything else
- `bezel.png` appears as HTML overlay in fullscreen
- bezel and background have separate classes and separate code paths
- games without either file continue without error
- PR returns repo-structured ZIP at:
  `<project folder>/tmp/BUILD_PR_LEVEL_10_17_HTML_FULLSCREEN_BEZEL_AND_CANVAS_BACKGROUND_SPLIT.zip`

## Non-Goals
- No parallax redesign
- No generalized DOM overlay framework beyond bezel needs
- No user-authored registration code
