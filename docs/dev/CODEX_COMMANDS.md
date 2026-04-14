MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_10_16_AUTODISCOVER_FULLSCREEN_BEZEL_AND_BACKGROUND` as one small testable PR.

Implement convention-based autodiscovery and autodraw for these optional files:

- `games/<gameId>/assets/images/background.png`
- `games/<gameId>/assets/images/bezel.png`

Requirements:
1. `background.png`
   - if present, draw automatically
   - draw before game/world content
   - no user-added game code required

2. `bezel.png`
   - if present, draw automatically
   - only draw in fullscreen mode
   - draw in screen space
   - draw after gameplay/HUD by default
   - no user-added game code required

3. Architecture rules
   - do NOT use Parallax for bezel
   - keep implementation minimal and shared where appropriate
   - do not require explicit per-game registration
   - do not break games that do not have these files

4. Validation
   - add/update focused tests or validation coverage for:
     - autodetect present file
     - no-op when file missing
     - fullscreen gating for bezel
     - background draw-before-world behavior
   - verify Asteroids bezel candidate works from:
     `games/Asteroids/assets/images/bezel.png`

5. Final packaging step is REQUIRED
   - package ALL changed files into this exact repo-structured ZIP:
     `<project folder>/tmp/BUILD_PR_LEVEL_10_16_AUTODISCOVER_FULLSCREEN_BEZEL_AND_BACKGROUND.zip`

Hard rules:
- no commit-only result
- no missing ZIP
- no unrelated repo changes
