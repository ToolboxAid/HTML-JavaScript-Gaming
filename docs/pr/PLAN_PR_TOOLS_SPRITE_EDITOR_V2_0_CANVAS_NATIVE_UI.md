Toolbox Aid
David Quesenberry
03/26/2026
PLAN_PR_TOOLS_SPRITE_EDITOR_V2_0_CANVAS_NATIVE_UI.md

# PLAN_PR — Sprite Editor v2.0 (Canvas-Native UI)

## Goal
Re-engineer SpriteEditor into a canvas-native editor.

## Required review simplifier
All on-canvas controls are centralized in:
- SpriteEditorCanvasControlSurface

## Scope
- Single visible canvas
- On-canvas tools, frames, selection actions, preview, export, and status
- Minimal DOM only for bootstrapping, hidden import, and download support
- Tools/docs only
