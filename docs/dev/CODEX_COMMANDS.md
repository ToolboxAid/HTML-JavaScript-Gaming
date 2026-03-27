MODEL: GPT-5.4
REASONING: medium

COMMAND:
Apply the V7.0 code-level fixes from docs/pr/PATCH_SNIPPETS.md into tools/SpriteEditor/main.js

VALIDATIONS:
- Ctrl+W not used anywhere in editor workflow
- Backspace cancels active interaction when not typing
- Selection move no longer clears original content incorrectly
- Palette sidebar scroll reaches the final color in large palettes
- Timeline Range is removed or fully correct
- Timeline header is visible
- Current color line renders as: Current: #AABBCC [■] Named: Sky Blue
- No console errors
