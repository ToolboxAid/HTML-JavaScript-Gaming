MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_10_17_HTML_FULLSCREEN_BEZEL_AND_CANVAS_BACKGROUND_SPLIT` as one small testable PR.

Implement the correction exactly as follows:

1. Add a dedicated canvas class/module named `backgroundImage`
   - autodiscover: `games/<gameId>/assets/images/background.png`
   - render into the canvas
   - draw immediately after screen clear
   - draw before ALL other game/world content
   - keep logic independent from bezel logic

2. Add a dedicated HTML-overlay class/module named `fullscreenBezel`
   - autodiscover: `games/<gameId>/assets/images/bezel.png`
   - render at the HTML/container level above the canvas
   - only show when fullscreen is active
   - hide when not fullscreen
   - no canvas drawing for bezel
   - no Parallax coupling

3. Remove any incorrect coupling between background and bezel behavior
   - separate classes
   - separate render paths
   - separate responsibilities

4. Validation/tests
   - cover background draw order: after clear, before world render
   - cover bezel fullscreen-only visibility
   - cover bezel attachment to HTML/container layer rather than canvas
   - verify Asteroids uses:
     - `games/Asteroids/assets/images/background.png` when present
     - `games/Asteroids/assets/images/bezel.png` in fullscreen

5. Final packaging step is REQUIRED
   - package ALL changed files into this exact repo-structured ZIP:
     `<project folder>/tmp/BUILD_PR_LEVEL_10_17_HTML_FULLSCREEN_BEZEL_AND_CANVAS_BACKGROUND_SPLIT.zip`

Hard rules:
- no commit-only result
- no missing ZIP
- no unrelated repo changes
