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
   - do NOT resize the canvas
   - do NOT stretch the canvas to the viewport
   - keep canvas centered
   - preserve intended game W x H dimensions

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

5. Validate
   - bezel URL/path not duplicated
   - bezel visible in fullscreen
   - canvas size unchanged
   - canvas centered
   - background visible during gameplay
   - background absent in non-gameplay states
   - starfield no longer hides background incorrectly

6. Final packaging step is REQUIRED
   - package ALL changed files into this exact repo-structured ZIP:
     `<project folder>/tmp/BUILD_PR_LEVEL_10_20_FIX_BEZEL_PATH_AND_BACKGROUND_DRAW_ORDER.zip`

Hard rules:
- write implementation code only through Codex
- include changed implementation files in Codex ZIP
- no docs-only completion by Codex
- no missing ZIP
- no unrelated repo changes
