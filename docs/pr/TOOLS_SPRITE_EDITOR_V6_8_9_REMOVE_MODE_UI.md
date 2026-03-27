# TOOLS_SPRITE_EDITOR_V6_8_9_REMOVE_MODE_UI

## Purpose
Remove Mode selection (auto/standard/pro) and always operate in Pro view.

## Required Changes
- Remove any visible Mode UI (auto/standard/pro)
- Remove Mode labels from top bar or sidebar
- Ensure editor defaults to Pro behavior internally
- Remove any Mode switching logic from UI interactions
- Do NOT break existing Pro functionality

## Acceptance
- No Mode selector visible anywhere
- Editor behaves consistently as Pro
- No console errors
