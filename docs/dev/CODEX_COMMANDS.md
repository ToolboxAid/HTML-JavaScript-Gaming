MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_10_21_VERIFY_CENTERED_CANVAS_BEZEL_AND_GAMEPLAY_BACKGROUND`.

Verify the completed Asteroids fullscreen bezel and gameplay-background implementation end to end.

Validation targets:

1. Centered canvas
   - internal resolution unchanged
   - canvas remains centered
   - no distortion in fullscreen
   - no viewport-stretch behavior

2. Bezel
   - no duplicated path resolution
   - HTML-layer rendering
   - visible only in fullscreen
   - visible on screen
   - transparency-window fit rule is active
   - shared stretch override is honored

3. Override file
   - if bezel exists and
     `games/<game>/assets/images/bezel.stretch.override.json`
     is missing,
     auto-create it during startup/init before gameplay
   - do not overwrite existing file

4. Background
   - separate from bezel
   - gameplay only
   - after clear
   - before starfield/world
   - visible during gameplay
   - absent during non-gameplay states

5. If validation finds real defects
   - make only the smallest required surgical fixes
   - do not expand scope

6. Final packaging step is REQUIRED
   - package ALL changed files into this exact repo-structured ZIP:
     `<project folder>/tmp/BUILD_PR_LEVEL_10_21_VERIFY_CENTERED_CANVAS_BEZEL_AND_GAMEPLAY_BACKGROUND.zip`

Hard rules:
- verification-focused PR
- keep fixes minimal
- no unrelated repo changes
- no missing ZIP
