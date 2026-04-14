
MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_10_22_TEMPLATE_BEZEL_BACKGROUND_CONVENTION_FOUNDATION`

1. Align games/_template structure with Asteroids asset conventions
2. Ensure shared pipeline handles:
   - backgroundImage (gameplay-only)
   - fullscreenBezel (fullscreen-only HTML layer)
3. Ensure override file:
   - auto-created at startup if bezel exists
   - not overwritten
4. Remove any game-specific coupling from shared code
5. Validate across template + Asteroids

Package:
<project folder>/tmp/BUILD_PR_LEVEL_10_22_TEMPLATE_BEZEL_BACKGROUND_CONVENTION_FOUNDATION.zip

Rules:
- minimal changes
- no unrelated edits
