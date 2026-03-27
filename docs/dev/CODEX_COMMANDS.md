MODEL: GPT-5.4
REASONING: medium

COMMAND:
Apply TOOLS_SPRITE_EDITOR_V6_3_REMOVE_DUPLICATE_FRAMES_UI_AND_FINISH_INPUT_REMAP in tools/SpriteEditor/main.js

VALIDATIONS:
- Only one frame UI remains, and it is the timeline
- Legacy duplicate Frames surface is removed
- ESC exits fullscreen only and does not close/cancel editor UI or interactions
- Ctrl+W closes menus
- Ctrl+W closes rename overlay
- Ctrl+W closes replace/confirm overlay
- Ctrl+W closes command palette
- Backspace cancels active interactions when not typing
- Backspace cancel shows visible cancel feedback
- Right-click still cancels active interactions
- No cancel-only history entry is created
- No console errors
