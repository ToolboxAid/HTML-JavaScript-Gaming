MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_10_20_FIX_BEZEL_PATH_AND_BACKGROUND_DRAW_ORDER`.

Implement the confirmed Asteroids runtime fixes:

1. Fix fullscreen bezel path duplication
   - current bad URL example:
     `http://127.0.0.1:5500/games/Asteroids/games/Asteroids/assets/images/bezel.png`
   - normalize asset path resolution so bezel resolves once to:
     `games/Asteroids/assets/images/bezel.png`

2. Preserve canvas layout
   - do NOT resize the canvas internal game dimensions
   - do NOT stretch the game resolution
   - keep canvas centered
   - preserve intended game width and height

3. Fix background rendering
   - keep `backgroundImage` as a separate class/module from `fullscreenBezel`
   - draw `backgroundImage` only during gameplay states
   - draw it immediately after clear
   - draw it before starfield and before all other world/gameplay content
   - inspect Asteroids render order and fix any layer that currently hides the background

4. Keep bezel as HTML overlay
   - keep `fullscreenBezel` as a separate HTML/container-level overlay
   - only show it in fullscreen
   - ensure it is visibly on screen, not just present in the DOM

5. Use this exact bezel transparency fit rule
   - from left to right, find first transparent pixel
   - from right to left, find first transparent pixel
   - from top to bottom, find first transparent pixel
   - from bottom to top, find first transparent pixel
   - use those four values as the transparency window
   - maintain canvas aspect ratio
   - stretch the displayed canvas to fill the transparency window as much as possible
   - keep the displayed canvas centered in that window
   - do NOT change internal game resolution
   - if top/bottom does not fill, use that result for resize
   - if left/right does not fill, use that result for resize
   - if no valid transparency window is found, fall back to existing centered-canvas behavior

6. Add one shared extra-stretch setting
   - create one single developer-facing variable that applies equally to all four sides
   - use it to push the displayed canvas slightly farther toward the bezel opening edges when the default fit is just short
   - place this in a small easy-to-find config/override file, not hidden in code constants
   - when bezel is detected, check whether that file exists
   - if it does not exist, create it automatically for the developer with a safe default value
   - keep filename/location obvious near the relevant game asset/config area

7. Validate
   - bezel URL/path not duplicated
   - bezel visible in fullscreen
   - canvas internal size unchanged
   - canvas centered
   - exact four-direction transparency rule used
   - displayed canvas fills transparency window as fully as possible while preserving aspect ratio
   - shared extra-stretch variable affects all four sides equally
   - override/config file is auto-created when missing and bezel is detected
   - background visible during gameplay
   - background absent in non-gameplay states
   - starfield no longer hides background incorrectly

8. Final packaging step is REQUIRED
   - package ALL changed files into this exact repo-structured ZIP:
     `<project folder>/tmp/BUILD_PR_LEVEL_10_20_FIX_BEZEL_PATH_AND_BACKGROUND_DRAW_ORDER.zip`

Hard rules:
- write implementation code only through Codex
- include changed implementation files in Codex ZIP
- no docs-only completion by Codex
- no missing ZIP
- no unrelated repo changes
