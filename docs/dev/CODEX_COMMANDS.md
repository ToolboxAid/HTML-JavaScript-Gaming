MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_10_19_REAL_IMPLEMENTATION_DELTA_FULLSCREEN_BEZEL_AND_BACKGROUND` as a real implementation PR, not a docs-only PR.

Assume these files already exist and are the correct conventions:
- `games/Asteroids/assets/images/background.png`
- `games/Asteroids/assets/images/bezel.png`

Implement all of the following with actual runtime code changes:

1. Add/use a dedicated `backgroundImage` class/module
   - autodiscover `games/<gameId>/assets/images/background.png`
   - canvas-rendered
   - draw immediately after clear
   - draw before all world/gameplay content
   - render ONLY during gameplay states
   - do NOT render in attract/title/select-player/menu/non-gameplay states

2. Add/use a dedicated `fullscreenBezel` class/module
   - autodiscover `games/<gameId>/assets/images/bezel.png`
   - HTML/container level overlay above canvas
   - only visible in fullscreen
   - must be visibly on screen, not DOM-only
   - verify/fix sizing, positioning, stacking context, host attachment, z-index, overflow, opacity, and fullscreen lifecycle wiring

3. Add focused tests/validation covering:
   - gameplay-only background gating
   - background draw order after clear and before world render
   - fullscreen bezel visibility on screen
   - bezel hidden outside fullscreen
   - no-op when files are missing

4. REQUIRED OUTPUT CONTENT
   The final ZIP MUST include actual changed implementation files.
   Docs-only output is not acceptable.

5. Final packaging step is REQUIRED
   Package ALL changed files into this exact repo-structured ZIP:
   `<project folder>/tmp/BUILD_PR_LEVEL_10_19_REAL_IMPLEMENTATION_DELTA_FULLSCREEN_BEZEL_AND_BACKGROUND.zip`

Hard rules:
- do real implementation work
- include changed source files in the ZIP
- no docs-only completion
- no missing ZIP
- no unrelated repo changes
